'use strict';
const showNotice = (message) => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(showNotice.timer);
  toast.textContent = message;
  toast.hidden = false;
  showNotice.timer = setTimeout(() => {
    toast.hidden = true;
  }, 3000);
};
document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
  const label = () =>
    button.setAttribute(
      'aria-label',
      `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} theme`,
    );
  label();
  button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('lh-theme', theme);
    } catch {}
    label();
    document.dispatchEvent(new CustomEvent('themechange'));
  });
});
const menuButton = document.querySelector('.menu-toggle'),
  mobileNav = document.getElementById('mobile-nav');
const closeMenu = () => {
  mobileNav.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
};
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  mobileNav.hidden = expanded;
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute(
    'aria-label',
    expanded ? 'Open navigation' : 'Close navigation',
  );
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener('click', (event) => {
  if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width:851px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});
document
  .querySelectorAll('.print-button')
  .forEach((button) => button.addEventListener('click', () => window.print()));
const notebookSearch = document.getElementById('notebook-search');
if (notebookSearch) {
  const allCountLabel = document.getElementById('archive-count').textContent;
  let category = 'all';
  const filter = () => {
    const query = notebookSearch.value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll('[data-notebook]').forEach((row) => {
      row.hidden = !(
        (category === 'all' || row.dataset.category === category) &&
        row.dataset.search.includes(query)
      );
      if (!row.hidden) count++;
    });
    document.querySelectorAll('[data-group]').forEach((group) => {
      group.hidden = !group.querySelector('[data-notebook]:not([hidden])');
    });
    document.getElementById('archive-count').textContent =
      category === 'all' && !query
        ? allCountLabel
        : `${count} notebook${count === 1 ? '' : 's'} listed`;
    document.getElementById('no-results').hidden = count !== 0;
  };
  notebookSearch.addEventListener('input', filter);
  document.querySelectorAll('[data-filter]').forEach((button) =>
    button.addEventListener('click', () => {
      category = button.dataset.filter;
      document
        .querySelectorAll('[data-filter]')
        .forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      filter();
    }),
  );
  const requested = new URLSearchParams(location.search).get('open');
  if (requested) {
    const matching = Array.from(document.querySelectorAll('.notebook-title a')).find(
      (link) => link.getAttribute('href') === `notebooks/read/${requested}.html`,
    );
    if (matching) location.replace(matching.href);
  }
}
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  let activePhotos = [],
    activeIndex = 0,
    activeTrigger = null;
  const image = document.getElementById('lightbox-image');
  const update = () => {
    const photo = activePhotos[activeIndex];
    image.src = photo.querySelector('img').src;
    image.alt = photo.querySelector('img').alt;
    document.getElementById('lightbox-caption').textContent =
      photo.querySelector('figcaption').textContent;
    document.getElementById('lightbox-count').textContent =
      `${activeIndex + 1} / ${activePhotos.length}`;
    document.getElementById('lightbox-prev').disabled = activePhotos.length < 2;
    document.getElementById('lightbox-next').disabled = activePhotos.length < 2;
  };
  const advance = (step) => {
    activeIndex = (activeIndex + step + activePhotos.length) % activePhotos.length;
    update();
  };
  document.querySelectorAll('[data-gallery]').forEach((section) => {
    const rail = section.querySelector('.gallery-rail'),
      photos = Array.from(section.querySelectorAll('.gallery-item')),
      previous = section.querySelector('.gallery-prev'),
      next = section.querySelector('.gallery-next');
    const viewablePhotos = photos.filter((photo) =>
      photo.querySelector('.gallery-open img'),
    );
    const unit = section.dataset.galleryUnit || 'photographs';
    previous.setAttribute('aria-controls', rail.id);
    next.setAttribute('aria-controls', rail.id);
    const updateRail = () => {
      const step =
        photos[0].getBoundingClientRect().width +
        parseFloat(getComputedStyle(rail).gap);
      previous.disabled = rail.scrollLeft < 3;
      next.disabled = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 3;
      const first = Math.min(photos.length, Math.round(rail.scrollLeft / step) + 1),
        last = Math.min(
          photos.length,
          Math.ceil((rail.scrollLeft + rail.clientWidth - 4) / step),
        );
      section.querySelector('.gallery-position').textContent =
        first === last
          ? `${first} / ${photos.length} ${unit}`
          : `${first}–${last} / ${photos.length} ${unit}`;
    };
    const scroll = (direction) =>
      rail.scrollBy({
        left:
          (photos[0].getBoundingClientRect().width +
            parseFloat(getComputedStyle(rail).gap)) *
          direction,
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches
          ? 'instant'
          : 'smooth',
      });
    previous.addEventListener('click', () => scroll(-1));
    next.addEventListener('click', () => scroll(1));
    rail.addEventListener('scroll', updateRail, { passive: true });
    rail.addEventListener('keydown', (event) => {
      if (event.target === rail && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        scroll(event.key === 'ArrowLeft' ? -1 : 1);
      }
    });
    new ResizeObserver(updateRail).observe(rail);
    updateRail();
    viewablePhotos.forEach((photo, index) =>
      photo.querySelector('button').addEventListener('click', (event) => {
        activePhotos = viewablePhotos;
        activeIndex = index;
        activeTrigger = event.currentTarget;
        document.getElementById('lightbox-title').textContent =
          section.querySelector('h3').textContent;
        update();
        lightbox.showModal();
        document.getElementById('lightbox-close').focus();
      }),
    );
  });
  document.getElementById('lightbox-prev').addEventListener('click', () => advance(-1));
  document.getElementById('lightbox-next').addEventListener('click', () => advance(1));
  document
    .getElementById('lightbox-close')
    .addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('close', () => activeTrigger?.focus());
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      const bounds = lightbox.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        lightbox.close();
    }
  });
  lightbox.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      advance(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let touchStart = 0;
  image.addEventListener(
    'touchstart',
    (event) => {
      touchStart = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  image.addEventListener(
    'touchend',
    (event) => {
      const delta = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(delta) > 50) advance(delta < 0 ? 1 : -1);
    },
    { passive: true },
  );
}
