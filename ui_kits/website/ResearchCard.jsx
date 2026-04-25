/* ResearchCard.jsx + ResearchPage.jsx */
const RESEARCH = [
  {
    accent: "#4a9eff",
    badge: "pub", badgeLabel: "Publication in Progress",
    title: <>Accuracy of Hyperspectral Imaging &amp; LiDAR for Identifying <em>Leucadendron argenteum</em> in Table Mountain National Park</>,
    meta: ["📅 2025", "🏫 University of the Western Cape", "🧑‍🔬 Dr. Patrick O'Farrell", "📘 Honours Thesis"],
    authors: "Phemelo Rutlokoane",
    desc: <>My Honours research investigated whether high-resolution hyperspectral imagery and LiDAR data collected during the BioSCape campaign could accurately identify and map <em>Leucadendron argenteum</em> (Silver Tree) populations across Table Mountain National Park. I used Random Forest classification on AVIRIS-NG spectral data and LiDAR-derived structural metrics.</>,
    tags: ["AVIRIS-NG","LiDAR","Random Forest","BioSCape","Fynbos","Python"]
  },
  {
    accent: "#38c98a",
    badge: "done", badgeLabel: "Completed",
    title: <>Diel Vertical Migration of <em>Euphausia lucens</em> in St Helena Bay</>,
    meta: ["📅 2025", "🏫 University of the Western Cape", "🧑‍🔬 Data: Prof. Mark Gibbons", "📘 Coursework Project"],
    authors: "Phemelo Rutlokoane",
    desc: <>I analysed the diel vertical migration of Antarctic krill (<em>Euphausia lucens</em>) using quantitative ecological analyses. The aim was to investigate environmental drivers of vertical distribution and explore how spatial structure influences abundance estimates at inshore versus offshore stations.</>,
    tags: ["Marine Ecology","Spatial Interpolation","R","Krill","Oceanography"]
  },
  {
    accent: "#f5a623",
    badge: "done", badgeLabel: "Completed",
    title: <>Multivariate Distributions of Adder Populations in South Africa</>,
    meta: ["📅 2025", "🏫 University of the Western Cape", "📘 Collaborative Coursework"],
    authors: "Phemelo Rutlokoane, Kezia Samuels, Shane Ngwenya",
    desc: <>A collaborative project modelling the distribution of Adder species (<em>Bitis</em> spp.) across South Africa using multivariate environmental analysis. We built species distribution models, ran ordination analyses, and evaluated how land cover and bioclimatic variables influence community composition.</>,
    tags: ["SDM","MaxEnt","PCA","Bioclim","Herpetology","R"]
  }
];

function ResearchCard({ r, onOpen }) {
  return (
    <div className="rc" style={{'--rc': r.accent}}>
      <span className={`rc-badge ${r.badge}`}>
        <span className="rc-dot"></span>{r.badgeLabel}
      </span>
      <div className="rc-title">{r.title}</div>
      <div className="rc-meta">{r.meta.map((m,i) => <span key={i}>{m}</span>)}</div>
      <div className="rc-authors"><strong>Authors:</strong> {r.authors}</div>
      <p className="rc-desc">{r.desc}</p>
      <div className="rc-footer">
        <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
          {r.tags.map(t => <span key={t} className="rc-tag">{t}</span>)}
        </div>
        <button className="rc-nb-btn" onClick={onOpen}>📓 View Notebook →</button>
      </div>
    </div>
  );
}

function ResearchPage({ onOpenNb }) {
  return (
    <section>
      <div className="section-inner" style={{maxWidth:880}}>
        <div className="section-header">
          <div className="section-tag">Research</div>
          <h2 className="section-title">Research &amp; Projects</h2>
          <p className="section-desc">My research sits at the intersection of spatial ecology, remote sensing and quantitative biodiversity science.</p>
        </div>
        <div style={{display:'grid',gap:'2rem'}}>
          {RESEARCH.map((r,i) => <ResearchCard key={i} r={r} onOpen={() => onOpenNb(NOTEBOOKS[3])}/>)}
        </div>
      </div>
    </section>
  );
}

window.ResearchPage = ResearchPage;
window.ResearchCard = ResearchCard;
