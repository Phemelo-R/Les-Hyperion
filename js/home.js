/* ============================================================
   Les Hyperion — Home Page
   Globe (D3 + Natural Earth) + 3 orbiting satellites
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initGlobe();
  initFeatured();
});

/* ============================================================
   Globe
   ============================================================ */
async function initGlobe() {
  const wrap = document.getElementById('globe-wrap');
  if (!wrap) return;

  const size = wrap.clientWidth || 400;
  const canvas = document.createElement('canvas');
  canvas.width  = size * devicePixelRatio;
  canvas.height = size * devicePixelRatio;
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
  canvas.style.borderRadius = '50%';
  wrap.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(devicePixelRatio, devicePixelRatio);

  let world;
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    world = await res.json();
  } catch (e) {
    drawFallbackSphere(ctx, size);
    return;
  }

  const topojson = window.topojson;
  const d3       = window.d3;
  if (!topojson || !d3) return;

  const land    = topojson.feature(world, world.objects.land);
  const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

  const globeR = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;

  const projection = d3.geoOrthographic()
    .scale(globeR)
    .translate([cx, cy])
    .clipAngle(90);

  const path = d3.geoPath(projection, ctx);

  let lon  = 24;
  let lat  = -10;
  let drag = false;
  let lastX = 0;

  canvas.addEventListener('mousedown',  e => { drag = true;  lastX = e.clientX; });
  canvas.addEventListener('touchstart', e => { drag = true;  lastX = e.touches[0].clientX; });
  window.addEventListener('mouseup',    () => { drag = false; });
  window.addEventListener('touchend',   () => { drag = false; });
  canvas.addEventListener('mousemove',  e => { if (drag) { lon += (e.clientX - lastX) * 0.4; lastX = e.clientX; } });
  canvas.addEventListener('touchmove',  e => { if (drag) { lon += (e.touches[0].clientX - lastX) * 0.4; lastX = e.touches[0].clientX; } });

  // ---- Satellite definitions ----
  // inc:   orbital inclination in degrees (0 = equatorial, 90 = polar)
  // tilt:  rotation of the orbital plane around the z-axis (visual variety)
  // speed: angular velocity (radians per ms)
  // phase: starting angle offset
  const SATELLITES = [
    { inc: 38,  tilt:  10, speed: 0.00042, phase: 0               },  // blue  — ISS-like
    { inc: 70,  tilt:  55, speed: 0.00031, phase: Math.PI * 0.65  },  // green — high inclination
    { inc: 85,  tilt: -35, speed: 0.00055, phase: Math.PI * 1.35  },  // amber — near-polar
  ];

  function draw(timestamp) {
    if (!drag) lon += 0.06;
    projection.rotate([lon, lat]);

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const oceanColor  = isDark ? '#0b1a2e' : '#dbeafe';
    const landColor   = isDark ? '#1a2e1a' : '#d1e8d1';
    const borderColor = isDark ? 'rgba(74,158,255,0.15)'  : 'rgba(30,111,217,0.15)';
    const coastColor  = isDark ? 'rgba(56,201,138,0.5)'   : 'rgba(31,142,93,0.55)';
    const gridColor   = isDark ? 'rgba(74,158,255,0.07)'  : 'rgba(30,111,217,0.08)';
    const sphereGlow  = isDark ? 'rgba(74,158,255,0.08)'  : 'rgba(30,111,217,0.06)';
    const pinColor    = isDark ? '#4a9eff' : '#1e6fd9';
    const pingColor   = isDark ? '#38c98a' : '#1f8e5d';

    const SAT_COLORS = isDark
      ? ['#4a9eff', '#38c98a', '#f5a623']
      : ['#1e6fd9', '#1f8e5d', '#d18514'];

    ctx.clearRect(0, 0, size, size);

    // Outer glow
    const grd = ctx.createRadialGradient(cx, cy, globeR - 12, cx, cy, globeR + 4);
    grd.addColorStop(0, sphereGlow);
    grd.addColorStop(1, 'transparent');
    ctx.beginPath(); path({type:'Sphere'}); ctx.fillStyle = grd; ctx.fill();

    // Ocean
    ctx.beginPath(); path({type:'Sphere'}); ctx.fillStyle = oceanColor; ctx.fill();

    // Graticule
    ctx.beginPath(); path(d3.geoGraticule()()); ctx.strokeStyle = gridColor; ctx.lineWidth = 0.5; ctx.stroke();

    // Land
    ctx.beginPath(); path(land); ctx.fillStyle = landColor; ctx.fill();
    ctx.strokeStyle = coastColor; ctx.lineWidth = 0.8; ctx.stroke();

    // Borders
    ctx.beginPath(); path(borders); ctx.strokeStyle = borderColor; ctx.lineWidth = 0.4; ctx.stroke();

    // ---- Satellites (drawn in two passes: back then front, so front is on top) ----
    const orbitR = globeR + 20;

    // Compute satellite positions
    const satData = SATELLITES.map((sat, i) => {
      const theta    = timestamp * sat.speed + sat.phase;
      const incRad   = sat.inc  * Math.PI / 180;
      const tiltRad  = sat.tilt * Math.PI / 180;

      // Position in orbital plane (x = horizontal, y = vertical squished by inc)
      const ox = orbitR * Math.cos(theta);
      const oy = orbitR * Math.sin(theta) * Math.cos(incRad);
      const oz = orbitR * Math.sin(theta) * Math.sin(incRad); // + = in front

      // Rotate orbital plane by tilt around view-z axis
      const px = ox * Math.cos(tiltRad) - oy * Math.sin(tiltRad);
      const py = ox * Math.sin(tiltRad) + oy * Math.cos(tiltRad);

      return { px: cx + px, py: cy + py, oz, tiltRad, incRad, color: SAT_COLORS[i], sat };
    });

    // Back-pass: draw orbit rings and satellites behind the globe
    satData.forEach(({ tiltRad, incRad, oz, px, py, color }) => {
      drawOrbitRing(ctx, cx, cy, orbitR, incRad, tiltRad, isDark);
    });

    // Globe sphere border (drawn after orbit rings but before front-pass satellites)
    ctx.beginPath(); path({type:'Sphere'});
    ctx.strokeStyle = isDark ? 'rgba(100,160,220,0.2)' : 'rgba(30,111,217,0.2)';
    ctx.lineWidth = 1; ctx.stroke();

    // City pins
    drawPin(ctx, projection, [18.42, -33.92], pingColor, timestamp, true);  // Cape Town
    drawPin(ctx, projection, [28.05, -26.20], pinColor,  timestamp, false); // Johannesburg

    // Front-pass: draw satellites in front of globe
    satData.forEach(({ px, py, oz, color }) => {
      if (oz >= -orbitR * 0.15) { // show even slightly behind edge
        const alpha = oz < 0 ? 0.4 + 0.6 * (1 + oz / (orbitR * 0.15)) : 1;
        drawSatellite(ctx, px, py, color, alpha);
      }
    });

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

/* ---- Draw a dashed orbit ring ellipse ---- */
function drawOrbitRing(ctx, cx, cy, r, incRad, tiltRad, isDark) {
  const a = r;                      // semi-major axis
  const b = r * Math.cos(incRad);  // semi-minor axis (squished by inclination)

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);
  ctx.beginPath();
  ctx.ellipse(0, 0, a, Math.abs(b), 0, 0, Math.PI * 2);
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(30,60,120,0.09)';
  ctx.setLineDash([3, 8]);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/* ---- Draw a small satellite icon ---- */
function drawSatellite(ctx, x, y, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 6); // slight tilt for visual interest

  // Body
  ctx.fillStyle = color;
  ctx.fillRect(-4, -2.5, 8, 5);

  // Solar panels — left
  ctx.fillStyle = isDarkTheme() ? 'rgba(74,158,255,0.7)' : 'rgba(30,111,217,0.65)';
  ctx.fillRect(-13, -1.5, 7, 3);

  // Solar panels — right
  ctx.fillRect(6, -1.5, 7, 3);

  // Panel dividers (thin lines)
  ctx.strokeStyle = isDarkTheme() ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-9.5, -1.5); ctx.lineTo(-9.5, 1.5);
  ctx.moveTo(9.5,  -1.5); ctx.lineTo(9.5,  1.5);
  ctx.stroke();

  // Antenna — tiny dot/line
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, -4, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -2.5); ctx.lineTo(0, -4);
  ctx.stroke();

  ctx.restore();
}

function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/* ---- City pin with optional pulse ---- */
function drawPin(ctx, projection, lonlat, color, timestamp, pulse) {
  const pos = projection(lonlat);
  if (!pos) return;

  if (pulse) {
    const p = (Math.sin(timestamp / 600) + 1) / 2;
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], 4 + p * 5, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth   = 1;
    ctx.globalAlpha = 1 - p * 0.7;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.beginPath();
  ctx.arc(pos[0], pos[1], pulse ? 3.5 : 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawFallbackSphere(ctx, size) {
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = '#0b1a2e';
  ctx.fill();
}

/* ============================================================
   Featured Notebooks (home page)
   buildNbCard is defined in data.js which loads before this file.
   ============================================================ */
function initFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid || typeof NOTEBOOKS === 'undefined') return;

  // Picks notebooks marked featured: true in data.js, up to 6.
  // Falls back to first 6 if none are marked.
  let featured = (typeof NOTEBOOKS !== 'undefined' ? NOTEBOOKS : [])
    .filter(n => n.featured);
  if (!featured.length) {
    featured = (typeof NOTEBOOKS !== 'undefined' ? NOTEBOOKS : []).slice(0, 6);
  }
  featured = featured.slice(0, 6);
  featured.forEach(nb => {
    const cat   = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : {})[nb.category] || {};
    const color = cat.color || 'var(--accent)';
    const card  = window.buildNbCard(nb, color);

    card.addEventListener('click', () => {
      window.location.href = `notebooks.html#${nb.file}`;
    });

    grid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });

  // Fetch real first-code-cell preview for each card
  initHomePreviews(grid);
}

function initHomePreviews(grid) {
  const previews = grid.querySelectorAll('.nb-preview[data-nb-file]');
  if (!previews.length) return;

  const obs = new IntersectionObserver(async entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      obs.unobserve(entry.target);

      const file    = entry.target.dataset.nbFile;
      const pattern = entry.target.querySelector('.nb-pattern');
      if (!pattern) continue;

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
        if (!lines.length) continue;
        pattern.innerHTML = `
          <div class="nb-cell-head">In [1]:</div>
          ${lines.map(l => {
            const esc = l.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            return esc.trimStart().startsWith('#')
              ? `<div class="nb-out-line">${esc}</div>`
              : `<div class="nb-code-line">${esc}</div>`;
          }).join('')}`;
      } catch (e) { /* leave fallback */ }
    }
  }, { rootMargin: '200px' });

  previews.forEach(el => obs.observe(el));
}