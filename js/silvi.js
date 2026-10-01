'use strict';

// Topic-specific illustrations. Scene lighting follows the site theme.
// Motion stops automatically offscreen and respects reduced-motion preferences.
(() => {
  const assets = new URL('../assets/brand/', document.currentScript.src);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...document.querySelectorAll('[data-silvi-scene]')];
  const topics = {
    motorcycle: [
      'silvi-motorcycle-v3.png',
      'cutout',
      'Silvi rides an electric motorcycle beside an illustrative carbon-reduction symbol.',
      'motorcycle-ride',
    ],
    bazaruto: [
      'silvi-bazaruto-v3.png',
      'marine',
      'Silvi photographs a manta ray underwater around Bazaruto.',
      'reef-drift',
    ],
    mnemba: [
      'silvi-mnemba-v3.png',
      'marine',
      'Silvi observes a grey reef shark underwater around Mnemba.',
      'reef-hover',
    ],
    okavango: [
      'silvi-okavango-v3.png',
      'wildlife-real',
      'Illustrated Silvi monitoring African elephants beside an Okavango floodplain.',
      'habitat-drift',
    ],
    isimangaliso: [
      'silvi-isimangaliso-v3.png',
      'wildlife-real',
      'Illustrated Silvi monitoring a leopard in iSimangaliso coastal woodland.',
      'habitat-drift',
    ],
    welcome: [
      'unique-welcome.png',
      'cutout',
      'Silvi, the silvertree explorer, waves hello.',
      'welcome-sway',
    ],
    camera: [
      'unique-camera.png',
      'cutout',
      'Silvi kneels and watches wildlife through binoculars.',
      'binocular-watch',
    ],
    field: [
      'silvi-spectral-v2.png',
      'cutout',
      'Silvi compares plant hyperspectral curves, with a silvertree specimen highlighted.',
      'close-inspection',
    ],
    'research-overview': [
      'silvi-telescope-v3.png',
      'cutout',
      'Silvi looks through a modern computerised telescope.',
      'telescope-watch',
    ],
    'protocol-overview': [
      'unique-guide.png',
      'cutout',
      'Silvi carries maps and a biodiversity field guide.',
      'field-stride',
    ],
    protocol: [
      'silvi-protocol-v2.png',
      'cutout',
      'Silvi checks a coastal sample, quadrat and biodiversity record for Saldanha Bay.',
      'checklist-work',
    ],
    marine: [
      'unique-krill.png',
      'marine',
      'Silvi swims with krill while making notes on an underwater slate.',
      'diver-glide',
    ],
    ocean: [
      'unique-temperature.png',
      'marine',
      'Silvi deploys an ocean temperature sensor in diving gear.',
      'sensor-hover',
    ],
    about: [
      'silvi-about-v2.png',
      'cutout',
      'Silvi proudly introduces Phemelo.',
      'introduce-bow',
    ],
    soap: [
      'silvi-soap-v2.png',
      'cutout',
      'Silvi examines a bar of Protex soap with a magnifying glass.',
      'evidence-inspect',
    ],
    data: [
      'silvi-data-explorer.png',
      'cutout',
      'Silvi works at a laptop in the notebook archive.',
      'archive-work',
    ],
    travel: [
      'silvi-carbon-v3.png',
      'cutout',
      'Silvi records carbon emissions and savings beside an illustrative dashboard.',
      'journey-rock',
    ],
    cv: [
      'silvi-cv-v2.png',
      'cutout',
      'Silvi in a navy suit reads Phemelo’s CV with delight.',
      'portfolio-breathe',
    ],
    'notebook-Introduction_to_R': [
      'unique-r.png',
      'cutout',
      'Silvi sits cross-legged and types in R on a laptop.',
      'typing-rock',
    ],
    'notebook-Data_Manipulation': [
      'unique-tidy.png',
      'cutout',
      'Silvi sorts data tokens into specimen trays.',
      'sorting-lean',
    ],
    'notebook-Data_Visualisation': [
      'unique-charts.png',
      'cutout',
      'Silvi draws a chart at an easel.',
      'painting-reach',
    ],
    'notebook-Linear_Regression': [
      'unique-regression.png',
      'cutout',
      'Silvi uses a ruler to draw a fitted line on graph paper.',
      'ruler-trace',
    ],
    'notebook-Generalized_Linear_Models': [
      'unique-glm.png',
      'cutout',
      'Silvi adjusts counters beside a curved model graph.',
      'model-adjust',
    ],
    'notebook-Introduction_to_Machine_Learning': [
      'unique-ml.png',
      'cutout',
      'Silvi investigates a branching model at a monitor.',
      'model-think',
    ],
    'notebook-Introduction_to_Spatial_Mapping999': [
      'unique-map.png',
      'cutout',
      'Silvi unfolds a topographic map beside a survey rock.',
      'map-unfold',
    ],
    'notebook-Vector_Data_with_sf': [
      'unique-vector.png',
      'cutout',
      'Silvi checks a survey pole and triangular vector markers.',
      'survey-check',
    ],
  };

  const syncTheme = () => {
    const night = document.documentElement.dataset.theme === 'dark';
    for (const scene of scenes) {
      scene.dataset.night = String(night);
    }
  };
  const syncMotion = () => {
    for (const scene of scenes) {
      scene.dataset.paused = String(
        reducedMotion.matches ||
          document.hidden ||
          scene.dataset.visible === 'false' ||
          Boolean(scene.closest('details:not([open])')),
      );
    }
  };

  for (const scene of scenes) {
    const kind = scene.dataset.silviScene;
    const topic = topics[kind];
    if (!topic) continue;
    const [asset, habitat, description, movement] = topic;
    scene.classList.add('silvi-topic');
    scene.dataset.habitat = habitat;
    scene.style.setProperty('--character-motion', movement);
    const stage = scene.querySelector('.silvi-stage');
    const underwater = habitat === 'marine';
    const reefEncounter = kind === 'bazaruto' || kind === 'mnemba';
    const imageUrl = new URL(asset, assets);
    stage.innerHTML = `
      ${underwater ? `<div class="topic-sky marine-background" aria-hidden="true"><img src="${new URL(`habitat-${kind}.png`, assets)}" alt="" width="1536" height="1024" loading="lazy"></div><div class="topic-rays" aria-hidden="true"></div><div class="topic-bubbles" aria-hidden="true"><i></i><i></i><i></i></div>` : ''}
      <div class="topic-character ${reefEncounter ? 'reef-encounter' : ''}">
        ${reefEncounter ? `<img class="reef-observer" src="${imageUrl}" alt="${description}" width="1792" height="896" loading="lazy"><img class="reef-animal" src="${imageUrl}" alt="" aria-hidden="true" width="1792" height="896" loading="lazy">` : `<img src="${imageUrl}" alt="${description}" width="512" height="512" loading="lazy">`}
      </div>
      ${kind === 'marine' ? `<div class="topic-krill" aria-hidden="true">${Array.from({ length: 6 }, (_, index) => `<i style="--column:${index % 3};--row:${Math.floor(index / 3)};--delay:${index * -0.4}s"></i>`).join('')}</div>` : ''}
      ${habitat === 'wildlife-real' ? '<div class="habitat-light" aria-hidden="true"></div>' : ''}
    `;
    scene.closest('details')?.addEventListener('toggle', syncMotion);
  }
  syncTheme();
  syncMotion();
  document.addEventListener('themechange', syncTheme);
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) {
      syncTheme();
    }
    syncMotion();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          entry.target.dataset.visible = String(entry.isIntersecting);
        syncMotion();
      },
      { threshold: 0.03 },
    );
    scenes.forEach((scene) => observer.observe(scene));
  }
  reducedMotion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
})();
