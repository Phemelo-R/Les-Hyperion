import fs from 'node:fs';
import prettier from 'prettier';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { sortResearch, researchStatus } from './research-utils.mjs';
import { renderWriting } from './research-writing.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
// Format generated pages before saving, so rebuilding keeps the HTML readable.
const pendingPages = [];
const formatOptions = await prettier.resolveConfig(path.join(root, 'index.html'));
const pageLocations = {
  'protocol.html': 'pages/protocol.html',
  'krill-research.html': 'pages/research/krill-research.html',
  'science-pseudoscience.html': 'pages/research/science-pseudoscience.html',
};
const write = (name, text) => {
  const original = name;
  name = pageLocations[name] || name;
  text = text.replace(/\b(href|src)="([^"]+)"/g, (match, attribute, url) => {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(url)) return match;
    const parts = url.match(/^([^?#]*)(.*)$/);
    const target = path.posix.normalize(
      path.posix.join(path.posix.dirname(original), parts[1]),
    );
    const rewritten = path.posix.relative(
      path.posix.dirname(name),
      pageLocations[target] || target,
    );
    return `${attribute}="${rewritten}${parts[2]}"`;
  });
  fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
  pendingPages.push(
    prettier
      .format(text.replace(/<pre\b/g, '<!-- prettier-ignore -->\n<pre'), {
        ...formatOptions,
        parser: 'html',
      })
      .then((formatted) => {
        fs.writeFileSync(path.join(root, name), formatted);
      }),
  );
};
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (letter) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[letter],
  );
const context = { window: {} };
vm.createContext(context);
vm.runInContext(
  read('js/data.js') + ';this.data={NOTEBOOKS,RESEARCH,CATEGORIES};',
  context,
);
const { NOTEBOOKS, RESEARCH, CATEGORIES } = context.data;
const landscapes = JSON.parse(read('data/json/landscapes.json'));
const portfolio = JSON.parse(read('data/json/portfolio.json'));
const plannedWork = JSON.parse(read('data/json/work-in-development.json'));
fs.writeFileSync(
  path.join(root, 'js/landscapes.js'),
  'window.LH_LANDSCAPES = ' + JSON.stringify(landscapes, null, 2) + ';\n',
);
const available = new Set(
  fs
    .readdirSync(path.join(root, 'notebooks'))
    .filter((name) => name.endsWith('.ipynb'))
    .map((name) => name.slice(0, -6)),
);
fs.mkdirSync(path.join(root, 'notebooks/read'), { recursive: true });
fs.mkdirSync(path.join(root, 'notebooks/media'), { recursive: true });
const galleries = sortResearch(
  JSON.parse(read('data/json/galleries.json')).map((gallery) => ({
    ...gallery,
    images:
      gallery.imagesSource === 'portfolio.json'
        ? portfolio.map((slot) => ({
            ...slot,
            caption: slot.title + ' — ' + slot.caption,
          }))
        : gallery.images,
  })),
);
// Emit a local script so reference data also works when opening the files directly.
const legacyFuel = JSON.parse(read('data/json/icao-legacy-curves.json'));
const addedFuel = JSON.parse(read('data/json/icao-v13-curves.json')).curves;
const carbonReference = {
  airports: JSON.parse(read('data/json/airports.json')).airports,
  aircraft: JSON.parse(read('data/json/carbon-aircraft.json')),
  operators: JSON.parse(read('data/json/carbon-operators.json')),
  landscapes: JSON.parse(read('data/json/carbon-landscapes.json')),
  configurations: JSON.parse(read('data/json/carbon-configurations.json')),
  legacyCurves: Object.keys(legacyFuel.curves).filter((code) => code !== '295'),
  curves: {
    ...Object.fromEntries(
      Object.entries(addedFuel).map(([code, values]) => [
        code,
        values.map((value, index) => [legacyFuel.stages[index], value]),
      ]),
    ),
    ...legacyFuel.curves,
  },
};
fs.writeFileSync(
  path.join(root, 'js/carbon/carbon-reference.js'),
  '/* Generated from data/json by npm run build. */\nwindow.CARBON_REFERENCE = ' +
    JSON.stringify(carbonReference, null, 2) +
    ';\n',
);
// One versioned runtime prevents a mixture of old and new carbon modules.
const carbonModules = [
  'carbon-reference',
  'carbon-math',
  'carbon-allocation',
  'carbon-store',
  'carbon-export',
  'carbon-workspace',
  'carbon-controls',
];
const carbonRuntime = `/* Les Hyperion carbon runtime — generated; edit the source modules. */
(function () {
  'use strict';
  try {
    if (!Element.prototype.replaceChildren) {
      Element.prototype.replaceChildren = function (...children) {
        while (this.firstChild) this.removeChild(this.firstChild);
        this.append(...children);
      };
    }
    ${carbonModules.map((name) => read('js/carbon/' + name + '.js')).join('\n;\n')}
    window.CarbonWorkspaceReady = true;
    document.getElementById('carbon-startup').hidden = true;
  } catch (error) {
    const notice = document.getElementById('carbon-startup');
    notice.hidden = false;
    notice.textContent = 'The tracker could not start: ' + error.message +
      '. Extract the full ZIP, open carbon.html in a web browser, and reload. Saved records have not been cleared.';
    console.error('Carbon startup:', error);
  }
})();\n`;
const carbonVersion = crypto
  .createHash('sha256')
  .update(carbonRuntime)
  .digest('hex')
  .slice(0, 12);
fs.writeFileSync(path.join(root, 'js/carbon/carbon-runtime.js'), carbonRuntime);
const carbonStyleVersion = crypto
  .createHash('sha256')
  .update(read('css/carbon-tracker.css'))
  .digest('hex')
  .slice(0, 12);
const icons = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  external: '<path d="M7 17 18 6M6 6h12v12"/>',
  moon: '<path d="M20.6 13.7A8.8 8.8 0 0 1 10.3 3.4a8.8 8.8 0 1 0 10.3 10.3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
};
const icon = (name, css = '') =>
  /* HTML */ `<svg
    class="${css}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    ${icons[name]}
  </svg>`;
const compass =
  '<svg class="compass-o" viewBox="0 0 36 46" aria-hidden="true"><circle cx="18" cy="23" r="14.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m18 1 4 17 14 5-14 4-4 18-4-18L0 23l14-5Z" fill="currentColor"/></svg>';
const logo = (prefix = '') =>
  /* HTML */ `<a
    class="brand"
    href="${prefix}index.html"
    aria-label="Les Hyperion — home"
    ><img
      class="brand-face"
      src="${prefix}assets/brand/silvi-face.png"
      alt=""
      width="55"
      height="59"
    /><span class="brand-name" aria-hidden="true">LES HYPERI${compass}N</span></a
  >`;
const navItems = [
  ['index', 'Home'],
  ['research', 'Research'],
  ['notebooks', 'Notebooks'],
  ['carbon', 'Carbon'],
  ['about', 'About'],
  ['cv', 'CV'],
];
const navigation = (current, prefix) =>
  navItems
    .map(
      ([url, label]) =>
        /* HTML */ `<a
          href="${prefix}${url}.html"
          ${current === url ? ' aria-current="page"' : ''}
          >${label}</a
        >`,
    )
    .join('');
function shell(
  title,
  nav,
  body,
  {
    prefix = '',
    styles = [],
    scripts = [],
    bodyClass = '',
    description = 'Spatial ecology, remote sensing and conservation by Phemelo Rutlokoane.',
  } = {},
) {
  return /* HTML */ `<!doctype html>
    <html lang="en-GB" data-theme="light">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>${escape(title)} — Les Hyperion</title>
        <meta name="description" content="${escape(description)}" />
        <meta name="theme-color" content="#0f2d3a" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="${prefix}assets/brand/favicon-32.png"
        />
        <link rel="icon" sizes="192x192" href="${prefix}assets/brand/favicon-192.png" />
        <link
          rel="apple-touch-icon"
          href="${prefix}assets/brand/apple-touch-icon.png"
        />
        <script src="${prefix}js/theme-init.js"></script>
        <link rel="stylesheet" href="${prefix}css/site.css" />
        <link rel="stylesheet" href="${prefix}css/silvi.css" />
        <link rel="stylesheet" href="${prefix}css/revision.css" />
        <link rel="stylesheet" href="${prefix}css/refinement.css" />
        ${styles.map((style) => /* HTML */ `<link rel="stylesheet" href="${prefix}${style}" />`).join('')}
      </head>
      <body class="${bodyClass}">
        <a class="skip-link" href="#main">Skip to content</a>
        <header class="site-header">
          <div class="container header-inner">
            ${logo(prefix)}
            <nav class="desktop-nav" aria-label="Main navigation">
              ${navigation(nav, prefix)}
            </nav>
            <div class="header-actions">
              <button
                class="icon-button theme-toggle"
                data-theme-toggle
                aria-label="Switch colour theme"
              >
                ${icon('moon', 'moon')}${icon('sun', 'sun')}</button
              ><button
                class="icon-button menu-toggle"
                aria-label="Open navigation"
                aria-expanded="false"
                aria-controls="mobile-nav"
              >
                ${icon('menu')}
              </button>
            </div>
          </div>
          <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>
            ${navigation(nav, prefix)}
          </nav>
        </header>
        <main id="main">${body}</main>
        <footer class="site-footer">
          <div class="container">
            <div class="footer-main">
              ${logo(prefix)}
              <p class="footer-thought">
                Understanding nature.<br />Sharing the evidence.
              </p>
              <nav class="footer-links" aria-label="Footer">
                <a href="${prefix}about.html">About Phemelo</a
                ><a href="${prefix}cv.html">CV</a
                ><a
                  href="https://github.com/Phemelo-R"
                  target="_blank"
                  rel="noopener noreferrer"
                  >GitHub ↗</a
                ><a href="#main">Back to top ↑</a>
              </nav>
            </div>
            <div class="footer-bottom">
              <span>© ${new Date().getFullYear()} Phemelo Rutlokoane</span
              ><span>Nature × Data × People</span
              ><span>Johannesburg, South Africa</span>
            </div>
          </div>
        </footer>
        <div class="toast" id="toast" role="status" hidden></div>
        <script src="${prefix}js/site.js"></script>
        <script src="${prefix}js/silvi.js"></script>
        ${scripts.map((script) => /* HTML */ `<script src="${prefix}${script}"></script>`).join('')}
      </body>
    </html>`;
}
function notebookRow(notebook, index, short = false) {
  const exists = available.has(notebook.file),
    href = `notebooks/read/${notebook.file}.html`;
  const date = new Date(notebook.date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return /* HTML */ `<article
    class="notebook-row"
    data-notebook
    data-category="${escape(notebook.category)}"
    data-search="${escape([notebook.title, notebook.desc, ...notebook.keywords].join(' ').toLowerCase())}"
  >
    <span class="notebook-index"
      >${String(notebook.part || index + 1).padStart(2, '0')}</span
    >
    <div>
      <h3 class="notebook-title">
        ${exists ? /* HTML */ `<a href="${href}">${escape(notebook.title)}</a>` : escape(notebook.title)}
      </h3>
      <p>${escape(notebook.desc)}</p>
      ${short ? '' : /* HTML */ `<div class="notebook-bottom"><span>${escape(notebook.keywords.join(' · '))}</span>${exists ? /* HTML */ `<a href="notebooks/${notebook.file}.ipynb" download>Download .ipynb</a>` : '<span class="unavailable">Notebook file not yet supplied</span>'}</div>`}
    </div>
    <div class="notebook-meta">
      <span>${short ? escape(notebook.category) : date}</span
      ><span>${exists ? 'R · Read & download' : 'Description only'}</span>
    </div>
    ${exists ? /* HTML */ `<a class="row-arrow" href="${href}" aria-label="Read ${escape(notebook.title)}">${icon('arrow')}</a>` : '<span aria-hidden="true">—</span>'}
  </article>`;
}

function scene(kind, caption, prefix = '', extra = '') {
  const asset = {
    welcome: 'unique-welcome',
    camera: 'unique-camera',
    field: 'silvi-spectral-v2',
    'research-overview': 'silvi-telescope-v3',
    'protocol-overview': 'unique-guide',
    protocol: 'silvi-protocol-v2',
    marine: 'unique-krill',
    ocean: 'unique-temperature',
    data: 'silvi-data-explorer',
    travel: 'silvi-carbon-v3',
    motorcycle: 'silvi-motorcycle-v3',
    bazaruto: 'silvi-bazaruto-v3',
    mnemba: 'silvi-mnemba-v3',
    okavango: 'silvi-okavango-v3',
    isimangaliso: 'silvi-isimangaliso-v3',
    cv: 'silvi-cv-v2',
    about: 'silvi-about-v2',
    soap: 'silvi-soap-v2',
    'notebook-Introduction_to_R': 'unique-r',
    'notebook-Data_Manipulation': 'unique-tidy',
    'notebook-Data_Visualisation': 'unique-charts',
    'notebook-Linear_Regression': 'unique-regression',
    'notebook-Generalized_Linear_Models': 'unique-glm',
    'notebook-Introduction_to_Machine_Learning': 'unique-ml',
    'notebook-Introduction_to_Spatial_Mapping999': 'unique-map',
    'notebook-Vector_Data_with_sf': 'unique-vector',
  }[kind];
  if (!asset) throw new Error(`No Silvi illustration for ${kind}`);
  const underwater = ['marine', 'ocean', 'bazaruto', 'mnemba'].includes(kind);
  return /* HTML */ `<figure class="silvi-scene ${extra}" data-silvi-scene="${kind}">
    <div class="silvi-stage">
      ${underwater ? `<div class="marine-background" aria-hidden="true"><img src="${prefix}assets/brand/habitat-${kind}.png" alt="" width="1536" height="1024" loading="lazy"></div>` : ''}
      <img
        src="${prefix}assets/brand/${asset}.png"
        alt="${escape(caption)}"
        width="480"
        height="250"
        loading="lazy"
      />
    </div>
  </figure>`;
}
const welcome = /* HTML */ `<section
  class="container silvi-introduction"
  aria-labelledby="silvi-introduction-title"
>
  ${scene('welcome', 'Silvi, the silvertree-inspired companion of Les Hyperion, waves hello.')}
  <div>
    <p class="eyebrow">A companion for the curious</p>
    <h2 id="silvi-introduction-title">Meet Silvi.</h2>
    <p>
      Inspired by the silvertree at the heart of my Honours research, Silvi is the
      companion I created for Les Hyperion. Her leaf crown and compass bring together
      nature, discovery and a sense of direction.
    </p>
    <p>
      She helps introduce the ideas behind the work: following krill, watching wildlife
      and exploring the tools of ecology. A familiar face, with a different role in each
      project.
    </p>
  </div>
</section>`;

const home = /* HTML */ `<div class="container">
    <section class="hero" aria-labelledby="hero-title">
      <div>
        <p class="eyebrow">Nature × Data × People</p>
        <h1 class="hero-title" id="hero-title">
          Explore.<br /><em>Analyse.</em><br />Conserve.
        </h1>
        <p class="hero-description">
          From field observations to a wider view of our planet. I use geospatial data,
          ecological research and reproducible code to understand the living world.
        </p>
        <div class="hero-actions">
          <a class="button" href="research.html">Explore my work ${icon('arrow')}</a
          ><a class="text-link" href="notebooks.html"
            >Open the notebooks ${icon('external')}</a
          >
        </div>
        <div class="hero-signoff">
          <p class="hero-person">
            Phemelo Rutlokoane · Quantitative ecology &amp; remote sensing
          </p>
        </div>
      </div>
      <div class="globe-panel">
        <div class="globe-topline">
          <span>Where my work spans</span><span>Southern &amp; East Africa</span>
        </div>
        <div class="globe-wrap" id="globe-wrap" data-pulse-city="Johannesburg">
          <canvas
            id="globe"
            tabindex="0"
            role="img"
            aria-label="Interactive globe showing eight places covered by my work. Select a place below, drag, or use arrow keys to rotate."
          ></canvas>
          <div class="globe-label">
            <span>Work &amp; research connections</span
            ><strong id="globe-place">Johannesburg</strong
            ><span id="globe-country">South Africa</span>
          </div>
        </div>
        <div class="globe-bottom">
          <p class="globe-scope-note">
            The landscapes connected by my work in ecology, data and conservation.
          </p>
          <div>
            <button class="globe-control" id="globe-reset">Re-centre</button
            ><button class="globe-control" id="globe-motion" aria-pressed="false">
              Pause
            </button>
          </div>
        </div>
        <div
          class="landscape-selector"
          role="group"
          aria-label="Places covered by my work"
        >
          ${landscapes.map((place, index) => `<button type="button" data-landscape="${index}" aria-pressed="${index === 0}">${escape(place.name)}<small>${escape(place.country)}</small></button>`).join('')}
        </div>
      </div>
    </section>
  </div>
  <div class="discipline-strip">
    <div class="container discipline-inner">
      ${['Spatial ecology', 'Remote sensing', 'Biostatistics', 'Conservation', 'Open knowledge'].map(escape).join('<span class="small-star">✦</span>')}
    </div>
  </div>
  ${welcome}
  <section class="section container">
    <div class="section-top">
      <div>
        <p class="eyebrow">Selected research / 2025</p>
        <h2>From the field to the canopy.</h2>
      </div>
      <a class="text-link" href="research.html">All research ${icon('arrow')}</a>
    </div>
    <div class="feature-story">
      <figure class="feature-photo">
        <img
          src="assets/web/fieldwork-1.jpg"
          alt="Silvertrees and field sampling on the slopes of Table Mountain"
          width="900"
          height="650"
          loading="lazy"
        />
        <figcaption class="image-note">
          <span>Table Mountain National Park</span><span>Honours research · 2025</span>
        </figcaption>
      </figure>
      <div class="feature-copy">
        <p class="eyebrow">BioSCape · Hyperspectral · LiDAR</p>
        <h2>A closer look at<br />the <em>silvertree.</em></h2>
        <p>
          Monitoring <em>Leucadendron argenteum</em> populations with NASA’s AVIRIS-NG
          imagery and LVIS LiDAR. My Honours research connects field observations with
          machine learning to map this endemic species across Table Mountain.
        </p>
        <a class="text-link" href="research.html#bioscape-sdm"
          >Explore the research ${icon('arrow')}</a
        >
        <div class="feature-meta">
          <span>University of the Western Cape</span><span>Honours research</span>
        </div>
      </div>
    </div>
  </section>
  <section class="section expertise-section">
    <div class="container">
      <div class="section-top">
        <div>
          <p class="eyebrow">Ways of seeing</p>
          <h2>Ecology, across scales.</h2>
        </div>
        <p>Connecting the detail of a field plot to the patterns visible from above.</p>
      </div>
      <div class="expertise-list">
        ${[
          [
            'Remote sensing',
            'Multispectral, hyperspectral and LiDAR analysis, from Landsat and Sentinel-2 to AVIRIS-NG.',
          ],
          [
            'GIS & spatial analysis',
            'Vector and raster workflows, cartographic design and spatial statistics in R and QGIS.',
          ],
          [
            'Biodiversity informatics',
            'Species distribution modelling, diversity metrics and ecological survey design.',
          ],
          [
            'Quantitative methods',
            'Time series, multivariate statistics and machine learning applied to ecological data.',
          ],
          [
            'Ocean climatology',
            'Sea surface temperature, marine heatwaves and oceanographic patterns in NOAA datasets.',
          ],
          [
            'Field research',
            'Biodiversity monitoring, vegetation sampling and the observations behind the models.',
          ],
        ]
          .map(
            ([title, desc], index) =>
              /* HTML */ `<div class="expertise-item">
                <span class="number">0${index + 1}</span>
                <div>
                  <h3>${title}</h3>
                  <p>${desc}</p>
                </div>
              </div>`,
          )
          .join('')}
      </div>
    </div>
  </section>
  <section class="section container">
    <div class="section-top">
      <div>
        <p class="eyebrow">The open notebook</p>
        <h2>Knowledge you can build on.</h2>
      </div>
      <a class="text-link" href="notebooks.html"
        >Browse all notebooks ${icon('arrow')}</a
      >
    </div>
    ${[NOTEBOOKS[0], NOTEBOOKS[4], NOTEBOOKS[10]].map((notebook, index) => notebookRow(notebook, index, true)).join('')}
  </section>
  <section class="container portrait-band">
    <img
      src="assets/web/portrait.jpg"
      width="220"
      height="245"
      alt="Phemelo Rutlokoane"
      loading="lazy"
    />
    <div>
      <p class="eyebrow">The person behind the work</p>
      <h2>Hi, I’m Phemelo.</h2>
      <p>
        An Honours graduate in Biodiversity and Conservation at the University of the
        Western Cape. I work where geospatial data meets ecology, and share the methods
        along the way.
      </p>
      <a class="text-link" href="about.html">A little about me ${icon('arrow')}</a>
    </div>
  </section>`;
write(
  'index.html',
  shell('Explore. Analyse. Conserve.', 'index', home, {
    scripts: [
      'assets/vendor/d3.min.js',
      'assets/vendor/topojson.min.js',
      'assets/vendor/world.js',
      'js/landscapes.js',
      'js/globe.js',
    ],
  }),
);
const archive = /* HTML */ `<div class="container">
  <header class="page-heading with-silvi">
    <div>
      <p class="eyebrow">Learn · Reproduce · Adapt</p>
      <h1>The open notebook.</h1>
      <p>
        R workflows for ecology, spatial analysis and machine learning. Read the
        methods, inspect the outputs and download the original notebooks.
      </p>
    </div>
    ${scene('data', 'Making sense of the data')}
  </header>
  <div class="archive-toolbar">
    <div
      class="filter-options"
      role="group"
      aria-label="Filter notebooks by collection"
    >
      <button class="filter-option" data-filter="all" aria-pressed="true">
        All collections</button
      >${Object.keys(CATEGORIES)
        .map(
          (category) =>
            /* HTML */ `<button
              class="filter-option"
              data-filter="${escape(category)}"
              aria-pressed="false"
            >
              ${escape(category === 'Spatial & Remote Sensing' ? 'Spatial & sensing' : category === 'Marine & Environmental' ? 'Marine' : category)}
            </button>`,
        )
        .join('')}
    </div>
    <label class="search-field"
      >${icon('search')}<span class="sr-only">Search notebooks</span
      ><input type="search" id="notebook-search" placeholder="Search the notebooks…"
    /></label>
  </div>
  <p class="archive-count" id="archive-count" role="status">
    ${NOTEBOOKS.filter((notebook) => available.has(notebook.file)).length} notebooks
    available · ${NOTEBOOKS.length} listed across ${Object.keys(CATEGORIES).length}
    collections
  </p>
  ${Object.entries(CATEGORIES)
    .map(
      ([category, config]) =>
        /* HTML */ `<section class="notebook-group" data-group="${escape(category)}">
          <div class="group-heading">
            <h2>${escape(category)}</h2>
            <p>${escape(config.blurb)}</p>
          </div>
          ${NOTEBOOKS.filter((notebook) => notebook.category === category)
            .map((notebook, index) => notebookRow(notebook, index))
            .join('')}
        </section>`,
    )
    .join('')}
  <p class="no-results" id="no-results" hidden>
    No notebooks match this search. Try another title, package or topic.
  </p>
</div>`;
write('notebooks.html', shell('Notebooks', 'notebooks', archive));
const sceneCaptions = {
  field: 'Surveying the silvertree canopy',
  marine: 'Following the krill, from day to night',
  ocean: 'Reading the ocean’s changing temperature',
  protocol: 'A field sheet for biodiversity',
};
const researchEntries = sortResearch(RESEARCH)
  .map((project) => {
    const projectScene = project.scene || 'field';
    const notebooks = project.notebooks
      .map((file) => {
        const title =
          NOTEBOOKS.find((notebook) => notebook.file === file)?.title ||
          file.replaceAll('_', ' ');
        const linked =
          available.has(file) && NOTEBOOKS.some((notebook) => notebook.file === file);
        return /* HTML */ `<li>
          ${linked ? /* HTML */ `<a href="notebooks/read/${file}.html">${escape(title)}</a>` : available.has(file) ? /* HTML */ `<a href="notebooks/${file}.ipynb" download>${escape(title)} · Download</a>` : `${escape(title)} <span class="unavailable">File not yet supplied</span>`}
        </li>`;
      })
      .join('');
    const hasText =
      project.content && !/blah-blah|to be continued/i.test(project.content);
    return /* HTML */ `<article
      class="research-entry"
      id="${project.id}"
      data-research-date="${escape(project.date || project.year || '')}"
    >
      <div class="research-year">
        ${escape(project.date || project.year || 'Undated')}
      </div>
      <div>
        <h2>${escape(project.title.replace(/\.$/, ''))}</h2>
        <p>${escape(project.desc)}</p>
        ${project.page ? /* HTML */ `<a class="text-link" href="${project.page}">${escape(project.linkLabel || 'Read the full protocol')} ${icon('arrow')}</a>` : ''}
        <details class="research-details">
          <summary>
            ${project.id === 'science-pseudoscience' ? 'About this essay' : project.page ? 'Project details & materials' : 'Project details & notebook availability'}
          </summary>
          <div class="research-details-body">
            ${scene(projectScene === 'protocol' ? 'protocol-overview' : projectScene, sceneCaptions[projectScene] || 'Exploring the research')}
            <div>
              <p class="research-context">
                ${escape(Array.isArray(project.authors) ? project.authors.join(', ') : project.authors)}
              </p>
              ${project.id === 'bioscape-sdm' ? '<p class="research-context">Honours fieldwork · 2025<br>Manuscript under review · JGR: Biogeosciences, 2026</p>' : ''}${
                notebooks
                  ? /* HTML */ `<ul>
                      ${notebooks}
                    </ul>`
                  : ''
              }${hasText ? /* HTML */ `<div class="research-full-text">${project.content}</div>` : project.page ? `<p class="research-context">${escape(project.id === 'science-pseudoscience' ? 'A written evaluation of product claims and supporting evidence. No computational analysis accompanies this essay.' : project.id === 'dvm-euphausia-lucens' ? 'Read the full research article, including the original figures, using the link above.' : 'The complete monitoring protocol is available through the link above.')}</p>` : '<p class="research-context">Project overview available; full research text has not yet been added.</p>'}
            </div>
          </div>
        </details>
      </div>
      <aside class="research-aside">
        <div>
          <span class="research-status" data-status="${escape(project.status)}"
            >${researchStatus(project.status)}</span
          ><span>${escape(project.venue)}</span>
        </div>
        <div class="research-tags">${project.tags.map(escape).join('<br>')}</div>
      </aside>
    </article>`;
  })
  .join('');
write(
  'research.html',
  shell(
    'Research',
    'research',
    /* HTML */ `<div class="container">
      <header class="page-heading with-silvi">
        <div>
          <p class="eyebrow">Field observations → Ecological inference</p>
          <h1>Research with a wider view.</h1>
          <p>
            From silvertree canopies to the Benguela Current: biodiversity monitoring,
            remote sensing and quantitative ecology.
          </p>
          <p class="research-order">
            Dated work appears newest first. Status labels distinguish completed work,
            manuscripts under review and published research.
          </p>
        </div>
        ${scene('research-overview', 'Curiosity, from the ground up')}
      </header>
      ${researchEntries}
      <section class="section work-development" aria-labelledby="development-title">
        <div class="section-top">
          <div>
            <p class="eyebrow">The next questions</p>
            <h2 id="development-title">Work in development.</h2>
          </div>
          <p>Analysis and planned studies, separate from completed research.</p>
        </div>
        ${sortResearch(plannedWork)
          .map(
            (work) => `<article class="development-entry" id="${work.id}">
          <div><p class="eyebrow">${escape(work.location)}</p><h3>${escape(work.title)}</h3><p>${escape(work.summary)}</p></div>
          <span class="work-status">${escape(work.status)}</span>
          ${scene(work.scene, work.sceneAlt, '', 'development-scene')}
          <details><summary>Project outline</summary><p>${escape(work.next)}</p>${work.notebook ? `<a class="text-link" href="${escape(work.notebook)}">Open analysis notebook ${icon('arrow')}</a>` : '<p class="research-context">Materials will appear here when added.</p>'}</details>
        </article>`,
          )
          .join('')}
      </section>
    </div>`,
  ),
);
const about = /* HTML */ `<div class="container">
    <section class="about-intro">
      <figure class="about-portrait">
        <img
          src="assets/web/portrait.jpg"
          alt="Phemelo Rutlokoane"
          width="700"
          height="850"
        />
        <figcaption>B.Sc (Hons) Biodiversity and Conservation</figcaption>
      </figure>
      <div class="about-copy">
        <p class="eyebrow">Ecologist · Researcher · Explorer</p>
        <h1>Phemelo<br />Rutlokoane.</h1>
        <p>
          I am an Honours graduate in Biodiversity and Conservation at the University of
          the Western Cape, with a focus on remote sensing and spatial ecology.
        </p>
        <p>
          My Honours research used NASA BioSCape’s AVIRIS-NG hyperspectral imagery and
          LVIS LiDAR to monitor <em>Leucadendron argenteum</em> on Table Mountain. I
          developed a probability map of silvertree presence using machine learning and
          field-validated observations.
        </p>
        <p>
          I build reproducible workflows that connect imagery and field data to
          ecological inference, documenting my work in R and Python notebooks that
          others can follow and adapt.
        </p>
        <dl class="about-facts">
          <div>
            <dt>Based in</dt>
            <dd>Johannesburg, South Africa</dd>
          </div>
          <div>
            <dt>Conservation work</dt>
            <dd>Biodiversity monitoring &amp; analysis</dd>
          </div>
          <div>
            <dt>Education</dt>
            <dd>University of the Western Cape</dd>
          </div>
          <div>
            <dt>Tools</dt>
            <dd>R · Python · QGIS · ArcGIS</dd>
          </div>
        </dl>
        <a class="text-link" href="cv.html">View my CV ${icon('arrow')}</a>
      </div>
    </section>
    <div class="interests-row">
      <h2>Research interests</h2>
      <p>
        Remote sensing · Species distribution modelling · Ocean climatology ·
        Biodiversity informatics · Landscape ecology · Fynbos ecology
      </p>
    </div>
    <section class="about-silvi-band">
      <div>
        <p class="eyebrow">Behind the work</p>
        <h2>Data, monitoring &amp; communication.</h2>
        <p>
          I work across wildlife analysis, monitoring tools, education and visual
          communication, connecting conservation evidence with the people who use it.
        </p>
      </div>
      ${scene('about', 'Silvi gestures towards Phemelo’s introduction.')}
    </section>
    <section class="section work-gallery" aria-labelledby="portfolio-title">
      <div class="section-top">
        <div>
          <p class="eyebrow">People · Projects · Practice</p>
          <h2 id="portfolio-title">Work, in pictures.</h2>
        </div>
        <p>A visual record of research, conservation and collaboration.</p>
      </div>
      ${galleries
        .map(
          (gallery, index) =>
            /* HTML */ `<section
              class="gallery-section"
              data-gallery="${index}"
              data-gallery-date="${escape(gallery.date)}"
              data-gallery-unit="${gallery.images.some((photo) => !photo.src) ? 'items' : 'photographs'}"
              aria-labelledby="gallery-title-${index}"
            >
              <div class="gallery-heading">
                <div>
                  <h3 id="gallery-title-${index}">${escape(gallery.title)}</h3>
                  <p>${escape(gallery.desc)}</p>
                </div>
                <div>
                  <p class="gallery-year">${escape(gallery.year)}</p>
                  <div class="gallery-navigation">
                    <button
                      class="icon-button gallery-prev"
                      aria-label="Previous photos: ${escape(gallery.title)}"
                    >
                      ${icon('back')}</button
                    ><button
                      class="icon-button gallery-next"
                      aria-label="Next photos: ${escape(gallery.title)}"
                    >
                      ${icon('arrow')}
                    </button>
                  </div>
                </div>
              </div>
              <div
                class="gallery-rail"
                id="gallery-rail-${index}"
                tabindex="0"
                aria-label="${escape(gallery.title)} photo gallery"
              >
                ${gallery.images
                  .map(
                    (photo, number) => `<figure class="gallery-item">
                  ${photo.src ? `<button class="gallery-open" data-index="${number}" aria-label="Enlarge photo ${number + 1}: ${escape(photo.caption)}"><img src="${escape(photo.src)}" alt="${escape(photo.alt || photo.caption)}" width="800" height="600" loading="lazy" /></button>` : `<div class="portfolio-empty" aria-label="Image to be added"><span>${String(number + 1).padStart(2, '0')}</span>${icon('external')}<small>Image to come</small></div>`}
                  <figcaption>${escape(photo.caption)}</figcaption>
                </figure>`,
                  )
                  .join('')}
              </div>
              <div class="gallery-foot">
                <span class="gallery-position" aria-live="polite"
                  >${gallery.images.length}
                  ${gallery.images.some((photo) => !photo.src) ? 'items' : 'photographs'}</span
                ><span
                  >${gallery.images.length > 1 ? 'Use the arrows or swipe to explore' : 'Select the photograph to enlarge'}</span
                >
              </div>
            </section>`,
        )
        .join('')}
    </section>
  </div>
  <dialog class="lightbox" id="lightbox" aria-labelledby="lightbox-title">
    <div class="lightbox-header">
      <p id="lightbox-title"></p>
      <button class="icon-button" id="lightbox-close" aria-label="Close photograph">
        ${icon('close')}
      </button>
    </div>
    <img id="lightbox-image" alt="" />
    <div class="lightbox-footer">
      <div>
        <p id="lightbox-caption"></p>
        <span class="lightbox-count" id="lightbox-count"></span>
      </div>
      <div class="lightbox-buttons">
        <button class="icon-button" id="lightbox-prev" aria-label="Previous photograph">
          ${icon('back')}</button
        ><button class="icon-button" id="lightbox-next" aria-label="Next photograph">
          ${icon('arrow')}
        </button>
      </div>
    </div>
  </dialog>`;
write('about.html', shell('About Phemelo', 'about', about));
write(
  'carbon.html',
  shell(
    'Carbon tracker',
    'carbon',
    read('content/carbon-tracker.html')
      .replace('{{SILVI}}', scene('travel', 'Silvi tracks carbon on her computer'))
      .replace(
        '{{MOTORCYCLE}}',
        scene('motorcycle', 'Silvi rides an electric motorcycle'),
      ),
    {
      styles: [
        'css/carbon-redesign.css',
        'css/carbon-tracker.css?v=' + carbonStyleVersion,
      ],
      scripts: [
        'assets/vendor/chart.min.js',
        'js/carbon/carbon-runtime.js?v=' + carbonVersion,
      ],
    },
  ),
);
write(
  'protocol.html',
  shell(
    'Biodiversity Monitoring Protocol',
    'research',
    /* HTML */ `<div class="container protocol-top">
        <a class="text-link" href="research.html">${icon('back')} Back to research</a
        ><button class="text-link print-button">
          Print protocol ${icon('external')}
        </button>
      </div>
      <section class="container protocol-silvi">
        <div>
          <p class="eyebrow">Saldanha Bay · Monitoring methods</p>
          <h2>Observe. Record. Return.</h2>
          <p>
            A consistent field record helps us understand how biodiversity changes over
            time.
          </p>
        </div>
        ${scene('protocol', 'Checking the biodiversity field sheet')}
      </section>
      ${read('content/protocol.html')}`,
    { styles: ['css/protocol.css', 'css/reader.css'], bodyClass: 'protocol-page' },
  ),
);
write(
  'cv.html',
  shell(
    'Curriculum vitae',
    'cv',
    read('content/cv-screen.html').replace(
      '{{SILVI_CV_SCREEN}}',
      scene('cv', 'Silvi reads Phemelo’s CV with interest.'),
    ) +
      read('content/cv.html').replace(
        '{{SILVI_CV}}',
        scene('cv', 'A little introduction to the person behind the work'),
      ),
    { styles: ['css/cv.css', 'css/cv-screen.css'], bodyClass: 'cv-page' },
  ),
);
// Pre-render original notebook cells and saved outputs. No scientific code is executed.
const markedContext = { exports: {} };
vm.createContext(markedContext);
vm.runInContext(read('assets/vendor/marked.umd.js'), markedContext);
const marked = markedContext.marked || markedContext.exports.marked;
for (const writing of JSON.parse(read('data/json/research-writings.json'))) {
  const rendered = renderWriting({ root, writing, marked, escape });
  const body = `<div class="container writing-top"><a class="text-link" href="research.html#${writing.project}">${icon('back')} Research</a><button class="text-link print-button">Print / save PDF ${icon('external')}</button></div>
    <header class="container page-heading with-silvi writing-heading"><div><p class="eyebrow">${escape(writing.category)}</p><h1>${escape(writing.title)}</h1><p>Phemelo Rutlokoane · University of the Western Cape</p></div>${scene(writing.scene, writing.alt)}</header>
    <div class="container writing-layout"><aside><details class="reader-contents" open><summary>In this article</summary><nav aria-label="Article contents">${rendered.headings.map((h) => `<a href="#${h.id}">${escape(h.label)}</a>`).join('')}</nav></details></aside><article class="notebook-document research-writing">${rendered.html}</article></div>`;
  write(
    writing.page,
    shell(writing.title, 'research', body, {
      styles: ['css/reader.css'],
      scripts: [
        'js/math-config.js',
        'assets/vendor/mathjax/tex-chtml.js',
        'js/reader.js',
      ],
    }),
  );
}
for (const notebook of NOTEBOOKS.filter((notebook) => available.has(notebook.file))) {
  const original = JSON.parse(read(`notebooks/${notebook.file}.ipynb`));
  const headings = [];
  let cellNumber = 0;
  let headingNumber = 0;
  const materialiseImages = (text) =>
    text.replace(
      /data:image\/(png|jpe?g|webp);base64,([a-zA-Z0-9+/=\r\n]+)/g,
      (_, extension, encoded) => {
        const bytes = Buffer.from(encoded, 'base64'),
          name =
            crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 20) +
            '.' +
            extension.replace('jpeg', 'jpg');
        const destination = path.join(root, 'notebooks/media', name);
        if (!fs.existsSync(destination)) fs.writeFileSync(destination, bytes);
        return '../media/' + name;
      },
    );
  const renderMarkdown = (source) => {
    const equations = [];
    const protectedSource = source.replace(
      /\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$(?!\s)([^$\n]+?)\$/g,
      (equation) => {
        equations.push(equation);
        return 'LHMATHPLACEHOLDER' + (equations.length - 1) + 'END';
      },
    );
    return materialiseImages(
      marked
        .parse(protectedSource, { gfm: true })
        .replace(/LHMATHPLACEHOLDER(\d+)END/g, (_, index) =>
          escape(equations[Number(index)]),
        ),
    );
  };
  const rendered = original.cells
    .map((cell, index) => {
      let source = Array.isArray(cell.source)
        ? cell.source.join('')
        : cell.source || '';
      if (cell.cell_type === 'markdown') {
        for (const [name, attachment] of Object.entries(cell.attachments || {})) {
          const mime = Object.keys(attachment).find((type) =>
            type.startsWith('image/'),
          );
          if (mime) {
            const payload = Array.isArray(attachment[mime])
              ? attachment[mime].join('')
              : attachment[mime];
            source = source
              .split('attachment:' + name)
              .join('data:' + mime + ';base64,' + payload);
          }
        }
        let output = renderMarkdown(source).replace(
          /<h([1-4])([^>]*)>([\s\S]*?)<\/h\1>/g,
          (_, level, attributes, content) => {
            const label = content
              .replace(/<[^>]+>/g, '')
              .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, number) =>
                String.fromCodePoint(
                  number[0].toLowerCase() === 'x'
                    ? parseInt(number.slice(1), 16)
                    : Number(number),
                ),
              )
              .replace(
                /&(amp|quot|apos|lt|gt|nbsp);/g,
                (_, entity) =>
                  ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' })[
                    entity
                  ],
              );
            const id = `section-${index}-${headingNumber++}`;
            if (Number(level) <= 2) headings.push({ id, label });
            return /* HTML */ `<h${level} id="${id}">${content}</h${level}>`;
          },
        );
        return /* HTML */ `<section class="markdown-cell">${output}</section>`;
      }
      if (cell.cell_type === 'raw')
        return /* HTML */ `<pre class="raw-cell">${escape(source)}</pre>`;
      if (cell.cell_type !== 'code') return '';
      cellNumber++;
      const output = (cell.outputs || [])
        .map((item) => {
          const data = item.data || {},
            value = (type) =>
              Array.isArray(data[type]) ? data[type].join('') : data[type];
          if (data['image/png'])
            return materialiseImages(
              /* HTML */ `<figure class="notebook-figure">
                <img
                  loading="lazy"
                  src="data:image/png;base64,${value('image/png')}"
                  alt="Original figure output from code cell ${cellNumber}"
                />
              </figure>`,
            );
          if (data['text/html'])
            return /* HTML */ `<div class="notebook-table">
              ${materialiseImages(value('text/html'))}
            </div>`;
          if (data['text/markdown']) return renderMarkdown(value('text/markdown'));
          const text =
            value('text/plain') ||
            (Array.isArray(item.text) ? item.text.join('') : item.text) ||
            (item.ename ? item.ename + ': ' + item.evalue : '');
          return text
            ? '<pre class="output-text">' +
                escape(text.replace(/\u001b\[[0-9;]*m/g, '')) +
                '</pre>'
            : '';
        })
        .join('');
      return /* HTML */ `<section class="code-cell" id="cell-${index}">
        <div class="code-toolbar">
          <span
            >R · Cell
            ${cellNumber}${cell.execution_count != null ? ` · In [${cell.execution_count}]` : ''}</span
          ><button class="copy-code">Copy code</button>
        </div>
        <pre class="source-code"><code>${escape(source)}</code></pre>
        ${
          output
            ? /* HTML */ `<details class="cell-output" open>
                <summary>Output</summary>
                <div class="output-content">${output}</div>
              </details>`
            : ''
        }
      </section>`;
    })
    .join('\n');
  const body = /* HTML */ `<div class="reader-bar">
      <div class="reader-bar-inner">
        <a href="../../notebooks.html">${icon('back')} Notebooks</a
        ><span class="reader-crumb"
          >${escape(notebook.category)} / Part ${notebook.part || '—'}</span
        ><a href="../${notebook.file}.ipynb" download
          >${icon('download')} Download .ipynb</a
        >
      </div>
    </div>
    <div class="reader-layout">
      <aside class="reader-sidebar">
        ${scene('notebook-' + notebook.file, 'Exploring ' + notebook.title + ' with Silvi', '../../', 'reader-silvi')}
        <details class="reader-contents" open>
          <summary>In this notebook</summary>
          <nav aria-label="Notebook contents">
            ${headings.map((heading) => /* HTML */ `<a href="#${heading.id}">${escape(heading.label)}</a>`).join('')}
          </nav>
        </details>
        <div class="reader-tools">
          <button id="toggle-outputs" aria-pressed="false">Collapse outputs</button
          ><button class="print-button">Print notebook</button>
        </div>
        <p>Original code and saved outputs.<br />R · ${original.cells.length} cells</p>
      </aside>
      <article class="notebook-document">
        <div class="reader-intro">
          <p class="eyebrow">${escape(notebook.category)} · ${notebook.date}</p>
        </div>
        ${rendered}
        <div class="reader-end">
          <p>You’ve reached the end of this notebook.</p>
          <a class="text-link" href="../../notebooks.html"
            >Return to all notebooks ${icon('arrow')}</a
          >
        </div>
      </article>
    </div>`;
  write(
    `notebooks/read/${notebook.file}.html`,
    shell(notebook.title, 'notebooks', body, {
      prefix: '../../',
      styles: ['css/reader.css'],
      scripts: [
        'js/math-config.js',
        'assets/vendor/mathjax/tex-chtml.js',
        'js/reader.js',
      ],
      bodyClass: 'reader-page',
      description: notebook.desc,
    }),
  );
}
console.log(`Built 9 pages and ${available.size} complete notebook readers.`);

await Promise.all(pendingPages);
for (const oldLocation of Object.keys(pageLocations))
  fs.rmSync(path.join(root, oldLocation), { force: true });
