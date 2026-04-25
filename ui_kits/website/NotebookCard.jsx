/* NotebookCard.jsx + NotebookGrid.jsx — categorised + part-numbered */
const NOTEBOOKS = [
  // R Fundamentals
  {file:"Introduction_to_R",title:"Introduction to R",series:"R Fundamentals",part:1,desc:"A foundation in R: installation, data types, functions, and reading and writing data.",date:"2025-08-12",category:"R Fundamentals",keywords:["Base R","Functions","Data Types"],lang:"R"},
  {file:"Data_manipulation",title:"Data Manipulation in R",series:"R Fundamentals",part:2,desc:"From data creation to wrangling: tidyverse pipelines, wide/long pivots and the Palmer Penguins dataset.",date:"2025-08-13",category:"R Fundamentals",keywords:["Tidyverse","dplyr","tidyr"],lang:"R"},
  {file:"Data_visualisation",title:"Data Visualisation in R",series:"R Fundamentals",part:3,desc:"Base R plots to publication-quality facetted ggplots — the complete visualisation toolkit.",date:"2025-08-13",category:"R Fundamentals",keywords:["ggplot2","Themes","Facets"],lang:"R"},

  // Spatial & Remote Sensing
  {file:"Spatial_data_R",title:"Spatial Data in R",series:"Spatial & Remote Sensing",part:1,desc:"First steps in spatial R: reading, plotting, manipulating and combining vector and raster data.",date:"2026-02-06",category:"Spatial & Remote Sensing",keywords:["sf","terra","Raster"],lang:"R"},
  {file:"Cartography_R",title:"Cartography in R",series:"Spatial & Remote Sensing",part:2,desc:"Building publication-grade thematic maps with tmap and ggplot2.",date:"2026-02-08",category:"Spatial & Remote Sensing",keywords:["tmap","Cartography","Layouts"],lang:"R"},
  {file:"Satellite_imagery_R",title:"Mapping with Satellite Imagery",series:"Spatial & Remote Sensing",part:3,desc:"Landsat-based NDVI, spectral resolution and RGB composite mapping in R.",date:"2026-02-10",category:"Spatial & Remote Sensing",keywords:["Landsat","NDVI","RGB"],lang:"R"},

  // Marine & Environmental
  {file:"SST_timeseries",title:"Sea Surface Temperature Time Series",series:"Marine & Environmental",part:1,desc:"Loading, cleaning, and decomposing daily SST records into climatology + anomaly.",date:"2026-02-08",category:"Marine & Environmental",keywords:["SST","Climatology","Anomalies"],lang:"R"},
  {file:"Heatwave_climatology",title:"Building a MHW Climatology",series:"Marine & Environmental",part:2,desc:"Creating the seasonally-varying baseline and 90th-percentile threshold for MHW detection.",date:"2026-02-09",category:"Marine & Environmental",keywords:["heatwaveR","Threshold","Baseline"],lang:"R"},
  {file:"Marine_heatwave",title:"Marine Heatwave Analysis",series:"Marine & Environmental",part:3,desc:"Detection and characterisation of marine heatwave events using sea surface temperature data.",date:"2026-02-10",category:"Marine & Environmental",keywords:["MHW","SST","heatwaveR"],lang:"R"},

  // Machine Learning
  {file:"ML_intro_python",title:"Intro to Machine Learning in Python",series:"Machine Learning",part:1,desc:"Supervised vs unsupervised, train/test splits, and a first end-to-end scikit-learn pipeline.",date:"2026-03-04",category:"Machine Learning",keywords:["scikit-learn","Pipelines","Train/Test"],lang:"Python"},
  {file:"ML_classification",title:"Classification Algorithms",series:"Machine Learning",part:2,desc:"Logistic regression, decision trees, KNN — fitting, evaluating, and comparing classifiers.",date:"2026-03-06",category:"Machine Learning",keywords:["Classification","ROC","Confusion Matrix"],lang:"Python"},
  {file:"ML_random_forest",title:"Random Forest for Image Classification",series:"Machine Learning",part:3,desc:"Pixel-based classification of Sentinel-2 imagery with a Random Forest, plus feature importance.",date:"2026-03-08",category:"Machine Learning",keywords:["Random Forest","Sentinel-2","Feature Importance"],lang:"Python"},
];

// Stable category order: matches "where to start" reading flow.
const CATEGORY_ORDER = ["R Fundamentals", "Spatial & Remote Sensing", "Marine & Environmental", "Machine Learning"];
const CATEGORY_BLURBS = {
  "R Fundamentals": "Start here if you're new to R. Each part builds on the last.",
  "Spatial & Remote Sensing": "Geospatial workflows in R — vector, raster, and satellite imagery.",
  "Marine & Environmental": "Time-series analysis of ocean and climate data.",
  "Machine Learning": "Predictive modelling in Python, with a remote-sensing flavour.",
};

function fmtDate(d) {
  try { return new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}); }
  catch(e) { return d; }
}

function NotebookPreview({ nb }) {
  const codeBlocks = nb.lang === 'Python' ? (
    <>
      <div className="nb-cell-head">In [1]:</div>
      <div className="nb-code-line">import numpy as np</div>
      <div className="nb-code-line">from sklearn.ensemble \</div>
      <div className="nb-code-line">  import RandomForestClassifier</div>
      <div className="nb-code-line">clf = RandomForestClassifier()</div>
      <div className="nb-out-line">RandomForestClassifier()</div>
    </>
  ) : (
    <>
      <div className="nb-cell-head">In [1]:</div>
      <div className="nb-code-line">library(terra)</div>
      <div className="nb-code-line">r &lt;- rast("scene.tif")</div>
      <div className="nb-code-line">ndvi &lt;- (r$NIR - r$RED) /</div>
      <div className="nb-code-line">  (r$NIR + r$RED)</div>
      <div className="nb-out-line">class : SpatRaster</div>
    </>
  );
  return (
    <div className={`nb-preview ${nb.lang==='Python'?'py':''}`}>
      <div className="nb-pattern">{codeBlocks}</div>
      <div className="nb-type-badge">{nb.lang}</div>
      {nb.part && <div className="nb-part-badge">PART {nb.part}</div>}
    </div>
  );
}

function NotebookCard({ nb, onOpen }) {
  return (
    <div className="nb-card" onClick={() => onOpen(nb)}>
      <NotebookPreview nb={nb}/>
      <div className="nb-body">
        <div className="nb-meta">
          <span className="nb-cat">{nb.category}</span>
          <span className="nb-date">{fmtDate(nb.date)}</span>
        </div>
        <div className="nb-title">{nb.title}</div>
        <div className="nb-desc">{nb.desc}</div>
        <div className="nb-keywords">
          {nb.keywords.map(k => <span key={k} className="kw">{k}</span>)}
        </div>
        <div className="nb-footer">
          <span className="nb-author">Phemelo R.</span>
          <span className="nb-open-btn">Open notebook →</span>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ cat, items, onOpen }) {
  return (
    <div className="cat-section">
      <div className="cat-section-head">
        <div>
          <h3 className="cat-section-title">{cat}</h3>
          <p className="cat-section-desc">{CATEGORY_BLURBS[cat]}</p>
        </div>
        <span className="cat-section-count">{items.length} notebooks</span>
      </div>
      <div className="nb-grid">
        {items.map(nb => <NotebookCard key={nb.file} nb={nb} onOpen={onOpen}/>)}
      </div>
    </div>
  );
}

function NotebookGrid({ onOpen }) {
  const cats = ["All", ...CATEGORY_ORDER];
  const [active, setActive] = useState("All");

  // sort within category by Part number, then date
  const sortNbs = (a, b) => {
    if (a.part && b.part) return a.part - b.part;
    return a.date.localeCompare(b.date);
  };

  const grouped = CATEGORY_ORDER.map(c => ({
    cat: c,
    items: NOTEBOOKS.filter(n => n.category === c).sort(sortNbs),
  })).filter(g => g.items.length);

  const visibleGroups = active === "All" ? grouped : grouped.filter(g => g.cat === active);

  return (
    <section className="notebooks">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-tag">Portfolio</div>
          <h2 className="section-title">All Notebooks</h2>
          <p className="section-desc">Grouped by topic. Series are numbered — start at <strong>Part 1</strong> and follow the sequence.</p>
        </div>
        <div className="filter-bar">
          {cats.map(c => (
            <button key={c} className={`filter-btn ${active===c?'active':''}`} onClick={() => setActive(c)}>{c}</button>
          ))}
        </div>
        {visibleGroups.map(g => (
          <CategorySection key={g.cat} cat={g.cat} items={g.items} onOpen={onOpen}/>
        ))}
      </div>
    </section>
  );
}

window.NOTEBOOKS = NOTEBOOKS;
window.fmtDate = fmtDate;
window.NotebookCard = NotebookCard;
window.NotebookGrid = NotebookGrid;
