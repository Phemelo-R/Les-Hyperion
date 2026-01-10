// runner.mjs - module script that powers both about.html (reads metadata) and interactive.html
// Uses Pyodide and WebR for in-browser Python and R execution.
// Note: this file expects modern browsers supporting ES modules.

const metaPath = 'metadata.json';

async function fetchMeta() {
  try {
    const r = await fetch(metaPath);
    if (!r.ok) throw new Error('meta not found');
    return await r.json();
  } catch (e) {
    return {
      siteIntro: "Les Hyperion — analyses in GIS, Quantitative Ecology & Biostatistics.",
      author: "Phemelo-R",
      created: "2025-04-10",
      updated: "2026-01-10",
      frequency: "Irregular",
      analyses: "GIS, Quantitative Ecology, Biostatistics"
    };
  }
}

function setThemeFromStorage() {
  const theme = localStorage.getItem('lh-theme') || 'dark';
  if (theme === 'dark') document.documentElement.classList.remove('theme-light');
  else document.documentElement.classList.add('theme-light');
}
function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('theme-light');
  localStorage.setItem('lh-theme', isLight ? 'light' : 'dark');
}

// Populate About page
(async function initAboutAndControls(){
  setThemeFromStorage();
  document.querySelectorAll('#toggle-theme').forEach(btn => btn.addEventListener('click', toggleTheme));

  const meta = await fetchMeta();
  const elIntro = document.getElementById('site-intro');
  if (elIntro) elIntro.textContent = meta.siteIntro || '';
  const fields = [
    ['meta-author','author'],
    ['meta-created','created'],
    ['meta-updated','updated'],
    ['meta-frequency','frequency'],
    ['meta-analyses','analyses'],
    ['footer-author','author']
  ];
  fields.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el && meta[key]) el.textContent = meta[key];
  });
  const fy = document.getElementById('footer-year');
  if (fy) fy.textContent = (meta.updated || meta.created || new Date().getFullYear()).slice(0,4);
})();

// -------------------- Interactive runner --------------------
let pyodide = null;
let webR = null;
let runtimesLoaded = false;

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.23.2/full/"; // version may be updated later
const WEBR_MJS = "https://webr.r-wasm.org/webr.mjs";

function logToConsole(text, kind = 'log') {
  const el = document.getElementById('console');
  if (!el) return;
  const mark = kind === 'err' ? '[ERR] ' : '';
  el.textContent += mark + text + '\n';
  el.scrollTop = el.scrollHeight;
}

function clearConsole() {
  const el = document.getElementById('console');
  if (el) el.textContent = '';
  const pl = document.getElementById('plot-container');
  if (pl) pl.innerHTML = '';
}

async function loadRuntimes(statusEl) {
  statusEl.textContent = 'Loading runtimes...';
  try {
    // Load Pyodide
    if (!pyodide) {
      logToConsole('Loading Pyodide (Python runtime)...');
      // dynamic import
      // eslint-disable-next-line no-undef
      pyodide = await loadPyodide({ indexURL: PYODIDE_CDN });
      await pyodide.loadPackage(['numpy','matplotlib','pandas','scipy']);
      logToConsole('Pyodide ready.');
    }

    // Load WebR
    if (!webR) {
      logToConsole('Loading WebR (R runtime)...');
      // dynamic import of WebR ESM
      const { WebR } = await import(WEBR_MJS);
      webR = new WebR();
      await webR.init();
      logToConsole('WebR ready.');
    }

    runtimesLoaded = true;
    statusEl.textContent = 'Runtimes: ready';
    document.getElementById('run-btn').disabled = false;
  } catch (err) {
    console.error(err);
    logToConsole(String(err), 'err');
    statusEl.textContent = 'Runtimes: failed to load (see console)';
  }
}

async function runPython(code) {
  try {
    // Capture stdout/stderr
    const outputs = [];
    pyodide.runPython(`
import sys, js
class Capture:
    def write(self, s): js.log_to_console(s)
    def flush(self): pass
sys.stdout = Capture()
sys.stderr = Capture()
`);
    // Provide helper for plotting in a simple way: save matplotlib figure to PNG then create data URL
    const matplotlib = pyodide.pyimport('matplotlib');
    // Run the actual code
    await pyodide.runPythonAsync(code);
    logToConsole('Python execution finished.');
  } catch (err) {
    logToConsole(String(err), 'err');
  }
}

async function runR(code) {
  try {
    // Run R code and capture output; WebR produces results objects
    const result = await webR.evalR(code);
    // convert result to string
    const txt = await result.toString();
    logToConsole(txt || '[R returned no textual output]');
  } catch (err) {
    logToConsole(String(err), 'err');
  }
}

// setup event listeners for interactive.html
(function initInteractive() {
  const langEl = document.getElementById('language');
  const loadBtn = document.getElementById('load-runtime');
  const runBtn = document.getElementById('run-btn');
  const consoleEl = document.getElementById('console');
  const statusEl = document.getElementById('runtime-status');

  if (!loadBtn) return; // interactive not present

  // helper to expose log to Python via js.log_to_console
  window.log_to_console = (s) => { if (s !== undefined && s !== null) logToConsole(String(s)); };

  loadBtn.addEventListener('click', async () => loadRuntimes(statusEl));

  runBtn.addEventListener('click', async () => {
    clearConsole();
    const code = document.getElementById('code').value;
    logToConsole(`Running ${langEl.value}...`);
    if (langEl.value === 'python') {
      if (!pyodide) {
        logToConsole('Pyodide not loaded. Click "Load runtimes" first.', 'err');
        return;
      }
      // For convenience, wrap plotting: if matplotlib used, show inline figures by saving PNG and adding to plot-container
      // Provide a small helper in pyodide env
      await pyodide.runPythonAsync(`
from js import log_to_console
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
def _show_figs():
    import io, base64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    data = base64.b64encode(buf.read()).decode('ascii')
    js_data = "data:image/png;base64," + data
    from js import document
    container = document.getElementById('plot-container')
    img = document.createElement('img')
    img.src = js_data
    container.appendChild(img)
`);
      await runPython(code);
    } else {
      if (!webR) {
        logToConsole('WebR not loaded. Click "Load runtimes" first.', 'err');
        return;
      }
      // Clear previous plots
      const plotContainer = document.getElementById('plot-container');
      if (plotContainer) plotContainer.innerHTML = '';
      // For R plotting, one approach is to evaluate R code that writes a PNG to the virtual filesystem and then read it out
      // We'll attempt a simple evaluation and console output.
      await runR(code);
      // Note: more advanced R plotting (rendering plot objects) can be added if you want image capture and display.
    }
  });

  document.getElementById('clear-console').addEventListener('click', clearConsole);

  // Example snippets
  const examples = {
    'py-plot': `import numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(0, 2*np.pi, 200)\nplt.plot(x, np.sin(x), label='sin')\nplt.plot(x, np.cos(x), label='cos')\nplt.legend()\nplt.title('Sine and Cosine')\nplt.show()\nprint('Done plotting')`,
    'py-numpy': `import numpy as np\na = np.random.normal(size=(1000,))\nprint('mean =', a.mean())\nprint('std  =', a.std())`,
    'r-plot': `# simple R plot\nx <- seq(0, 2*pi, length.out=200)\nplot(x, sin(x), type='l', col='blue')\nlines(x, cos(x), col='red')\ncat('Plotted sin and cos\\n')`,
    'r-summary': `# R summary example\nv <- rnorm(100)\nsummary(v)\n`
  };
  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = btn.getAttribute('data-snippet');
      const codeEl = document.getElementById('code');
      codeEl.value = examples[key] || '';
    });
  });

  // Pre-load a snippet
  document.getElementById('code').value = examples['py-plot'];
})();
