/* About.jsx — homepage about-me section with photo, details, research interests, role */
function AboutSection() {
  return (
    <section className="about-home">
      <div className="section-inner about-home-inner">
        <div className="about-photo-wrap">
          <div className="about-photo-frame">
            <img className="about-photo" src="../../assets/phemelo.jpg" alt="Phemelo Rutlokoane"/>
            <div className="about-photo-badge">📍 Cape Town, ZA</div>
          </div>
          <div className="about-photo-grid"></div>
        </div>

        <div className="about-text">
          <div className="section-tag">About Me</div>
          <h2 className="section-title">Phemelo Rutlokoane</h2>
          <p className="about-role">
            GIS Analyst &amp; Researcher · <em>University of the Western Cape</em>
          </p>

          <div className="about-meta-grid">
            <div className="about-meta-item">
              <div className="about-meta-label">Currently</div>
              <div className="about-meta-value">Spatial Analyst Intern, BioSCape</div>
            </div>
            <div className="about-meta-item">
              <div className="about-meta-label">Based in</div>
              <div className="about-meta-value">Cape Town, South Africa</div>
            </div>
            <div className="about-meta-item">
              <div className="about-meta-label">Languages</div>
              <div className="about-meta-value">R, Python, SQL</div>
            </div>
            <div className="about-meta-item">
              <div className="about-meta-label">Open to</div>
              <div className="about-meta-value">Research, consultancy, teaching</div>
            </div>
          </div>

          <p className="about-bio">
            I'm a spatial analyst and researcher working at the intersection of
            <strong> remote sensing</strong>, <strong>quantitative ecology</strong> and
            <strong> biodiversity informatics</strong>. My day-to-day moves between
            R notebooks, Python pipelines, and field-derived datasets — turning
            satellite pixels and species occurrences into reproducible answers
            about how landscapes change.
          </p>

          <div className="about-interests">
            <div className="about-section-label">Research Interests</div>
            <div className="interest-pills">
              <span className="interest-pill">🛰 Hyperspectral imaging</span>
              <span className="interest-pill">🌿 Species distribution modelling</span>
              <span className="interest-pill">🗺 Landscape ecology</span>
              <span className="interest-pill">🌊 Marine biodiversity</span>
              <span className="interest-pill">🧬 Biodiversity networks</span>
              <span className="interest-pill">📊 Reproducible workflows</span>
            </div>
          </div>

          <div className="about-timeline">
            <div className="about-section-label">A few years of work</div>
            <ul className="timeline-list">
              <li className="timeline-item">
                <span className="timeline-year">2025</span>
                <div className="timeline-body">
                  <strong>Honours research</strong> — AVIRIS-NG hyperspectral &amp; LiDAR
                  classification of <em>Leucadendron argenteum</em> in TMNP (BioSCape).
                </div>
              </li>
              <li className="timeline-item">
                <span className="timeline-year">2025</span>
                <div className="timeline-body">
                  <strong>Marine ecology project</strong> — diel vertical migration of
                  <em> Euphausia lucens</em> in St Helena Bay, with Prof. Mark Gibbons.
                </div>
              </li>
              <li className="timeline-item">
                <span className="timeline-year">2024</span>
                <div className="timeline-body">
                  <strong>Multivariate distributions</strong> of South African Adder species
                  using SDMs and ordination (collaborative coursework).
                </div>
              </li>
              <li className="timeline-item">
                <span className="timeline-year">2023+</span>
                <div className="timeline-body">
                  <strong>Teaching &amp; notebooks</strong> — building open R/Python
                  notebooks for spatial science and biodiversity informatics.
                </div>
              </li>
            </ul>
          </div>

          <div className="about-cta-row">
            <a className="btn btn-primary">✉ Email Me</a>
            <a className="btn btn-ghost">⌥ GitHub</a>
            <a className="btn btn-ghost">in LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}

window.AboutSection = AboutSection;
