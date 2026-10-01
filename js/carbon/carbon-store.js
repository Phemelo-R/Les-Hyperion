'use strict';

window.CarbonStore = {
  key: 'lh-carbon-workspace-v2',
  entries: [],
  deleted: {},
  writable: true,
  available: true,
  restore() {
    let raw, legacyRaw;
    try {
      raw = localStorage.getItem(this.key);
      legacyRaw = localStorage.getItem('lh-carbon-log');
    } catch (error) {
      this.available = false;
      return;
    }
    try {
      if (raw) {
        const backup = this.validate(JSON.parse(raw));
        this.entries = backup.entries;
        this.deleted = backup.deleted || {};
      } else {
        const legacy = JSON.parse(legacyRaw || '[]');
        if (!Array.isArray(legacy)) throw Error('Invalid earlier log');
        this.entries = legacy
          .filter((entry) => !entry.remote)
          .map((entry) => ({
            ...entry,
            mode: entry.mode || 'flight',
            emissionsKg: Number(entry.tco2) * 1000,
            methodVersion: 'Legacy supplied tracker',
            updatedAt: entry.updatedAt || '2026-01-01T00:00:00Z',
          }));
        if (this.entries.length) {
          this.validate(this.snapshot());
          this.persist();
        }
      }
    } catch (error) {
      this.recoveryRaw = raw || legacyRaw || '';
      this.entries = [];
      this.writable = false;
      this.available = false;
      this.error =
        'Saved data could not be read and has not been overwritten. Download backup to recover the original data before clearing storage.';
    }
  },
  snapshot() {
    return {
      schema: 'les-hyperion-carbon',
      version: 2,
      exportedAt: new Date().toISOString(),
      entries: this.entries,
      deleted: this.deleted,
    };
  },
  persist() {
    if (!this.writable) return false;
    try {
      localStorage.setItem(this.key, JSON.stringify(this.snapshot()));
      this.available = true;
      return true;
    } catch (error) {
      this.available = false;
      return false;
    }
  },
  save(record) {
    if (!this.writable) throw Error(this.error);
    const now = new Date().toISOString();
    const saved = {
      ...record,
      id:
        record.id ||
        (globalThis.crypto?.randomUUID?.() ??
          Date.now() + '-' + Math.random().toString(36).slice(2)),
      createdAt: record.createdAt || now,
      updatedAt: now,
    };
    this.entries = this.entries.filter((entry) => entry.id !== saved.id);
    this.entries.unshift(saved);
    delete this.deleted[saved.id];
    this.persist();
    return saved;
  },
  remove(id) {
    if (!this.writable) throw Error(this.error);
    const record = this.entries.find((entry) => entry.id === id);
    this.entries = this.entries.filter((entry) => entry.id !== id);
    this.deleted[id] = new Date().toISOString();
    this.persist();
    return record;
  },
  validate(backup) {
    if (
      !backup ||
      backup.schema !== 'les-hyperion-carbon' ||
      backup.version !== 2 ||
      !Array.isArray(backup.entries) ||
      backup.entries.length > 100000
    )
      throw Error('Choose a version 2 backup from this tracker.');
    const ids = new Set();
    for (const entry of backup.entries) {
      if (
        !entry ||
        typeof entry.id !== 'string' ||
        ids.has(entry.id) ||
        !['flight', 'ebike'].includes(entry.mode) ||
        !CarbonMath.validDate(entry.date) ||
        !Number.isFinite(entry.emissionsKg) ||
        entry.emissionsKg < 0 ||
        !Number.isFinite(entry.dist) ||
        entry.dist < 0 ||
        !Number.isFinite(Date.parse(entry.updatedAt)) ||
        typeof entry.name !== 'string' ||
        typeof entry.landscape !== 'string'
      )
        throw Error('Invalid or duplicate record; nothing imported.');
      if (
        entry.mode === 'flight' &&
        (!Number.isInteger(entry.pax) ||
          entry.pax < 1 ||
          !Number.isFinite(entry.perPax) ||
          !['from', 'to', 'aircraft', 'operator'].every(
            (key) => typeof entry[key] === 'string',
          ))
      )
        throw Error('Invalid flight details.');
      if (
        entry.mode === 'ebike' &&
        (![
          entry.baselineKg,
          entry.savedKg,
          entry.energy,
          entry.intensity,
          entry.gridShare,
          entry.gridFactor,
          entry.baselineFactor,
          entry.substitution,
        ].every(Number.isFinite) ||
          !CarbonMath.validDate(entry.start) ||
          !CarbonMath.validDate(entry.end) ||
          entry.start > entry.end ||
          entry.start.slice(0, 7) !== entry.end.slice(0, 7) ||
          typeof entry.registration !== 'string')
      )
        throw Error('Invalid motorcycle details.');
      ids.add(entry.id);
    }
    if (
      backup.deleted &&
      (typeof backup.deleted !== 'object' ||
        Array.isArray(backup.deleted) ||
        Object.values(backup.deleted).some(
          (date) => typeof date !== 'string' || !Number.isFinite(Date.parse(date)),
        ))
    )
      throw Error('Invalid deletion history.');
    return backup;
  },
  merge(backup, persist = true) {
    if (!this.writable) throw Error(this.error);
    this.validate(backup);
    const merged = new Map(this.entries.map((entry) => [entry.id, entry]));
    let changed = 0;
    for (const entry of backup.entries) {
      const current = merged.get(entry.id);
      if (!current || Date.parse(entry.updatedAt) > Date.parse(current.updatedAt)) {
        merged.set(entry.id, entry);
        changed++;
      }
    }
    for (const [id, date] of Object.entries(backup.deleted || {}))
      if (!this.deleted[id] || Date.parse(date) > Date.parse(this.deleted[id]))
        this.deleted[id] = date;
    this.entries = [...merged.values()].filter(
      (entry) =>
        !this.deleted[entry.id] ||
        Date.parse(this.deleted[entry.id]) < Date.parse(entry.updatedAt),
    );
    if (persist) this.persist();
    return changed;
  },
};
