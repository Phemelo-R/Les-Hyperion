/* ============================================================
   Les Hyperion — Site Data
   Edit NOTEBOOKS and RESEARCH to add/update content.
   ============================================================ */

const NOTEBOOK_BASE_PATH = './notebooks/';

// ---- Category configuration ----
const CATEGORIES = {
  'R Fundamentals': {
    color: 'var(--accent)',
    blurb: 'Start here if you\'re new to R. Each part builds on the last.',
    order: 1,
  },
  'Spatial & Remote Sensing': {
    color: 'var(--accent2)',
    blurb: 'Geospatial workflows in R — vector, raster, and satellite imagery.',
    order: 2,
  },
  'Marine & Environmental': {
    color: 'var(--accent3)',
    blurb: 'Ocean climatology and time-series analysis of oceanographic data.',
    order: 3,
  },
  'Machine Learning': {
    color: 'var(--accent4)',
    blurb: 'Machine learning applied to ecological and spatial data in R.',
    order: 4,
  },
};

// ---- Notebooks ----
// To add a notebook:
//   1. Drop the .ipynb file into the /notebooks/ folder in your repo.
//   2. Add an entry below. The `file` field must match the filename (without .ipynb).
const NOTEBOOKS = [
  // R Fundamentals
  {
    file: 'Introduction_to_R',
    title: 'Introduction to R',
    featured: true,
    series: 'R Fundamentals',
    part: 1,
    desc: 'A foundation in R: installation, data types, functions, and reading and writing data.',
    date: '2025-08-12',
    category: 'R Fundamentals',
    keywords: ['Base R', 'Functions', 'Data Types'],
    lang: 'R',
  },
  {
    file: 'Data_Manipulation',
    title: 'Data Manipulation in R',
    featured: true,
    series: 'R Fundamentals',
    part: 2,
    desc: 'From data creation to wrangling: tidyverse pipelines, wide/long pivots and the Palmer Penguins dataset.',
    date: '2025-08-13',
    category: 'R Fundamentals',
    keywords: ['Tidyverse', 'dplyr', 'tidyr'],
    lang: 'R',
  },
  {
    file: 'Data_Visualisation',
    title: 'Data Visualisation in R',
    featured: true,
    series: 'R Fundamentals',
    part: 3,
    desc: 'Base R plots to publication-quality facetted ggplots — the complete visualisation toolkit.',
    date: '2025-08-13',
    category: 'R Fundamentals',
    keywords: ['ggplot2', 'Themes', 'Facets'],
    lang: 'R',
  },

  // Spatial & Remote Sensing
  {
    file: 'Introduction_to_Spatial_Mapping999',
    title: 'Introduction to Spatial Mapping and Remote Sensing for Ecology',
    featured: true,
    noPreview: true,
    series: 'Spatial & Remote Sensing',
    part: 1,
    desc: 'An introductory guide and conceptual overview of spatial data handling, mapping, and remote sensing in R.',
    date: '2026-03-24',
    category: 'Spatial & Remote Sensing',
    keywords: ['Spatial Analysis', 'Remote Sensing', 'Raster', 'Vector', 'Projections'],
    lang: 'R',
  },
  {
    file: 'Vector_Data_with_sf',
    title: 'Vector Data with sf',
    series: 'Spatial & Remote Sensing',
    part: 2,
    desc: 'Working with vector spatial data in R using the sf package. Reading, writing, transforming, and visualising points, lines, and polygons.',
    date: '2026-05-01',
    category: 'Spatial & Remote Sensing',
    keywords: ['sf', 'Vector Data', 'Spatial Analysis'],
    lang: 'R',
  },
  {
    file: 'Satellite_imagery_R',
    title: 'Mapping with Satellite Imagery',
    featured: true,
    series: 'Spatial & Remote Sensing',
    part: 3,
    desc: 'Landsat-based NDVI, spectral resolution and RGB composite mapping in R.',
    date: '2026-02-10',
    category: 'Spatial & Remote Sensing',
    keywords: ['Landsat', 'NDVI', 'RGB'],
    lang: 'R',
  },

  // Marine & Environmental
  {
    file: 'SST_timeseries',
    title: 'Sea Surface Temperature Time Series',
    series: 'Marine & Environmental',
    part: 1,
    desc: 'Loading, cleaning, and decomposing daily SST records into climatology and anomaly components.',
    date: '2026-02-08',
    category: 'Marine & Environmental',
    keywords: ['SST', 'Climatology', 'Anomalies'],
    lang: 'R',
  },
  {
    file: 'Heatwave_climatology',
    title: 'Building a MHW Climatology',
    series: 'Marine & Environmental',
    part: 2,
    desc: 'Creating the seasonally-varying baseline and 90th-percentile threshold for MHW detection.',
    date: '2026-02-09',
    category: 'Marine & Environmental',
    keywords: ['heatwaveR', 'Threshold', 'Baseline'],
    lang: 'R',
  },
  {
    file: 'Marine_heatwave',
    title: 'Marine Heatwave Analysis',
    series: 'Marine & Environmental',
    part: 3,
    desc: 'Detection and characterisation of marine heatwave events using sea surface temperature data.',
    date: '2026-02-10',
    category: 'Marine & Environmental',
    keywords: ['MHW', 'SST', 'heatwaveR'],
    lang: 'R',
  },
  {
    file: 'Diel_vertical_migration_of_Euphausia_lucens',
    title: 'Diel Vertical Migration of Euphausia lucens',
    series: 'Marine & Environmental',
    part: null,
    noPreview: true,
    desc: 'Vertical distribution and life-stage composition of Euphausia lucens at inshore and offshore stations in St Helena Bay over a 48-hour MOCNESS survey.',
    date: '2024-10-01',
    category: 'Marine & Environmental',
    keywords: ['DVM', 'Euphausiids', 'St Helena Bay', 'MOCNESS'],
    lang: 'R',
  },

  // Machine Learning
  {
    file: 'Introduction_to_Machine_Learning',
    title: 'Introduction to Machine Learning',
    featured: true,
    series: 'Machine Learning',
    part: 1,
    desc: 'A practical introduction to machine learning for ecologists — core concepts, model types, and your first end-to-end workflow in R.',
    date: '2026-04-20',
    category: 'Machine Learning',
    keywords: ['Machine Learning', 'Ecology', 'Palmerpenguins', 'Modelling'],
    lang: 'R',
  },
  {
    file: 'Linear_Regression',
    title: 'Linear Regression',
    series: 'Machine Learning',
    part: 2,
    desc: 'A practical introduction to linear regression for ecologists — model fitting, evaluation, and interpretation in R.',
    date: '2026-04-21',
    category: 'Machine Learning',
    keywords: ['Linear Regression', 'Ecology', 'Palmerpenguins', 'Modelling'],
    lang: 'R',
  },
  {
    file: 'Generalized_Linear_Models',
    title: 'Generalized Linear Models',
    series: 'Machine Learning',
    part: 3,
    desc: 'A practical introduction to generalized linear models for ecologists — model fitting, evaluation, and interpretation in R.',
    date: '2026-04-23',
    category: 'Machine Learning',
    keywords: ['Generalized Linear Models', 'Regression', 'Modelling'],
    lang: 'R',
  },
];

// ---- Research ----
// `notebooks` array = file names (without .ipynb) that link from research to the notebook viewer.
// `content` is the full paper text shown in the modal.
const RESEARCH = [
  {
    id: 'bioscape-sdm',
    title: 'Monitoring Leucadendron argenteum populations: exploring opportunities offered by emerging technologies.',
    year: '2025',
    venue: 'Honours Research Project — University of the Western Cape',
    authors: ['Phemelo Rutlokoane, Dr. Patrick O\'Farrell & Dr. Ryan Blanchard'],
    status: 'in-progress',
    desc: 'My Honours research investigated the accuracy of NASA\'s AVIRIS-NG Hyperspectral imagery and LVIS LiDAR in detecting and mapping Silvertree populations across Table Mountain National Park.',
    tags: ['BioSCape', 'Hyperspectral', 'LiDAR', 'Silvertree', 'Fynbos'],
    color: 'var(--accent)',
    notebooks: ['BioSCape_Spectral_Extraction', 'BioSCape_LiDAR_Analysis', 'BioSCape_Hyperspectral_Analysis'],
    content: `
      <h2>Abstract</h2>
      <p>blah-blah-blah... to be continued</p>
    `,
  },
  {
    id: 'mhw-benguela',
    title: 'Marine Heatwave Dynamics in the Benguela Current System',
    year: '2024',
    venue: 'Quantitative Ecology Module — University of the Western Cape',
    authors: 'Phemelo Rutlokoane',
    status: 'complete',
    desc: 'An analysis of marine heatwave frequency, intensity, and duration trends in the Benguela Current upwelling system using 40 years of NOAA OISST data and the heatwaveR detection framework.',
    tags: ['Benguela Current', 'Marine Heatwaves', 'SST', 'Oceanography', 'heatwaveR'],
    color: 'var(--accent2)',
    notebooks: ['SST_timeseries', 'Heatwave_climatology', 'Marine_heatwave'],
    content: `
      <h2>Abstract</h2>
      <p>blah-blah-blah... to be continued</p>
    `,
  },
  {
    id: 'dvm-euphausia-lucens',
    title: 'Diel Vertical Migration of Euphausia lucens in St Helena Bay, South Africa',
    year: '2024',
    venue: 'University of the Western Cape',
    authors: 'Phemelo Rutlokoane',
    status: 'complete',
    desc: 'Diel vertical migration of Euphausia lucens was studied at inshore and offshore stations in St Helena Bay over 48 hours using a MOCNESS net sampled every 4 hours. Euphausiids were counted and categorised by life-history stage, and their vertical position summarised by weighted mean depth.',
    tags: ['DVM', 'Euphausiids', 'St Helena Bay', 'MOCNESS', 'Zooplankton', 'Oceanography'],
    color: 'var(--accent3)',
    notebooks: ['Diel_vertical_migration_of_Euphausia_lucens'],
    content: `
      <h2>Abstract</h2>
      <p>blah-blah-blah... to be continued</p>
    `,
  },
  {
    id: 'saldanha-biodiversity-protocol',
    title: 'Biodiversity Monitoring Protocol for Saldanha Bay Municipality 2025–2030',
    year: '2025',
    venue: 'BCB736 — University of the Western Cape',
    authors: 'Phemelo Rutlokoane',
    status: 'complete',
    desc: 'A structured five-year biodiversity monitoring protocol for Saldanha Bay Municipality, designed to align with the Kunming-Montreal Global Biodiversity Framework and the SBM Spatial Development Framework 2025–2030. Covers 12 State-Pressure-Response indicators, indicator-specific data collection methods, reporting structures, and institutional governance.',
    tags: ['Biodiversity Monitoring', 'Saldanha Bay', 'KMGBF', 'Fynbos', 'QGIS', 'Spatial Planning', 'SPR Framework'],
    color: 'var(--accent4)',
    notebooks: [],
    page: 'protocol.html',
    content: null,
  },
  // Add more research entries here following the same structure.
];

/* ============================================================
   Shared notebook card builder
   Defined here so it is available on every page that loads data.js.
   ============================================================ */
function buildNbCard(nb, color) {
  const card = document.createElement('div');
  card.className = 'nb-card fade-up';
  card.style.setProperty('--cat-color', color);

  const fmtDate = d => {
    try { return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); }
    catch(e) { return d; }
  };

  const codeLines = nb.lang === 'Python'
    ? `<div class="nb-cell-head">In [1]:</div>
       <div class="nb-code-line">import numpy as np</div>
       <div class="nb-code-line">from sklearn.ensemble import RandomForestClassifier</div>
       <div class="nb-out-line">RandomForestClassifier()</div>`
    : `<div class="nb-cell-head">In [1]:</div>
       <div class="nb-code-line">library(terra)</div>
       <div class="nb-code-line">r &lt;- rast("scene.tif")</div>
       <div class="nb-code-line">ndvi &lt;- (r$NIR - r$RED) / (r$NIR + r$RED)</div>
       <div class="nb-out-line">class : SpatRaster</div>`;

  card.innerHTML = `
    <div class="nb-preview" data-nb-file="${nb.file}">
      <div class="nb-pattern">${nb.noPreview ? '' : codeLines}</div>
      <div class="nb-type-badge">${nb.lang}</div>
      ${nb.part ? `<div class="nb-part-badge">PART ${nb.part}</div>` : ''}
    </div>
    <div class="nb-body">
      <div class="nb-meta">
        <span class="nb-cat">${nb.category}</span>
        <span class="nb-date">${fmtDate(nb.date)}</span>
      </div>
      <div class="nb-title">${nb.title}</div>
      <div class="nb-desc">${nb.desc}</div>
      <div class="nb-keywords">
        ${nb.keywords.map(k => `<span class="kw">${k}</span>`).join('')}
      </div>
      <div class="nb-footer">
        <span class="nb-author">Phemelo R.</span>
        <span class="nb-open-btn">Open notebook →</span>
      </div>
    </div>`;

  return card;
}

window.buildNbCard = buildNbCard;