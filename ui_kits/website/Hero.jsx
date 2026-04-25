/* Hero.jsx — light/dark aware spinning globe with country outlines, whirl, and orbiting satellites */
function Hero({ onBrowse, onContact }) {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="hero-eyebrow">GIS · Remote Sensing · R · Python</div>
        <h1 className="hero-title">
          <span className="a1">Mapping Nature,</span><br/>
          Quantifying<br/>
          <span className="a2">Biodiversity</span>
        </h1>
        <p className="hero-desc">
          From satellite pixels to species networks — reproducible spatial science
          at the intersection of remote sensing, quantitative ecology,
          and biodiversity informatics.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary" onClick={onBrowse}>Browse Notebooks →</button>
          <button className="btn btn-ghost" onClick={onContact}>Get in Touch</button>
        </div>
      </div>
      <div className="hero-visual">
        <SpinningGlobe/>
      </div>
    </section>
  );
}

/* === SpinningGlobe ===
   Canvas-rendered orthographic globe with simplified country outlines (low-res world coastlines),
   a graticule (lat/lon grid), a swirling vortex ring around the disc, and three satellites
   tracing inclined orbits. Designed to feel scientific and calm. */
function SpinningGlobe() {
  const cvs = useRef(null);
  const wrap = useRef(null);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, R = 0, cx = 0, cy = 0;

    const resize = () => {
      const rect = wrap.current.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr,0,0,dpr,0,0);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.34;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap.current);

    const ctx = canvas.getContext('2d');

    // Coastline data: array of polylines (lon, lat in degrees) — simplified continent outlines.
    // Hand-tuned low-res; not geodetically perfect, but reads as "Earth".
    const COAST = window.__COAST_LINES;

    let raf;
    const start = performance.now();

    const project = (lon, lat, rotLon) => {
      // Orthographic, rotation around y-axis only, slight axial tilt
      const TILT = 18 * Math.PI / 180;
      const phi = lat * Math.PI / 180;
      const lam = (lon + rotLon) * Math.PI / 180;
      // before tilt
      let x = Math.cos(phi) * Math.sin(lam);
      let y = Math.sin(phi);
      let z = Math.cos(phi) * Math.cos(lam);
      // axial tilt around x
      const yt = y * Math.cos(TILT) - z * Math.sin(TILT);
      const zt = y * Math.sin(TILT) + z * Math.cos(TILT);
      return { x, y: yt, z: zt };
    };

    const isDark = () => document.documentElement.dataset.theme === 'dark';

    const drawFrame = (now) => {
      const t = (now - start) / 1000;
      const rot = (t * 9) % 360; // 9°/s -> 40s per revolution
      ctx.clearRect(0, 0, W, H);

      const dark = isDark();
      const oceanGrad = ctx.createRadialGradient(cx - R*0.3, cy - R*0.3, R*0.1, cx, cy, R);
      if (dark) {
        oceanGrad.addColorStop(0, '#173049');
        oceanGrad.addColorStop(0.55, '#0f1f33');
        oceanGrad.addColorStop(1, '#070d18');
      } else {
        oceanGrad.addColorStop(0, '#cfe4f7');
        oceanGrad.addColorStop(0.55, '#9ec5e9');
        oceanGrad.addColorStop(1, '#5d8fc0');
      }

      // ----- whirl/vortex (drawn behind globe) -----
      ctx.save();
      ctx.translate(cx, cy);
      const whirlSteps = 110;
      for (let i = 0; i < whirlSteps; i++) {
        const a = (i / whirlSteps) * Math.PI * 2 * 4 - t * 0.55;
        const r = R * 1.08 + (i * 0.55);
        const alpha = (1 - i / whirlSteps) * (dark ? 0.18 : 0.22);
        ctx.beginPath();
        ctx.arc(Math.cos(a)*0.4, Math.sin(a)*0.4, r, a, a + 0.045);
        ctx.strokeStyle = `rgba(74,158,255,${alpha})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      // a second teal whirl, opposing direction
      for (let i = 0; i < whirlSteps; i++) {
        const a = -(i / whirlSteps) * Math.PI * 2 * 4 + t * 0.4;
        const r = R * 1.18 + (i * 0.7);
        const alpha = (1 - i / whirlSteps) * (dark ? 0.10 : 0.14);
        ctx.beginPath();
        ctx.arc(0, 0, r, a, a + 0.04);
        ctx.strokeStyle = `rgba(56,201,138,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();

      // ----- ocean disc -----
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // ----- atmosphere glow rim -----
      const rim = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.18);
      rim.addColorStop(0, 'rgba(74,158,255,0)');
      rim.addColorStop(0.5, dark ? 'rgba(74,158,255,0.18)' : 'rgba(74,158,255,0.28)');
      rim.addColorStop(1, 'rgba(74,158,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.18, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      // clip to globe disc
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // ----- graticule -----
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = dark ? 'rgba(120,170,220,0.18)' : 'rgba(255,255,255,0.5)';
      // meridians every 30 deg
      for (let lon = -180; lon < 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 4) {
          const p = project(lon, lat, rot);
          if (p.z > -0.05) {
            const x = cx + p.x * R, y = cy + p.y * R * -1;
            if (!started) { ctx.moveTo(x, y); started = true; }
            else ctx.lineTo(x, y);
          } else { started = false; }
        }
        ctx.stroke();
      }
      // parallels every 30 deg
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const p = project(lon, lat, rot);
          if (p.z > -0.05) {
            const x = cx + p.x * R, y = cy + p.y * R * -1;
            if (!started) { ctx.moveTo(x, y); started = true; }
            else ctx.lineTo(x, y);
          } else { started = false; }
        }
        ctx.stroke();
      }

      // ----- coastlines -----
      ctx.lineWidth = 1.4;
      const landFill = dark ? 'rgba(56,201,138,0.18)' : 'rgba(56,201,138,0.32)';
      const landStroke = dark ? '#5fd9a0' : '#1f8e5d';
      for (const ring of COAST) {
        // fill
        ctx.beginPath();
        let started = false;
        for (const [lon, lat] of ring) {
          const p = project(lon, lat, rot);
          if (p.z > 0) {
            const x = cx + p.x * R, y = cy + p.y * R * -1;
            if (!started) { ctx.moveTo(x, y); started = true; }
            else ctx.lineTo(x, y);
          } else { started = false; }
        }
        if (started) {
          ctx.closePath();
          ctx.fillStyle = landFill;
          ctx.fill();
        }
        // stroke
        ctx.beginPath();
        started = false;
        for (const [lon, lat] of ring) {
          const p = project(lon, lat, rot);
          if (p.z > 0) {
            const x = cx + p.x * R, y = cy + p.y * R * -1;
            if (!started) { ctx.moveTo(x, y); started = true; }
            else ctx.lineTo(x, y);
          } else { started = false; }
        }
        ctx.strokeStyle = landStroke;
        ctx.stroke();
      }

      ctx.restore(); // unclip

      // ----- satellites -----
      const sats = [
        { speed: 0.55, tilt:  0.55, phase: 0,         color: '#4a9eff', radius: R * 1.30 },
        { speed: 0.40, tilt: -0.85, phase: 2.1,       color: '#38c98a', radius: R * 1.42 },
        { speed: 0.70, tilt:  1.30, phase: 4.2,       color: '#f5a623', radius: R * 1.22 },
      ];
      for (const s of sats) {
        const a = t * s.speed + s.phase;
        const ox = Math.cos(a) * s.radius;
        const oy = Math.sin(a) * s.radius * Math.cos(s.tilt);
        const oz = Math.sin(a) * s.radius * Math.sin(s.tilt);
        const front = oz > 0;
        const sx = cx + ox;
        const sy = cy + oy;
        // orbit path (faint)
        ctx.beginPath();
        ctx.ellipse(cx, cy, s.radius, s.radius * Math.abs(Math.cos(s.tilt)), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${s.color === '#4a9eff' ? '74,158,255' : s.color === '#38c98a' ? '56,201,138' : '245,166,35'},${dark?0.16:0.22})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        // satellite dot
        ctx.beginPath();
        ctx.arc(sx, sy, front ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = front ? 1 : 0.35;
        ctx.shadowBlur = front ? 14 : 0;
        ctx.shadowColor = s.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        // small "panels" (two ticks)
        if (front) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(sx - 9, sy);
          ctx.lineTo(sx - 4, sy);
          ctx.moveTo(sx + 4, sy);
          ctx.lineTo(sx + 9, sy);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(drawFrame);
    };
    raf = requestAnimationFrame(drawFrame);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="globe-wrap" ref={wrap}>
      <canvas ref={cvs}></canvas>
    </div>
  );
}

window.Hero = Hero;
window.SpinningGlobe = SpinningGlobe;
