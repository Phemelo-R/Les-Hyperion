/* ============================================================
   Les Hyperion — Carbon Tracker Controller
   ------------------------------------------------------------
   Wires the form, calculator, log store and figures together.
   Loaded last; everything else is a dependency.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  buildModeBar();
  buildLandscapes();

  fillOperators();
  fillAirports();
  fillAircraft();

  $c('date').value = new Date().toISOString().slice(0, 10);

  wireForm();
  wireSave();
  wireExport();

  CarbonLog.restoreLocal();
  renderFlight();
  renderLogTable();
  refreshFigures();

  CarbonCharts.watchTheme(() => CarbonLog.entries);
  CarbonLog.pushPending();
});

/* ------------------------------------------------------------
   Mode selector (only ready modes are clickable)
   ------------------------------------------------------------ */
function buildModeBar() {
  const bar = $c('modebar');
  if (!bar) return;
  bar.innerHTML = CARBON_CONFIG.modes.map(m =>
    `<button class="cmode${m.ready ? '' : ' soon'}${m.id === 'flight' ? ' active' : ''}"
             data-mode="${m.id}" ${m.ready ? '' : 'disabled'}>
       <span class="cmode-i">${m.icon}</span>${m.label}
       ${m.ready ? '' : '<span class="cmode-soon">soon</span>'}
     </button>`).join('');

  bar.querySelectorAll('.cmode').forEach(b => {
    b.addEventListener('click', () => {
      if (b.classList.contains('soon')) return;
      bar.querySelectorAll('.cmode').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });
}

function buildLandscapes() {
  const el = $c('landscape');
  if (!el) return;
  el.innerHTML = CARBON_CONFIG.landscapes
    .map(l => `<option value="${l}">${l}</option>`).join('');
}

/* ------------------------------------------------------------
   Form wiring
   ------------------------------------------------------------ */
function wireForm() {
  $c('seg').querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => {
      $c('seg').querySelectorAll('button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      tripScope = b.dataset.trip;
      fillAirports();
      renderFlight();
    });
  });

  $c('operator').addEventListener('change', () => { fillAircraft(); renderFlight(); });
  ['date', 'name', 'landscape', 'from', 'to', 'aircraft', 'pax'].forEach(id => {
    $c(id).addEventListener('input', renderFlight);
  });
}

/* ------------------------------------------------------------
   Save a leg
   ------------------------------------------------------------ */
function wireSave() {
  $c('save').addEventListener('click', async () => {
    const c = computeFlight();
    if (c.same || !$c('name').value.trim() || !c.f) return;

    CarbonLog.add({
      date:      $c('date').value,
      mode:      'flight',
      name:      $c('name').value.trim(),
      landscape: $c('landscape').value,
      operator:  $c('operator').value === '_all' ? '' : $c('operator').value,
      aircraft:  c.model,
      icao:      c.ac.icao,
      from:      c.from,
      to:        c.to,
      pax:       c.pax,
      dist:      +c.dist.toFixed(1),
      det:       c.det.km,
      bill:      +c.bill.toFixed(1),
      nm:        +c.nm.toFixed(1),
      interp:    c.f.mode,
      fuel:      +c.f.kg.toFixed(1),
      grp:       c.g[0],
      plf:       c.g[2],
      p2f:       c.g[3],
      perPax:    +c.perPax.toFixed(2),
      tco2:      +(c.total / 1000).toFixed(5),
    });

    renderLogTable();
    refreshFigures();

    const b = $c('save');
    b.classList.add('ok');
    b.textContent = 'Leg saved ✓';
    setTimeout(() => { b.classList.remove('ok'); b.textContent = 'Save this leg'; }, 1600);
  });
}

function wireExport() {
  $c('export').addEventListener('click', () => CarbonLog.exportCSV());
}

/* ------------------------------------------------------------
   Log table
   ------------------------------------------------------------ */
function renderLogTable() {
  const body = $c('logbody');
  const local = CarbonLog.entries.filter(e => !e.remote);

  if (!local.length) {
    body.innerHTML = '<tr><td colspan="9" class="cempty">Fill in the form above and save your first leg.</td></tr>';
    $c('summary').textContent = 'No legs logged yet.';
    return;
  }

  body.innerHTML = local.map(e =>
    `<tr>
       <td>${e.date}</td>
       <td>${e.name}</td>
       <td class="num">${e.from}→${e.to}</td>
       <td style="font-size:.78rem">${e.aircraft}</td>
       <td class="num">${e.pax}</td>
       <td class="num">${(e.dist || 0).toFixed(0)}</td>
       <td class="num">${(e.fuel || 0).toFixed(0)}</td>
       <td class="num co2">${(e.tco2 || 0).toFixed(3)}</td>
       <td><button class="cdel" data-id="${e.id}" aria-label="Delete">🗑</button></td>
     </tr>`).join('');

  const total = local.reduce((s, e) => s + (e.tco2 || 0), 0);
  $c('summary').innerHTML =
    `${local.length} leg${local.length === 1 ? '' : 's'} · <strong>${total.toFixed(3)} tCO₂</strong>`;

  body.querySelectorAll('.cdel').forEach(btn => {
    btn.addEventListener('click', () => {
      CarbonLog.remove(btn.dataset.id);
      renderLogTable();
      refreshFigures();
    });
  });
}

/* ------------------------------------------------------------
   Figures
   ------------------------------------------------------------ */
async function refreshFigures() {
  CarbonCharts.render(CarbonLog.entries);

  const remote = await CarbonLog.pull();
  if (remote && remote.length) {
    const localOnly = CarbonLog.entries.filter(e => !e.remote);
    const ids = new Set(remote.map(r => r.id));
    CarbonLog.entries = remote.concat(localOnly.filter(e => !ids.has(e.id)));
    CarbonCharts.render(CarbonLog.entries);
    $c('fig-source').textContent = 'Shared workbook · live';
  } else {
    $c('fig-source').textContent = CARBON_CONFIG.readEndpoint
      ? 'Shared workbook unreachable — showing this device only'
      : 'This device only — connect a flow to pool the organisation';
  }
}
