/* ExpertiseGrid.jsx */
const EXPERTISE = [
  {icon:"🛰",title:"Remote Sensing",desc:"Satellite and aerial imagery analysis, land cover classification, change detection and spectral indices.",tags:["NDVI","Landsat","Sentinel","Earth Engine"],c:"#4a9eff"},
  {icon:"🗺",title:"GIS & Spatial Analysis",desc:"Vector and raster geoprocessing, spatial statistics, cartographic design and map production in R.",tags:["sf","terra","ggplot2","tmap"],c:"#38c98a"},
  {icon:"🧬",title:"Biodiversity & SDM",desc:"Species distribution modelling, biodiversity network theory, occurrence data and trait databases.",tags:["MaxEnt","ENMeval","GBIF","BioTIME"],c:"#f5a623"},
  {icon:"📊",title:"Biostatistics",desc:"Multivariate analysis, GLMMs, ordination and community ecology statistics.",tags:["vegan","lme4","glmmTMB","ggeffects"],c:"#c96aff"},
  {icon:"🔬",title:"Research",desc:"Reproducible open-science workflows, structured data management and science communication.",tags:["Quarto","RMarkdown","Zenodo","OSF"],c:"#ff6a88"},
  {icon:"🐍",title:"Python & Notebooks",desc:"Geospatial Python workflows, data wrangling, and Jupyter notebooks for reproducible analysis.",tags:["geopandas","rasterio","shapely","pandas"],c:"#4a9eff"},
];

function ExpertiseGrid() {
  return (
    <section className="expertise">
      <div className="section-inner">
        <div className="section-header">
          <div className="section-tag">What I Do</div>
          <h2 className="section-title">Areas of Expertise</h2>
          <p className="section-desc">Bridging geospatial technology with ecological science to answer complex spatial questions.</p>
        </div>
        <div className="expertise-grid">
          {EXPERTISE.map((e,i) => (
            <div key={i} className="exp-card" style={{'--c': e.c}}>
              <span className="exp-icon">{e.icon}</span>
              <div className="exp-title">{e.title}</div>
              <p className="exp-desc">{e.desc}</p>
              <div className="tag-list">
                {e.tags.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.ExpertiseGrid = ExpertiseGrid;
