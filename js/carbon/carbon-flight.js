/* ============================================================
   Les Hyperion — Flight Carbon Calculator
   ------------------------------------------------------------
   ICAO ICEC v9 method. Depends on carbon-flight-data.js.
   ============================================================ */

const $c = id => document.getElementById(id);

/* ------------------------------------------------------------
   Great-circle distance (haversine, mean-radius sphere)
   ------------------------------------------------------------ */
function greatCircle(a, b) {
  if (!AIRPORTS[a] || !AIRPORTS[b]) return 0;
  const R = 6371.0088;
  const rad = d => d * Math.PI / 180;
  const la1 = rad(AIRPORTS[a].lat), lo1 = rad(AIRPORTS[a].lon);
  const la2 = rad(AIRPORTS[b].lat), lo2 = rad(AIRPORTS[b].lon);
  const h = Math.sin((la2 - la1) / 2) ** 2 +
            Math.cos(la1) * Math.cos(la2) * Math.sin((lo2 - lo1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/* ------------------------------------------------------------
   Trip fuel from the Appendix C curve.
   Linear interpolation between the two bracketing stage lengths.
   mode: 'low'  = below the shortest tabulated point (extrapolated)
         'in'   = interpolated inside the table
         'high' = beyond the last tabulated point (extrapolated)
   ------------------------------------------------------------ */
function fuelAt(code, nm) {
  const p = FUEL[code];
  if (!p) return null;
  const n = p.length;

  if (nm <= p[0][0]) {
    const slope = (p[1][1] - p[0][1]) / (p[1][0] - p[0][0]);
    return { kg: Math.max(0, p[0][1] + slope * (nm - p[0][0])), mode: 'low', lo: p[0], hi: p[1] };
  }
  for (let i = 0; i < n - 1; i++) {
    if (nm <= p[i + 1][0]) {
      const t = (nm - p[i][0]) / (p[i + 1][0] - p[i][0]);
      return { kg: p[i][1] + t * (p[i + 1][1] - p[i][1]), mode: 'in', lo: p[i], hi: p[i + 1], t };
    }
  }
  const slope = (p[n - 1][1] - p[n - 2][1]) / (p[n - 1][0] - p[n - 2][0]);
  return { kg: p[n - 1][1] + slope * (nm - p[n - 1][0]), mode: 'high', lo: p[n - 2], hi: p[n - 1] };
}

/* Route group drives both load factors (Appendix A) */
function groupFor(a, b) {
  if (!AIRPORTS[a] || !AIRPORTS[b]) return GROUPS.ZA_DOM;
  const ra = AIRPORTS[a].reg, rb = AIRPORTS[b].reg;
  if (ra === 'ZA' && rb === 'ZA') return GROUPS.ZA_DOM;
  const other = (ra === 'ZA') ? rb : ra;
  return GROUPS[other] || GROUPS.SSA;
}

/* ============================================================
   Select population — IN-SERVICE AIRCRAFT ONLY
   ============================================================ */
let tripScope = 'dom';

function airportOptions(domesticOnly) {
  return Object.keys(AIRPORTS)
    .filter(k => domesticOnly ? AIRPORTS[k].reg === 'ZA' : true)
    .map(k => `<option value="${k}">${k} — ${AIRPORTS[k].n}</option>`)
    .join('');
}

function fillAirports() {
  const fromEl = $c('from'), toEl = $c('to');
  const prevFrom = fromEl.value, prevTo = toEl.value;
  const opts = airportOptions(tripScope === 'dom');
  fromEl.innerHTML = opts;
  toEl.innerHTML   = opts;

  const valid = k => AIRPORTS[k] && (tripScope !== 'dom' || AIRPORTS[k].reg === 'ZA');
  fromEl.value = valid(prevFrom) ? prevFrom : 'JNB';
  toEl.value   = valid(prevTo)   ? prevTo   : (tripScope === 'dom' ? 'CPT' : 'LHR');
}

function fillOperators() {
  // Only operators that currently have at least one active airframe
  const ops = Object.keys(FLEET)
    .filter(op => operatorActiveModels(op).length > 0)
    .sort();
  $c('operator').innerHTML =
    '<option value="_all">All operators</option>' +
    ops.map(o => `<option value="${o}">${o}</option>`).join('');
}

function fillAircraft() {
  const op = $c('operator').value;
  const current = $c('aircraft').value;
  let list;

  if (op === '_all') {
    // Every type that at least one operator actively flies
    list = Array.from(inServiceModels()).sort();
  } else {
    list = operatorActiveModels(op).sort();
  }

  // Drop anything without an ICAO equivalent-aircraft row — it cannot be costed
  list = list.filter(m => AIRCRAFT[m] && AIRCRAFT[m].icao);

  $c('aircraft').innerHTML = list.map(m => {
    const a = AIRCRAFT[m];
    return `<option value="${m}">${m} · ${a.icao} · ${a.seats}Y</option>`;
  }).join('');

  if (list.indexOf(current) >= 0) $c('aircraft').value = current;
}

/* ============================================================
   Compute
   ============================================================ */
function computeFlight() {
  const model = $c('aircraft').value;
  const ac    = AIRCRAFT[model];
  const from  = $c('from').value;
  const to    = $c('to').value;

  const dist = greatCircle(from, to);
  const det  = detourFor(dist);
  const bill = dist + det.km;
  const nm   = bill / KM_PER_NM;

  const f   = (ac && ac.icao) ? fuelAt(ac.icao, nm) : null;
  const g   = groupFor(from, to);
  const pax = parseInt($c('pax').value) || 0;

  const planeCO2 = f ? f.kg * CO2_PER_KG_FUEL : 0;
  const paxShare = f ? planeCO2 * g[3] : 0;          // apply P2F
  const ySeats   = ac ? ac.seats * g[2] : 0;         // apply PLF
  const perPax   = ySeats > 0 ? paxShare / ySeats : 0;

  return {
    from, to, model, ac, f, g, pax,
    dist, det, bill, nm,
    planeCO2, paxShare, ySeats, perPax,
    total: perPax * pax,
    same: from === to,
    perPaxKm: dist > 0 ? perPax / dist * 1000 : 0,
  };
}

/* ============================================================
   Render the step-by-step working
   ============================================================ */
function renderFlight() {
  const c = computeFlight();

  if (!c.f) {
    $c('steps').innerHTML =
      '<div class="cstep"><div class="cstep-body">No ICAO fuel curve for this type.</div></div>';
    return;
  }

  const bracket = `${c.f.lo[0]} nm = ${c.f.lo[1].toLocaleString()} kg → ` +
                  `${c.f.hi[0]} nm = ${c.f.hi[1].toLocaleString()} kg`;

  const steps = [
    ['1', 'Great-circle distance',      `${c.from} → ${c.to}`,                                    `${c.dist.toFixed(0)} km`, ''],
    ['2', 'Detour correction',          `${c.dist.toFixed(0)} + ${c.det.km} (${c.det.band})`,      `${c.bill.toFixed(0)} km`, ''],
    ['3', 'Converted to stage length',  `${c.bill.toFixed(0)} ÷ ${KM_PER_NM}`,                     `${c.nm.toFixed(1)} nm`,   ''],
    ['4', 'Trip fuel, interpolated',    `ICAO ${c.ac.icao} curve`,                                 `${c.f.kg.toFixed(0)} kg`, bracket],
    ['5', 'CO₂ from that fuel',         `${c.f.kg.toFixed(0)} × ${CO2_PER_KG_FUEL}`,               `${c.planeCO2.toFixed(0)} kg`, ''],
    ['6', 'Passenger share',            `${c.planeCO2.toFixed(0)} × ${c.g[3]} (P2F)`,              `${c.paxShare.toFixed(0)} kg`, ''],
    ['7', 'Seats actually filled',      `${c.ac.seats}Y × ${c.g[2]} (PLF)`,                        c.ySeats.toFixed(1), `route group ${c.g[0]} · ${c.g[1]}`],
    ['8', 'Share per passenger',        `${c.paxShare.toFixed(0)} ÷ ${c.ySeats.toFixed(1)}`,       `${c.perPax.toFixed(1)} kg`, ''],
  ];

  $c('steps').innerHTML = steps.map(s =>
    `<div class="cstep">
       <span class="cstep-n">${s[0]}</span>
       <div class="cstep-body">
         <div class="cstep-lb">${s[1]}</div>
         <div class="cstep-ex">${s[2]}</div>
         ${s[4] ? `<div class="cstep-brk">${s[4]}</div>` : ''}
       </div>
       <span class="cstep-vl">${s[3]}</span>
     </div>`).join('');

  /* Flags */
  let flags = '';
  if (c.f.mode === 'low') {
    flags += `<div class="cflag">▲<span><strong>${c.nm.toFixed(0)} nm is below ICAO's shortest
      tabulated stage length (125 nm).</strong> Fuel is extrapolated backwards off the 125–250 nm
      segment. Take-off dominates burn at this range, so treat the figure as indicative.</span></div>`;
  }
  if (c.f.mode === 'high') {
    flags += `<div class="cflag stop">▲<span><strong>${c.nm.toFixed(0)} nm is beyond the last
      tabulated point for the ${c.ac.icao} curve (${c.f.hi[0]} nm).</strong> Fuel is extrapolated off
      the final segment — check the airframe is right for this route.</span></div>`;
  }
  if (c.ac.src === 'typ') {
    flags += `<div class="cflag">▲<span>Y-seat count for this type is a typical all-economy
      configuration, not a figure from the fleet sheet. Confirm the operator's actual layout
      before reporting.</span></div>`;
  }
  $c('flags').innerHTML = flags;

  /* Totals */
  $c('totlb').textContent = `This leg · ${c.pax} passenger${c.pax === 1 ? '' : 's'}`;
  $c('tott').innerHTML    = `${(c.total / 1000).toFixed(3)}<span> tCO₂</span>`;
  $c('totd').textContent  = `${c.perPax.toFixed(1)} kg`;
  $c('cnote').textContent =
    `${c.perPaxKm.toFixed(0)} g CO₂ per passenger-km. Short hops run high because take-off burns a ` +
    `fixed chunk of fuel regardless of how far you fly.`;

  $c('warn').style.display = c.same ? 'flex' : 'none';
  $c('save').disabled = c.same || !$c('name').value.trim();
}
