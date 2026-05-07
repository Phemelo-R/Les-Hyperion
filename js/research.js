/* ============================================================
   Les Hyperion — Research Page
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  renderResearch();
});

function renderResearch() {
  const list = document.getElementById('research-list');
  if (!list || typeof RESEARCH === 'undefined') return;

  RESEARCH.forEach(r => {
    const card = document.createElement('div');
    card.className = 'rc fade-up';
    card.style.setProperty('--rc-color', r.color || 'var(--accent)');

    const statusLabel = r.status === 'published'   ? 'Published'
                      : r.status === 'in-progress' ? 'In Progress'
                      : 'Complete';
    const statusClass = r.status === 'in-progress' ? 'in-progress' : 'published';

    const nbLinks = (r.notebooks || []).map(file => {
      const nb = (typeof NOTEBOOKS !== 'undefined' ? NOTEBOOKS : []).find(n => n.file === file);
      return nb ? `<a class="rc-nb-btn" href="notebooks.html#${file}">📓 ${nb.title}</a>` : '';
    }).filter(Boolean).join('');

    card.innerHTML = `
      <div class="rc-top">
        <div class="rc-badges">
          <span class="rc-badge ${statusClass}">
            <span class="rc-dot"></span>${statusLabel}
          </span>
        </div>
        <span class="rc-year">${r.year}</span>
      </div>
      <div class="rc-title">${r.title}</div>
      <div class="rc-venue">${r.venue}</div>
      <div class="rc-authors">${r.authors}</div>
      <div class="rc-desc">${r.desc}</div>
      <div class="rc-tags">${(r.tags || []).map(t => `<span class="rc-tag">${t}</span>`).join('')}</div>
      <div class="rc-footer">
        <button class="rc-read-btn" data-id="${r.id}">
          ${r.page ? 'View Protocol →' : 'Read Paper →'}
        </button>
        <div style="display:flex;flex-wrap:wrap;gap:.6rem;">${nbLinks}</div>
      </div>`;

    card.addEventListener('click', e => {
      if (e.target.closest('.rc-nb-btn')) return;
      if (r.page) { window.location.href = r.page; return; }
      openResearchViewer(r.id);
    });

    list.appendChild(card);
  });

  // Fade-up observer
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  list.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

/* ============================================================
   Full-page viewer
   ============================================================ */
function openResearchViewer(id) {
  const r = RESEARCH.find(x => x.id === id);
  if (!r) return;

  const viewer   = document.getElementById('research-viewer');
  const listSec  = document.getElementById('research-list-section');
  const titleEl  = document.getElementById('research-vwr-title');
  const body     = document.getElementById('research-vwr-body');

  titleEl.textContent = r.title;

  // Build document content
  const nbLinks = (r.notebooks || []).map(file => {
    const nb = (typeof NOTEBOOKS !== 'undefined' ? NOTEBOOKS : []).find(n => n.file === file);
    return nb
      ? `<a class="rc-nb-btn" href="notebooks.html#${file}" style="display:inline-flex;align-items:center;gap:6px;">📓 ${nb.title}</a>`
      : '';
  }).filter(Boolean).join('');

  body.innerHTML = `
    <div class="nb-doc">
      <div class="nb-doc-series">${r.tags?.join(' · ') || ''}</div>
      <div class="nb-doc-title">${r.title}</div>
      <div class="nb-doc-meta">
        <span>✍ <strong>Authors:</strong> ${r.authors}</span>
        <span>📅 <strong>Year:</strong> ${r.year}</span>
        <span>🎓 <strong>Venue:</strong> ${r.venue}</span>
      </div>
      <div class="nb-md-cell research-content">
        ${r.content || '<p>Full text not yet available.</p>'}
      </div>
      ${nbLinks ? `
        <div style="margin-top:2rem;padding-top:1.2rem;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:.8rem;">
          <span style="font-family:var(--font-m);font-size:.65rem;color:var(--text-faint);text-transform:uppercase;letter-spacing:.08em;align-self:center;">Related notebooks</span>
          ${nbLinks}
        </div>` : ''}
    </div>`;

  // Show viewer, hide list
  viewer.classList.add('open');
  listSec.style.display = 'none';
  document.body.style.overflow = 'hidden';

  // Scroll to top
  body.scrollTop = 0;
}