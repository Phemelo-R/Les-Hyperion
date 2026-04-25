/* Marquee.jsx */
const MARQUEE_ITEMS = ["GIS","Remote Sensing","R","Python","Jupyter","MaxEnt","Random Forest","NDVI","Sentinel-2","Landsat","AVIRIS-NG","LiDAR","GBIF","Species Distribution Modelling","vegan","terra","sf","tmap","ggplot2","Biostatistics","NMDS","PERMANOVA","WhiteboxTools","Darwin Core","Open Science"];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee-track">
        {items.map((t, i) => (
          <span key={i} className="marquee-item">
            <span className="marquee-dot"></span>{t}
          </span>
        ))}
      </div>
    </div>
  );
}

window.Marquee = Marquee;
