/* ============================================================
   Les Hyperion — Carbon Log Store
   ------------------------------------------------------------
   Holds logged legs, pushes them to Power Automate, pulls the
   full history back for the figures, and exports CSV.
   ============================================================ */

const CarbonLog = {

  entries: [],          // this session + anything pulled back
  synced: new Set(),    // ids already accepted by the flow

  /* ----------------------------------------------------------
     Add a leg
     ---------------------------------------------------------- */
  add(entry) {
    entry.id = entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.entries.unshift(entry);
    this.persistLocal();
    this.push(entry);
    return entry;
  },

  remove(id) {
    this.entries = this.entries.filter(e => e.id !== id);
    this.persistLocal();
  },

  /* ----------------------------------------------------------
     Local persistence — survives a refresh, and keeps entries
     that failed to reach the flow so they are not lost.
     ---------------------------------------------------------- */
  persistLocal() {
    try {
      localStorage.setItem(CARBON_CONFIG.storageKey, JSON.stringify(this.entries.slice(0, 500)));
    } catch (e) { /* storage full or blocked — not fatal */ }
  },

  restoreLocal() {
    try {
      const raw = localStorage.getItem(CARBON_CONFIG.storageKey);
      if (raw) this.entries = JSON.parse(raw) || [];
    } catch (e) { this.entries = []; }
  },

  /* ----------------------------------------------------------
     PUSH → Power Automate ("When an HTTP request is received")
     The flow's next action writes the row into Excel Online.
     ---------------------------------------------------------- */
  async push(entry) {
    const url = CARBON_CONFIG.writeEndpoint;
    if (!url) { this.setStatus('local', 'Saved locally — no flow connected'); return false; }

    this.setStatus('syncing', 'Sending to Power Automate…');

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CARBON_CONFIG.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        signal: ctrl.signal,
      });
      clearTimeout(timer);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.synced.add(entry.id);
      this.setStatus('ok', 'Saved to the shared workbook');
      return true;

    } catch (err) {
      clearTimeout(timer);
      this.setStatus('fail', 'Could not reach the flow — kept locally, will resend');
      return false;
    }
  },

  /* Retry anything that never made it */
  async pushPending() {
    if (!CARBON_CONFIG.writeEndpoint) return;
    const pending = this.entries.filter(e => !this.synced.has(e.id));
    for (const e of pending) await this.push(e);
  },

  /* ----------------------------------------------------------
     PULL ← Power Automate (GET flow returning the Excel table)
     Used to draw the figures from the shared workbook.
     ---------------------------------------------------------- */
  async pull() {
    const url = CARBON_CONFIG.readEndpoint;
    if (!url) return null;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CARBON_CONFIG.timeoutMs);

    try {
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      // Accept either a bare array or { value: [...] } (Excel connector shape)
      const rows = Array.isArray(data) ? data : (data.value || data.rows || []);
      return rows.map(normaliseRow).filter(Boolean);

    } catch (err) {
      clearTimeout(timer);
      return null;
    }
  },

  /* ----------------------------------------------------------
     Status pill
     ---------------------------------------------------------- */
  setStatus(state, msg) {
    const el = document.getElementById('sync-status');
    if (!el) return;
    el.className = `sync-pill ${state}`;
    const dot = { local: '○', syncing: '◐', ok: '●', fail: '▲' }[state] || '○';
    el.innerHTML = `<span class="sync-dot">${dot}</span>${msg}`;
  },

  /* ----------------------------------------------------------
     CSV export
     ---------------------------------------------------------- */
  exportCSV() {
    if (!this.entries.length) return;
    const head = ['ID','Date','Mode','Name','Landscape','Operator','Aircraft','ICAO_code',
      'From','To','Passengers','GCD_km','Detour_km','Corrected_km','Stage_nm','Interpolation',
      'Trip_fuel_kg','Route_group','PLF','P2F','kgCO2_per_pax','tCO2_leg'];

    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = this.entries.map(e => [
      e.id, e.date, e.mode || 'flight', q(e.name), q(e.landscape), q(e.operator || ''),
      q(e.aircraft || ''), e.icao || '', e.from || '', e.to || '', e.pax ?? '',
      e.dist ?? '', e.det ?? '', e.bill ?? '', e.nm ?? '', e.interp || '',
      e.fuel ?? '', e.grp ?? '', e.plf ?? '', e.p2f ?? '',
      e.perPax ?? '', e.tco2 ?? '',
    ].join(','));

    const blob = new Blob([[head.join(',')].concat(rows).join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `wild_impact_carbon_log_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

/* ------------------------------------------------------------
   Normalise a row coming back from Excel. Column names in the
   workbook may differ in case or spacing, so match loosely.
   ------------------------------------------------------------ */
function normaliseRow(r) {
  const get = (...keys) => {
    for (const k of keys) {
      const hit = Object.keys(r).find(key =>
        key.toLowerCase().replace(/[\s_]/g, '') === k.toLowerCase().replace(/[\s_]/g, ''));
      if (hit && r[hit] !== '' && r[hit] != null) return r[hit];
    }
    return null;
  };

  const date = get('Date', 'date');
  const tco2 = parseFloat(get('tCO2_leg', 'tCO2', 'tco2')) || 0;
  if (!date) return null;

  return {
    id:        get('ID', 'id') || `x-${Math.random().toString(36).slice(2,8)}`,
    date,
    mode:      get('Mode', 'mode') || 'flight',
    name:      get('Name', 'name') || '',
    landscape: get('Landscape', 'landscape') || 'Other',
    from:      get('From', 'from') || '',
    to:        get('To', 'to') || '',
    aircraft:  get('Aircraft', 'aircraft') || '',
    pax:       parseInt(get('Passengers', 'pax')) || 1,
    dist:      parseFloat(get('GCD_km', 'dist')) || 0,
    fuel:      parseFloat(get('Trip_fuel_kg', 'fuel')) || 0,
    tco2,
    remote:    true,
  };
}
