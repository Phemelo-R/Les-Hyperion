// main.mjs - controls theme (sun/moon) and loads the site content manifest with filtering.

const ICON_LIGHT = '☀️';
const ICON_DARK = '🌙';

function setThemeIcon() {
  const iconEl = document.getElementById('theme-icon');
  if (!iconEl) return;
  const isLight = document.documentElement.classList.contains('theme-light');
  iconEl.textContent = isLight ? ICON_LIGHT : ICON_DARK;
}

function toggleTheme() {
  const isLight = document.documentElement.classList.toggle('theme-light');
  try {
    localStorage.setItem('lh-theme', isLight ? 'light' : 'dark');
  } catch (e) {}
  setThemeIcon();
}

document.addEventListener('DOMContentLoaded', () => {
  // Attach theme toggle
  document.querySelectorAll('#theme-toggle').forEach(btn => btn.addEventListener('click', toggleTheme));
  setThemeIcon();

  // If on index: load content manifest and wire filters
  const workList = document.getElementById('work-list');
  if (!workList) return;

  let content = [];
  const manifestPath = 'assets/content-manifest.json';

  async function loadContent() {
    try {
      const r = await fetch(manifestPath, {cache: 'no-cache'});
      if (!r.ok) throw new Error('Manifest not found');
      const j = await r.json();
      content = j.items || [];
      renderList(content);
    } catch (err) {
      console.warn(err);
      workList.innerHTML = '<p class="muted">Could not load content manifest. If you recently added files, ensure <code>assets/content-manifest.json</code> is present.</p>';
    }
  }

  function renderList(items) {
    if (!items || !items.length) {
      workList.innerHTML = '<p class="muted">No items to show.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    items.forEach(it => {
      const a = document.createElement('a');
      a.className = 'work-item';
      a.href = it.path;
      a.title = it.description || it.title;

      const left = document.createElement('div');
      left.className = 'item-left';

      // optional small thumbnail
      if (it.thumbnail) {
        const img = document.createElement('img');
        img.src = it.thumbnail;
        img.alt = it.title;
        img.style.height = '48px';
        img.style.width = 'auto';
        img.style.borderRadius = '6px';
        left.appendChild(img);
      }

      const text = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'item-title';
      title.textContent = it.title;
      text.appendChild(title);
      if (it.description) {
        const desc = document.createElement('div');
        desc.className = 'item-desc';
        desc.textContent = it.description;
        text.appendChild(desc);
      }
      left.appendChild(text);

      const meta = document.createElement('div');
      meta.className = 'item-meta';
      const tags = document.createElement('div');
      tags.className = 'item-tags';
      if (it.language) {
        const t = document.createElement('span');
        t.className = 'tag';
        t.textContent = it.language;
        tags.appendChild(t);
      }
      (it.topics || []).forEach(top => {
        const tt = document.createElement('span');
        tt.className = 'tag';
        tt.textContent = top;
        tags.appendChild(tt);
      });
      meta.appendChild(tags);

      a.appendChild(left);
      a.appendChild(meta);
      frag.appendChild(a);
    });

    workList.innerHTML = '';
    workList.appendChild(frag);
  }

  // Filtering
  function applyFilters() {
    const activeLang = document.querySelector('#lang-filters .pill.active')?.dataset.lang || 'all';
    const activeTopic = document.querySelector('#topic-filters .pill.active')?.dataset.topic || 'all';
    const q = (document.getElementById('site-search')?.value || '').trim().toLowerCase();

    const filtered = content.filter(it => {
      if (activeLang !== 'all' && it.language !== activeLang) return false;
      if (activeTopic !== 'all' && !(it.topics || []).includes(activeTopic)) return false;
      if (q) {
        const hay = ((it.title || '') + ' ' + (it.description || '')).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    renderList(filtered);
  }

  function wirePills(selector) {
    const container = document.querySelector(selector);
    if (!container) return;
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;
      container.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  }

  wirePills('#lang-filters');
  wirePills('#topic-filters');
  document.getElementById('site-search')?.addEventListener('input', () => applyFilters());

  loadContent();
});
