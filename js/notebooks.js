/* ============================================================
   Les Hyperion — Notebooks Page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash) {
    const file = decodeURIComponent(window.location.hash.slice(1));
    const nb   = NOTEBOOKS.find(n => n.file === file);
    if (nb) { openViewer(nb); return; }
  }
  renderGrid();

  window.addEventListener('popstate', () => {
    if (window.location.hash) {
      const file = decodeURIComponent(window.location.hash.slice(1));
      const nb   = NOTEBOOKS.find(n => n.file === file);
      if (nb) { openViewer(nb); return; }
    }
    closeViewer();
  });
});

/* ============================================================
   Grid
   ============================================================ */
function renderGrid() {
  const filterBar = document.getElementById('filter-bar');
  const listWrap  = document.getElementById('notebooks-list');
  if (!filterBar || !listWrap) return;

  const sortedCats = Object.entries(CATEGORIES)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([name]) => name);

  const allBtn = makeFilterBtn('All', true);
  allBtn.addEventListener('click', () => setFilter('All'));
  filterBar.appendChild(allBtn);

  sortedCats.forEach(cat => {
    const btn = makeFilterBtn(cat, false);
    btn.addEventListener('click', () => setFilter(cat));
    filterBar.appendChild(btn);
  });

  renderCategories('All');

  function setFilter(cat) {
    filterBar.querySelectorAll('.filter-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.cat === cat));
    renderCategories(cat);
  }

  function renderCategories(filter) {
    listWrap.innerHTML = '';
    const cats = filter === 'All' ? sortedCats : sortedCats.filter(c => c === filter);

    cats.forEach(cat => {
      const items = NOTEBOOKS
        .filter(nb => nb.category === cat)
        .sort((a, b) => (a.part || 99) - (b.part || 99) || a.date.localeCompare(b.date));
      if (!items.length) return;

      const catCfg = CATEGORIES[cat] || {};
      const color  = catCfg.color || 'var(--accent)';

      const section = document.createElement('div');
      section.className = 'cat-section fade-up';
      section.style.setProperty('--cat-color', color);
      section.innerHTML = `
        <div class="cat-section-head">
          <div>
            <div class="cat-section-title">${cat}</div>
            <div class="cat-section-desc">${catCfg.blurb || ''}</div>
          </div>
          <span class="cat-section-count">${items.length} notebook${items.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="nb-grid" id="grid-${cat.replace(/\s+/g,'-')}"></div>`;
      listWrap.appendChild(section);

      const grid = section.querySelector('.nb-grid');
      items.forEach(nb => {
        const card = window.buildNbCard(nb, color);
        card.addEventListener('click', () => {
          history.pushState(null, '', `#${nb.file}`);
          openViewer(nb);
        });
        grid.appendChild(card);
      });
    });

    // Fade-up observer
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    listWrap.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

    initLazyPreviews();
  }
}

function makeFilterBtn(label, active) {
  const btn = document.createElement('button');
  btn.className   = 'filter-btn' + (active ? ' active' : '');
  btn.textContent = label;
  btn.dataset.cat = label;
  return btn;
}

/* ============================================================
   Lazy real-code previews
   ============================================================ */
function initLazyPreviews() {
  const previews = document.querySelectorAll('.nb-preview[data-nb-file]');
  if (!previews.length) return;

  const cache = {};

  const obs = new IntersectionObserver(async entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      obs.unobserve(entry.target);

      const file    = entry.target.dataset.nbFile;
      const pattern = entry.target.querySelector('.nb-pattern');
      if (!pattern) continue;

      if (cache[file]) {
        renderPreviewLines(pattern, cache[file].lines);
        continue;
      }

      try {
        const res = await fetch(NOTEBOOK_BASE_PATH + file + '.ipynb');
        if (!res.ok) continue;
        const ipynb = await res.json();

        const cells = ipynb.cells || [];
        let firstCode = '';
        for (const cell of cells) {
          if (cell.cell_type === 'code') {
            const src = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
            if (src.trim()) { firstCode = src; break; }
          }
        }

        const lines = firstCode.split('\n').filter(l => l.trim()).slice(0, 6);
        cache[file] = { lines };
        renderPreviewLines(pattern, lines);
      } catch (e) { /* leave default preview */ }
    }
  }, { rootMargin: '200px' });

  previews.forEach(el => obs.observe(el));
}

function renderPreviewLines(pattern, lines) {
  if (!lines.length) return;
  pattern.innerHTML = `
    <div class="nb-cell-head">In [1]:</div>
    ${lines.map(l => {
      const esc = l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return esc.trimStart().startsWith('#')
        ? `<div class="nb-out-line">${esc}</div>`
        : `<div class="nb-code-line">${esc}</div>`;
    }).join('')}`;
}

/* ============================================================
   Viewer
   ============================================================ */
function openViewer(nb) {
  const viewer = document.getElementById('nb-viewer');
  const grid   = document.getElementById('notebooks-grid-section');
  const footer = document.getElementById('grid-footer');
  if (!viewer) return;

  viewer.querySelector('#vwr-breadcrumb-nb').textContent = nb.title;
  viewer.querySelector('#vwr-file-title').textContent    = nb.file + '.ipynb';

  viewer.classList.add('open');
  if (grid)   grid.style.display   = 'none';
  if (footer) footer.style.display = 'none';
  document.body.style.overflow = 'hidden';

  loadNotebook(nb);
}

function closeViewer() {
  const viewer = document.getElementById('nb-viewer');
  const grid   = document.getElementById('notebooks-grid-section');
  const footer = document.getElementById('grid-footer');
  if (!viewer) return;

  viewer.classList.remove('open');
  if (grid)   grid.style.display   = '';
  if (footer) footer.style.display = '';
  document.body.style.overflow = '';
  history.replaceState(null, '', window.location.pathname);
}

/* ============================================================
   Notebook loader
   ============================================================ */
async function loadNotebook(nb) {
  const body = document.getElementById('vwr-body');
  if (!body) return;

  body.innerHTML = `<div class="nb-loading">
    <div class="nb-loading-spinner"></div>
  </div>`;

  // Yield to browser so spinner paints before the fetch blocks
  await new Promise(r => requestAnimationFrame(r));


  let ipynb;
  try {
    const res = await fetch(NOTEBOOK_BASE_PATH + nb.file + '.ipynb');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    ipynb = await res.json();
  } catch (err) {
    body.innerHTML = `<div class="nb-error">
      <div style="font-size:2rem">📓</div>
      <p><strong>Could not load notebook.</strong></p>
      <p>Make sure <code>${nb.file}.ipynb</code> is in the <code>notebooks/</code> folder of your repo.</p>
      <p style="margin-top:.5rem;font-size:.8rem;color:var(--text-faint)">${err.message}</p>
    </div>`;
    return;
  }

  renderNotebook(body, nb, ipynb);
}

/* ============================================================
   Notebook renderer
   ============================================================ */
function renderNotebook(container, nb, ipynb) {
  const fmtDate = d => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); }
    catch(e) { return d; }
  };

  const lang = ipynb.metadata?.kernelspec?.language ||
               ipynb.metadata?.language_info?.name  ||
               nb.lang || 'R';

  const doc = document.createElement('div');
  doc.className = 'nb-doc';

  doc.innerHTML = `
    ${nb.series ? `<div class="nb-doc-series">${nb.series}${nb.part ? ' — Part ' + nb.part : ''}</div>` : ''}
    <div class="nb-doc-title">${nb.title}</div>
    <div class="nb-doc-meta">
      <span>✍ <strong>Author:</strong> Phemelo Rutlokoane</span>
      <span>📅 <strong>Date:</strong> ${fmtDate(nb.date)}</span>
      <span>🏷 <strong>Category:</strong> ${nb.category}</span>
      <span>💻 <strong>Language:</strong> ${lang}</span>
    </div>`;

  const cells = ipynb.cells || ipynb.worksheets?.[0]?.cells || [];
  let cellIdx = 0;

  cells.forEach(cell => {
    const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');

    if (cell.cell_type === 'markdown') {
      const div = document.createElement('div');
      div.className = 'nb-md-cell';

      // Resolve attachment images (dragged into notebook)
      const attachments = cell.attachments || {};
      let processedSrc = source;
      Object.entries(attachments).forEach(([filename, mimeMap]) => {
        const mimeType = Object.keys(mimeMap)[0];
        const b64data  = mimeMap[mimeType];
        const dataUri  = `data:${mimeType};base64,${b64data}`;
        processedSrc = processedSrc.replace(
          new RegExp(`attachment:${escapeRegex(filename)}`, 'g'),
          dataUri
        );
      });

      // Protect math before marked parses
      const { protected: safeSource, restore } = protectMath(processedSrc);

      let html = window.marked
        ? window.marked.parse(safeSource)
        : simpleMarkdown(safeSource);

      div.innerHTML = restore(html);

      // ---- Figure captions ----
      // Any image with non-empty alt text gets wrapped in <figure><figcaption>
      div.querySelectorAll('img').forEach(img => {
        const alt = (img.getAttribute('alt') || '').trim();
        if (!alt || alt === 'image' || alt.startsWith('data:')) return; // skip empty/generic/base64 alts
        const figure = document.createElement('figure');
        figure.className = 'nb-figure';
        const caption = document.createElement('figcaption');
        caption.className = 'nb-figcaption';
        caption.textContent = alt;
        img.parentNode.insertBefore(figure, img);
        figure.appendChild(img);
        figure.appendChild(caption);
      });

      doc.appendChild(div);

    } else if (cell.cell_type === 'code' && source.trim()) {
      cellIdx++;
      const execCount = cell.execution_count || cellIdx;

      const cell_div = document.createElement('div');
      cell_div.className = 'nb-code-cell';

      cell_div.innerHTML = `
        <div class="nb-code-bar">
          <div class="nb-code-bar-left">
            <span class="nb-code-lang-badge">${lang}</span>
            <span class="nb-exec-count">In [${execCount}]</span>
          </div>
          <button class="nb-copy-btn"><span>Copy</span></button>
        </div>`;

      const pre  = document.createElement('pre');
      pre.className = 'nb-code-pre';
      const code = document.createElement('code');
      code.className = lang.toLowerCase() === 'python' ? 'language-python' : 'language-r';
      code.textContent = source;
      pre.appendChild(code);
      cell_div.appendChild(pre);

      if (window.hljs) window.hljs.highlightElement(code);

      // Copy button
      const copyBtn = cell_div.querySelector('.nb-copy-btn');
      copyBtn.addEventListener('click', e => {
        e.stopPropagation();
        const span = copyBtn.querySelector('span');
        const done = () => {
          span.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => { span.textContent = 'Copy'; copyBtn.classList.remove('copied'); }, 2000);
        };
        navigator.clipboard?.writeText(source).then(done).catch(() => {
          const ta = document.createElement('textarea');
          ta.value = source; document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); ta.remove(); done();
        });
      });

      // Outputs
      (cell.outputs || []).forEach(output => {
        if (!output) return;
        const outDiv = document.createElement('div');
        outDiv.className = 'nb-output' + (output.output_type === 'error' ? ' nb-output-error' : '');

        const label = document.createElement('div');
        label.className   = 'nb-output-label';
        label.textContent = output.output_type === 'error' ? 'Error' : 'Output';
        outDiv.appendChild(label);

        const textData = output.text || output.data?.['text/plain'];
        if (textData) {
          const text = Array.isArray(textData) ? textData.join('') : textData;
          const pre  = document.createElement('pre');
          pre.className = 'nb-output-text';
          // Strip ANSI escape codes (colour, bold, italic, etc.)
          pre.textContent = text.replace(/\x1b\[[0-9;]*[mGKHF]/g, '');
          outDiv.appendChild(pre);
        }

        if (output.data?.['image/png']) {
          const img = document.createElement('img');
          img.className = 'nb-output-img';
          img.src = 'data:image/png;base64,' + output.data['image/png'];
          img.alt = 'Output figure';
          outDiv.appendChild(img);
        }

        if (output.output_type === 'error' && output.traceback) {
          const pre = document.createElement('pre');
          pre.className   = 'nb-output-text';
          pre.textContent = output.traceback.join('\n').replace(/\x1b\[[0-9;]*m/g, '');
          outDiv.appendChild(pre);
        }

        cell_div.appendChild(outDiv);
      });

      doc.appendChild(cell_div);
    }
  });

  container.innerHTML = '';
  container.appendChild(doc);

  // Render math after DOM is built
  if (window.MathJax?.typesetPromise) {
    window.MathJax.typesetPromise([doc]).catch(err => console.warn('MathJax:', err));
  }
}

/* ============================================================
   Math protection — keeps $...$ and $$...$$ safe from marked
   ============================================================ */
function protectMath(src) {
  const blocks = [];
  const protect = match => { blocks.push(match); return `MATHPLACEHOLDER_${blocks.length - 1}_END`; };
  const out = src
    .replace(/\$\$[\s\S]*?\$\$/g, protect)
    .replace(/\$[^\$\n]+?\$/g,    protect);
  const restore = html =>
    html.replace(/MATHPLACEHOLDER_(\d+)_END/g, (_, i) => blocks[parseInt(i)]);
  return { protected: out, restore };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ---- Fallback markdown ---- */
function simpleMarkdown(src) {
  return src
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^# (.+)/gm,   '<h1>$1</h1>')
    .replace(/^## (.+)/gm,  '<h2>$1</h2>')
    .replace(/^### (.+)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,     '<em>$1</em>')
    .replace(/`(.+?)`/g,       '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>').replace(/^/, '<p>').replace(/$/, '</p>');
}