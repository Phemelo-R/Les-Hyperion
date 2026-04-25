/* NotebookModal.jsx — VSCode-style modal viewer */
function NotebookModal({ nb, onClose }) {
  if (!nb) return null;
  return (
    <div className={`modal-overlay ${nb?'open':''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}>
      <div className="viewer" role="dialog" aria-modal="true">
        <div className="viewer-topbar">
          <div className="viewer-dots">
            <div className="viewer-dot vd-r"></div>
            <div className="viewer-dot vd-y"></div>
            <div className="viewer-dot vd-g"></div>
          </div>
          <div className="viewer-title">{nb.file}.ipynb</div>
          <button className="viewer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="viewer-content">
          <div className="nb-doc">
            {nb.series && <div className="nb-series">{nb.series} — Part {nb.part}</div>}
            <div className="nb-doc-title">{nb.title}</div>
            <div className="nb-doc-meta">
              <span>✍ <strong>Author:</strong> Phemelo Rutlokoane</span>
              <span>📅 <strong>Date:</strong> {fmtDate(nb.date)}</span>
              <span>🏷 <strong>Category:</strong> {nb.category}</span>
              <span>💻 <strong>Language:</strong> {nb.lang}</span>
            </div>
            {nb.abstract && <div className="nb-abstract">{nb.abstract}</div>}

            <div className="nb-h1">Setup</div>
            <p className="nb-p">
              We start by loading the libraries we need for the analysis.
              The <code style={{fontFamily:'var(--font-m)',fontSize:'.82em',background:'var(--bg3)',padding:'1px 5px',borderRadius:4,color:'var(--accent2)'}}>terra</code> package
              handles raster operations and <code style={{fontFamily:'var(--font-m)',fontSize:'.82em',background:'var(--bg3)',padding:'1px 5px',borderRadius:4,color:'var(--accent2)'}}>sf</code> handles vector data.
            </p>
            <div className="nb-code">
              <div className="nb-code-top">
                <span className="nb-code-lang">{nb.lang}</span>
                <span className="nb-code-num">In [1]</span>
              </div>
              <pre className="nb-code-content">{`library(terra)
library(sf)
library(tidyverse)

# Load Landsat scene
r <- rast("LC08_L2SP_175079.tif")
print(r)`}</pre>
            </div>
            <div className="nb-out">
              <div className="nb-out-label">Output</div>
              <pre style={{margin:0}}>{`class       : SpatRaster
dimensions  : 7711, 7611, 7  (nrow, ncol, nlyr)
resolution  : 30, 30  (x, y)
extent      : 384300, 612630, -3823020, -3591690
coord. ref. : WGS 84 / UTM zone 35S`}</pre>
            </div>

            <div className="nb-h2">Compute NDVI</div>
            <p className="nb-p">
              The Normalised Difference Vegetation Index reveals where vegetation is healthy.
              We isolate the NIR and RED bands, then apply the standard formula.
            </p>
            <div className="nb-code">
              <div className="nb-code-top">
                <span className="nb-code-lang">{nb.lang}</span>
                <span className="nb-code-num">In [2]</span>
              </div>
              <pre className="nb-code-content">{`ndvi <- (r[["NIR"]] - r[["RED"]]) /
        (r[["NIR"]] + r[["RED"]])

plot(ndvi, col = viridis::viridis(50))`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.NotebookModal = NotebookModal;
