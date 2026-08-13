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
     PULL ← Power Automate (GET flow)
     The flow returns ONLY anonymised fields, one object per leg:
        { d: "2026-04-29", l: "Greater Kruger", t: 0.09762 }
     No name, no route, no operator ever reaches this page.
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
      const rows = Array.isArray(data) ? data : (data.value || data.rows || []);

      return rows.map(r => {
        // Accept the short keys, and the full column names as a fallback
        const date = r.d || r.Date || r.date;
        const tco2 = parseFloat(r.t ?? r.tCO2_leg ?? r.tco2);
        if (!date || isNaN(tco2)) return null;
        return {
          id:        `agg-${date}-${Math.random().toString(36).slice(2, 8)}`,
          date:      String(date).slice(0, 10),
          landscape: r.l || r.Landscape || 'Other',
          tco2,
          remote:    true,
        };
      }).filter(Boolean);

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

};
