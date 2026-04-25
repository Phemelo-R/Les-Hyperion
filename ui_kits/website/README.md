# Les Hyperion — Website UI Kit

A React/JSX recreation of the Les Hyperion portfolio site. Mostly cosmetic — visuals are pixel-faithful to the live `index.html` / `research.html`, but logic is simplified (no real notebook fetching, no Prism.js syntax highlighting in the modal, no theme persistence).

## Click-thru

Open `index.html`. You'll land on the home page. From there you can:
1. Click **Browse Notebooks** to filter by category and click a notebook card.
2. Click any notebook card (or the **Open notebook →** link) to open the VSCode-style modal viewer with hardcoded sample R/sf/terra content.
3. Click **Research** to see the publication-card layout with the signature 5px accent left bar.
4. Click **About Me** for the bio + CTA strip.
5. Click **Contact** for the centered contact panel.
6. Close the modal with the ✕ button or by clicking the overlay.

## Components

- `Nav.jsx` — fixed frosted top bar with logo, links, theme toggle.
- `Hero.jsx` — split hero with the rotating-rings + gridded-globe ornament.
- `Marquee.jsx` — auto-scrolling tag strip.
- `ExpertiseGrid.jsx` — 3×2 grid with emoji icons + tag chips.
- `NotebookCard.jsx` — code-snippet-preview card and the filter-pill grid.
- `NotebookModal.jsx` — modal viewer with macOS-style traffic lights + R code blocks + green output panel.
- `ResearchCard.jsx` — left-bar accent publication card.
- `Footer.jsx` — minimal mono-text footer.
- `styles.css` — all CSS, lifted near-verbatim from the live site.

## What's intentionally simplified

- Theme toggle is a static button (no real swap). The live site uses `data-theme="dark|light"` and `localStorage`.
- Modal content is hardcoded sample R code, not parsed from real `.ipynb` files.
- No mobile drawer (the live site has a hamburger). The grid still collapses correctly under 900px.
- No Prism.js syntax highlighting — the modal shows plain monospace.
- No deep-linking via `#nb=...` hash.
