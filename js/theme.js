/* ============================================================
   Les Hyperion — Theme Manager
   Handles dark / light toggle and persists choice in localStorage
   ============================================================ */

(function () {
  const STORAGE_KEY = 'lh-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // Apply theme before first paint (prevents flash)
  const stored = localStorage.getItem(STORAGE_KEY);
  const preferred = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT);
  document.documentElement.setAttribute('data-theme', preferred);

  window.LHTheme = {
    get current() {
      return document.documentElement.getAttribute('data-theme') || LIGHT;
    },

    set(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
      this._updateButtons(theme);
    },

    toggle() {
      this.set(this.current === DARK ? LIGHT : DARK);
    },

    _updateButtons(theme) {
      document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        const icon = btn.querySelector('.theme-icon');
        const label = btn.querySelector('.theme-label');
        if (icon)  icon.textContent  = theme === DARK ? '☀️' : '🌙';
        if (label) label.textContent = theme === DARK ? 'Light' : 'Dark';
      });
    },

    init() {
      this._updateButtons(this.current);
      // Wire all toggle buttons
      document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
        btn.addEventListener('click', () => this.toggle());
      });
    }
  };

  // Auto-init once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.LHTheme.init());
  } else {
    window.LHTheme.init();
  }
})();
