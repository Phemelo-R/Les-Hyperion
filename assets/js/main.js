// Main script for Les Hyperion
//
// Initialises the interactive Leaflet map focusing on southern Africa
// and manages the switching of basemaps to match the site’s light
// and dark themes. A single map instance is created with two tile
// layers; whichever is not active is removed when the theme is
// toggled.

(function () {
  // Ensure Leaflet library is loaded
  if (typeof L === "undefined") return;

  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // Centre of southern Africa (approximate)
  const centre = [-28.5, 24.7];
  const zoomLevel = 5;

  // Define tile layers for light and dark themes
  const lightLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }
  );

  const darkLayer = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }
  );

  // Initialise map
  const map = L.map(mapContainer, {
    center: centre,
    zoom: zoomLevel,
    layers: [],
    zoomControl: true,
    attributionControl: true,
  });

  let currentLayer = null;

  function applyMapTheme(theme) {
    const desiredLayer = theme === "dark" ? darkLayer : lightLayer;
    if (currentLayer !== desiredLayer) {
      if (currentLayer) {
        map.removeLayer(currentLayer);
      }
      desiredLayer.addTo(map);
      currentLayer = desiredLayer;
    }
  }

  // Determine initial theme
  const root = document.documentElement;
  const initialTheme = root.getAttribute("data-theme") || "light";
  applyMapTheme(initialTheme);

  // Observe changes to the data-theme attribute
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
      ) {
        const newTheme = root.getAttribute("data-theme");
        applyMapTheme(newTheme);
      }
    }
  });
  observer.observe(root, { attributes: true });
})();