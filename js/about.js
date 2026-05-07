/* ============================================================
   Les Hyperion — About Page
   Lightbox for field work image galleries
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();

  // Fade-up observer
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
});

function initLightbox() {
  const overlay   = document.getElementById('lightbox-overlay');
  const img       = document.getElementById('lightbox-img');
  const caption   = document.getElementById('lightbox-caption');
  const closeBtn  = document.getElementById('lightbox-close');

  if (!overlay) return;

  // Open on any .fw-img-wrap click
  document.querySelectorAll('.fw-img-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const src  = wrap.querySelector('img')?.src || '';
      const cap  = wrap.querySelector('.fw-img-caption')?.textContent?.trim() || '';
      img.src           = src;
      caption.textContent = cap;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
  }

  closeBtn?.addEventListener('click', close);
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target === img) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}
