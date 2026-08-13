/* ============================================================
   Les Hyperion — Carbon Figures
   ------------------------------------------------------------
   Draws the charts from the shared log.
   Chart.js is loaded from CDN in carbon.html.
   ============================================================ */

const CarbonCharts = {

  monthly: null,
  split:   null,

  cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  },

  palette() {
    return {
      accent:  this.cssVar('--accent')     || '#1e6fd9',
      accent2: this.cssVar('--accent2')    || '#1f8e5d',
      accent3: this.cssVar('--accent3')    || '#d18514',
      accent4: this.cssVar('--accent4')    || '#8a35d4',
      accent5: this.cssVar('--accent5')    || '#c93060',
      text:    this.cssVar('--text-muted') || '#4f6480',
      faint:   this.cssVar('--text-faint') || '#8aa0bd',
      border:  this.cssVar('--border')     || 'rgba(28,60,100,0.12)',
    };
  },

  /* ----------------------------------------------------------
     Aggregate: total tCO2 per calendar month
     ---------------------------------------------------------- */
  byMonth(entries) {
    const buckets = {};
    entries.forEach(e => {
      if (!e.date) return;
      const key = String(e.date).slice(0, 7);       // YYYY-MM
      if (!/^\d{4}-\d{2}$/.test(key)) return;
      buckets[key] = (buckets[key] || 0) + (parseFloat(e.tco2) || 0);
    });

    const keys = Object.keys(buckets).sort();
    if (!keys.length) return { labels: [], values: [], cumulative: [] };

    // Fill gaps so the line reads as a true time series
    const out = [];
    let [y, m] = keys[0].split('-').map(Number);
    const [ey, em] = keys[keys.length - 1].split('-').map(Number);
    while (y < ey || (y === ey && m <= em)) {
      const k = `${y}-${String(m).padStart(2, '0')}`;
      out.push([k, buckets[k] || 0]);
      m++; if (m > 12) { m = 1; y++; }
    }

    let run = 0;
    return {
      labels:     out.map(([k]) => this.monthLabel(k)),
      values:     out.map(([, v]) => +v.toFixed(3)),
      cumulative: out.map(([, v]) => +(run += v).toFixed(3)),
    };
  },

  monthLabel(k) {
    const [y, m] = k.split('-');
    const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${names[+m - 1]} ${y.slice(2)}`;
  },

  /* ----------------------------------------------------------
     Aggregate: total tCO2 per landscape
     ---------------------------------------------------------- */
  byLandscape(entries) {
    const buckets = {};
    entries.forEach(e => {
      const k = e.landscape || 'Other';
      buckets[k] = (buckets[k] || 0) + (parseFloat(e.tco2) || 0);
    });
    const pairs = Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
    return {
      labels: pairs.map(([k]) => k),
      values: pairs.map(([, v]) => +v.toFixed(3)),
    };
  },

  /* ----------------------------------------------------------
     Draw / redraw
     ---------------------------------------------------------- */
  render(entries) {
    if (typeof Chart === 'undefined') return;

    const p = this.palette();
    const month = this.byMonth(entries);
    const land  = this.byLandscape(entries);

    const empty = !entries.length || !month.labels.length;
    document.getElementById('fig-empty').style.display  = empty ? 'block' : 'none';
    document.getElementById('fig-canvases').style.display = empty ? 'none' : 'grid';
    if (empty) return;

    /* Headline stats */
    const total = entries.reduce((s, e) => s + (parseFloat(e.tco2) || 0), 0);
    const legs  = entries.length;
    const peak  = Math.max(...month.values);
    const avg   = month.values.length ? total / month.values.length : 0;

    this.stat('stat-total', total.toFixed(2), 'tCO₂ logged');
    this.stat('stat-legs',  legs.toString(),  legs === 1 ? 'leg recorded' : 'legs recorded');
    this.stat('stat-avg',   avg.toFixed(2),   'tCO₂ monthly average');
    this.stat('stat-peak',  peak.toFixed(2),  'tCO₂ busiest month');

    const gridColor = p.border;
    const baseOpts = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: p.text, font: { family: 'DM Mono, monospace', size: 11 }, boxWidth: 12, padding: 14 },
        },
        tooltip: {
          backgroundColor: this.cssVar('--bg3'),
          titleColor: this.cssVar('--text'),
          bodyColor: p.text,
          borderColor: p.border,
          borderWidth: 1,
          padding: 10,
          titleFont: { family: 'Syne, sans-serif', size: 12 },
          bodyFont:  { family: 'DM Mono, monospace', size: 11 },
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y ?? ctx.parsed} tCO₂` },
        },
      },
      scales: {
        x: { grid: { color: gridColor, drawBorder: false },
             ticks: { color: p.faint, font: { family: 'DM Mono, monospace', size: 10 } } },
        y: { grid: { color: gridColor, drawBorder: false },
             ticks: { color: p.faint, font: { family: 'DM Mono, monospace', size: 10 } },
             title: { display: true, text: 'tCO₂', color: p.faint,
                      font: { family: 'DM Mono, monospace', size: 10 } } },
      },
    };

    /* --- Figure 1: monthly emissions + cumulative --- */
    if (this.monthly) this.monthly.destroy();
    this.monthly = new Chart(document.getElementById('chart-monthly'), {
      type: 'bar',
      data: {
        labels: month.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Monthly',
            data: month.values,
            backgroundColor: p.accent + '99',
            borderColor: p.accent,
            borderWidth: 1,
            borderRadius: 3,
            order: 2,
          },
          {
            type: 'line',
            label: 'Cumulative',
            data: month.cumulative,
            borderColor: p.accent2,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: p.accent2,
            tension: 0.28,
            yAxisID: 'y1',
            order: 1,
          },
        ],
      },
      options: {
        ...baseOpts,
        scales: {
          ...baseOpts.scales,
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { color: p.faint, font: { family: 'DM Mono, monospace', size: 10 } },
            title: { display: true, text: 'cumulative tCO₂', color: p.faint,
                     font: { family: 'DM Mono, monospace', size: 10 } },
          },
        },
      },
    });

    /* --- Figure 2: split by landscape --- */
    if (this.split) this.split.destroy();
    const colours = [p.accent, p.accent2, p.accent3, p.accent4, p.accent5,
                     p.accent + 'aa', p.accent2 + 'aa', p.accent3 + 'aa'];
    this.split = new Chart(document.getElementById('chart-landscape'), {
      type: 'doughnut',
      data: {
        labels: land.labels,
        datasets: [{
          data: land.values,
          backgroundColor: land.labels.map((_, i) => colours[i % colours.length]),
          borderColor: this.cssVar('--bg') || '#fff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: p.text, font: { family: 'DM Mono, monospace', size: 10 },
                      boxWidth: 10, padding: 10 },
          },
          tooltip: {
            backgroundColor: this.cssVar('--bg3'),
            titleColor: this.cssVar('--text'),
            bodyColor: p.text,
            borderColor: p.border,
            borderWidth: 1,
            padding: 10,
            bodyFont: { family: 'DM Mono, monospace', size: 11 },
            callbacks: {
              label: ctx => {
                const sum = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = sum ? (ctx.parsed / sum * 100).toFixed(1) : 0;
                return ` ${ctx.label}: ${ctx.parsed} tCO₂ (${pct}%)`;
              },
            },
          },
        },
      },
    });
  },

  stat(id, value, label) {
    const el = document.getElementById(id);
    if (!el) return;
    el.querySelector('.cstat-v').textContent = value;
    el.querySelector('.cstat-l').textContent = label;
  },

  /* Redraw on theme change so colours track the tokens */
  watchTheme(getEntries) {
    new MutationObserver(() => {
      setTimeout(() => this.render(getEntries()), 60);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  },
};
