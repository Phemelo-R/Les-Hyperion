// Theme toggle script
//
// Determines the user’s preferred theme (light or dark) by checking
// localStorage and the system colour scheme, then applies the theme by
// setting the `data-theme` attribute on the `<html>` element. The
// script also wires up the toggle button to switch themes on
// click and persists the choice.

(function () {
  const root = document.documentElement;
  const toggle = document.getElementById("theme-toggle");
  const storageKey = "les-hyperion-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  function getPreferredTheme() {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "light" || saved === "dark") return saved;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  // Initialise theme on page load
  applyTheme(getPreferredTheme());

  // Toggle event
  if (toggle) {
    toggle.addEventListener("click", function () {
      const current = root.getAttribute("data-theme") || "light";
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);
      window.localStorage.setItem(storageKey, next);
    });
  }
})();