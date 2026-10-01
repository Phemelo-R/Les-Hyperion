'use strict';
(() => {
  const canvas = document.getElementById('globe');
  if (!canvas || !window.d3 || !window.topojson || !window.LH_WORLD) return;
  const locations = window.LH_LANDSCAPES || [];
  let selectedLocation = 0;
  const context = canvas.getContext('2d'),
    world = window.LH_WORLD,
    land = topojson.feature(world, world.objects.land),
    borders = topojson.mesh(
      world,
      world.objects.countries,
      (first, second) => first !== second,
    ),
    graticule = d3.geoGraticule10(),
    projection = d3.geoOrthographic().clipAngle(90),
    path = d3.geoPath(projection, context),
    reduced = matchMedia('(prefers-reduced-motion:reduce)'),
    motion = document.getElementById('globe-motion');
  let width = 500,
    ratio = 1,
    longitude = -30,
    latitude = 16,
    rotation = !reduced.matches,
    visible = true,
    dragging = false,
    dragX = 0,
    lastFrame = 0,
    frame = 0;
  const label = () => {
    motion.textContent = rotation ? 'Pause' : 'Rotate';
    motion.setAttribute('aria-pressed', String(!rotation));
  };
  const draw = (time) => {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, width);
    const radius = width * 0.405,
      centre = width / 2,
      dark = document.documentElement.dataset.theme === 'dark';
    projection.scale(radius).translate([centre, centre]).rotate([longitude, latitude]);
    context.save();
    context.translate(centre, centre);
    context.rotate(-0.48);
    context.strokeStyle = dark ? '#55716a' : '#c7cfc1';
    context.lineWidth = 0.7;
    context.beginPath();
    context.ellipse(0, 0, radius * 1.16, radius * 0.73, 0, 0, Math.PI * 2);
    context.stroke();
    context.setLineDash([1, 7]);
    context.beginPath();
    context.arc(0, 0, radius * 1.105, 0, Math.PI * 2);
    context.stroke();
    context.restore();
    context.beginPath();
    path({ type: 'Sphere' });
    context.fillStyle = '#103744';
    context.fill();
    context.beginPath();
    path(graticule);
    context.strokeStyle = '#49606a';
    context.lineWidth = 0.45;
    context.stroke();
    context.beginPath();
    path(land);
    context.fillStyle = dark ? '#7d9988' : '#a4b8a0';
    context.fill();
    context.strokeStyle = '#b9c8b780';
    context.lineWidth = 0.6;
    context.stroke();
    context.beginPath();
    path(borders);
    context.strokeStyle = '#567469';
    context.lineWidth = 0.5;
    context.stroke();
    const shading = context.createRadialGradient(
      centre - radius * 0.4,
      centre - radius * 0.4,
      radius * 0.12,
      centre,
      centre,
      radius,
    );
    shading.addColorStop(0, '#ffffff00');
    shading.addColorStop(0.66, '#08253109');
    shading.addColorStop(1, '#0418216b');
    context.beginPath();
    path({ type: 'Sphere' });
    context.fillStyle = shading;
    context.fill();
    locations.forEach((place, index) => {
      const city = {
        ...place,
        pulse: index === selectedLocation,
        color: index === selectedLocation ? '#e8bc74' : '#f3efe1',
      };
      if (d3.geoDistance(city.coordinates, [-longitude, -latitude]) > Math.PI / 2)
        return;
      const [x, y] = projection(city.coordinates);
      if (city.pulse) {
        const progress = reduced.matches ? 0.4 : (time % 2300) / 2300;
        context.globalAlpha = reduced.matches ? 0.65 : 1 - progress;
        context.beginPath();
        context.arc(x, y, 5 + progress * 16, 0, Math.PI * 2);
        context.strokeStyle = city.color;
        context.lineWidth = 1.3;
        context.stroke();
        context.globalAlpha = 1;
      }
      context.beginPath();
      context.arc(x, y, city.pulse ? 4 : 3, 0, Math.PI * 2);
      context.fillStyle = city.color;
      context.fill();
      context.strokeStyle = '#0f2d3a';
      context.lineWidth = 1.2;
      context.stroke();
    });
    [0, 2.1, 4.2].forEach((offset, index) => {
      const angle = (reduced.matches ? 0 : time * 0.000035) + offset,
        orbit = radius * 1.105;
      context.save();
      context.translate(
        centre + Math.cos(angle) * orbit,
        centre + Math.sin(angle) * orbit,
      );
      context.rotate(angle);
      context.fillStyle = index === 0 ? '#c79e59' : dark ? '#a1b7a7' : '#6c897c';
      context.fillRect(-3, -3, 6, 6);
      context.fillRect(-9, -1.5, 4, 3);
      context.fillRect(5, -1.5, 4, 3);
      context.restore();
    });
  };
  const tick = (time) => {
    if (!visible || document.hidden) {
      frame = 0;
      return;
    }
    if (time - lastFrame >= 32) {
      if (rotation && !dragging && !reduced.matches)
        longitude += Math.min(time - lastFrame, 80) * 0.0018;
      lastFrame = time;
      draw(time);
    }
    frame = requestAnimationFrame(tick);
  };
  const resume = () => {
    if (!frame && visible && !document.hidden) {
      lastFrame = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const resize = () => {
    width = canvas.parentElement.clientWidth;
    ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(width * ratio);
    draw(performance.now());
  };
  new ResizeObserver(resize).observe(canvas.parentElement);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      if (!visible && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else resume();
    },
    { threshold: 0.05 },
  ).observe(canvas);
  document.addEventListener('visibilitychange', resume);
  document.addEventListener('themechange', () => draw(performance.now()));
  motion.addEventListener('click', () => {
    rotation = !rotation;
    label();
  });
  document.getElementById('globe-reset').addEventListener('click', () => {
    longitude = -30;
    latitude = 16;
    draw(performance.now());
  });
  document.querySelectorAll('[data-landscape]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedLocation = Number(button.dataset.landscape);
      const place = locations[selectedLocation];
      longitude = -place.coordinates[0];
      latitude = -place.coordinates[1];
      rotation = false;
      label();
      document.getElementById('globe-place').textContent = place.name;
      document.getElementById('globe-country').textContent = place.country;
      document.querySelectorAll('[data-landscape]').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === button));
      });
      draw(performance.now());
    });
  });
  canvas.addEventListener('pointerdown', (event) => {
    dragging = true;
    dragX = event.clientX;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (dragging) {
      longitude += (event.clientX - dragX) * 0.35;
      dragX = event.clientX;
      draw(performance.now());
    }
  });
  canvas.addEventListener('pointerup', () => {
    dragging = false;
  });
  canvas.addEventListener('pointercancel', () => {
    dragging = false;
  });
  canvas.addEventListener('keydown', (event) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      rotation = false;
      label();
      longitude += event.key === 'ArrowRight' ? 8 : event.key === 'ArrowLeft' ? -8 : 0;
      latitude = Math.max(
        -80,
        Math.min(
          80,
          latitude + (event.key === 'ArrowUp' ? 5 : event.key === 'ArrowDown' ? -5 : 0),
        ),
      );
      draw(performance.now());
    }
  });
  reduced.addEventListener('change', () => {
    rotation = !reduced.matches;
    label();
    draw(performance.now());
  });
  label();
  resize();
  resume();
})();
