/* ============================================================
   Les Hyperion — Navigation
   Mobile drawer, active link highlighting, scroll behavior
   ============================================================ */

(function () {
  function initNav() {
    const hamburger = document.getElementById('nav-hamburger');
    const drawer    = document.getElementById('nav-drawer');

    // Mobile drawer toggle
    if (hamburger && drawer) {
      hamburger.addEventListener('click', () => {
        const isOpen = drawer.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen);
      });

      // Close drawer when a link is clicked
      drawer.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
        });
      });

      // Close drawer on outside click
      document.addEventListener('click', e => {
        if (drawer.classList.contains('open') &&
            !drawer.contains(e.target) &&
            !hamburger.contains(e.target)) {
          drawer.classList.remove('open');
          hamburger.classList.remove('open');
        }
      });
    }

    // Mark active nav link based on current page
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const hrefFile = href.split('/').pop();
      if (hrefFile === path || (path === '' && hrefFile === 'index.html')) {
        a.classList.add('active');
      }
    });

    // Fade-up intersection observer for animated entries
    const fadeEls = document.querySelectorAll('.fade-up');
    if (fadeEls.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger by element index
            const delay = (Array.from(fadeEls).indexOf(entry.target) % 8) * 60;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      fadeEls.forEach(el => obs.observe(el));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
