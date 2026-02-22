# Les Hyperion — GIS, Remote Sensing & Spatial Ecology Portfolio

[![GitHub Pages](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-4a9eff?style=flat-square&logo=github)](https://phemelo-r.github.io/Les-Hyperion)
[![Made with R](https://img.shields.io/badge/Made%20with-R-276DC3?style=flat-square&logo=r)](https://www.r-project.org/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Jupyter](https://img.shields.io/badge/Jupyter-Notebooks-F37626?style=flat-square&logo=jupyter)](https://jupyter.org/)

> A personal research portfolio built with vanilla HTML, CSS and JavaScript — no frameworks, no build tools. Reads Jupyter notebooks directly from the repo and renders them in an interactive modal viewer.

## About

**Phemelo Rutlokoane** | GIS Analyst & Researcher  
University of the Western Cape · Johannesburg, South Africa  
[phemelorutlokoane001@icloud.com](mailto:phemelorutlokoane001@icloud.com) · [LinkedIn](https://www.linkedin.com/in/phemelo-rutlokoane-4a8826235) · [GitHub](https://github.com/Phemelo-R)

This repository hosts my research portfolio site and the Jupyter notebooks behind it. 

Research projects and Jupyter notebooks cover:

- Remote sensing & satellite imagery analysis
- Species distribution modelling (SDM)
- Spatial data science in R and Python
- Biostatistics and multivariate ecology
- Biodiversity informatics

---
## Site Structure

```
Les-Hyperion/
├── index.html          # Home page — hero, expertise cards, 6 featured notebooks
├── notebooks.html      # Full notebook browser with search & category filters
├── research.html       # Research projects page with project write-ups
├── about.html          # About Me page (loads content from about_content.js)
├── about_content.js    # Rendered notebook content for the About page
├── LesHyperion_logo.png
├── images/
│   └── profile.jpg     # Profile photo (replace with your own)
├── notebooks/
│   ├── index.json      # Notebook manifest — controls what appears on the site
│   ├── Introduction_to_R.ipynb
│   ├── Data_manipulation.ipynb
│   ├── Data_visualisation.ipynb
│   ├── Spatial_data.ipynb
│   ├── Mapping_projections.ipynb
│   └── Satellite_imagery_R.ipynb
└── README.md
```

---

## Adding Notebooks

### Step 1 — Add your `.ipynb` file

Place your Jupyter notebook in the `notebooks/` directory.

### Step 2 — Register it in `notebooks/index.json`

```json
[
  {
    "file":     "My_Analysis.ipynb",
    "title":    "My Analysis Title",
    "desc":     "Short description shown on the card",
    "date":     "2026-03-01",
    "category": "Remote Sensing",
    "keywords": ["Sentinel-2", "R", "NDVI"],
    "lang":     "R",
    "abstract": "Optional longer abstract shown when the notebook is opened"
  }
]
```

**Available categories:** `GIS` · `Remote Sensing` · `Biodiversity` · `Biostatistics` · `Research`

**Research notebooks:** Notebooks with `"category": "Research"` automatically appear on the Research page.

### Step 3 — Push to GitHub

The site auto-fetches and renders your notebooks from GitHub Pages. No build step needed.

---

## Figure Captions in Notebooks

The notebook renderer supports two image methods.

### Markdown attachment (Jupyter inline image)

Insert images via Jupyter's built-in attachment system (drag-and-drop or Edit → Insert Image). They are embedded in the notebook file and render automatically.

To add a caption, put an italic-only line **immediately below** the image line:

```markdown
![Sample sites](attachment:795ffe03-95dd-4208-a1c5-084b0786024a.png)
_Figure 1: Sampling sites across Table Mountain National Park._
```

The caption will appear inside the same styled box as the image.

### HTML `<img>` tags

You can also use raw HTML in a markdown cell:

```html
<img src="Logos/ggplot_logo.png" style="float:left; margin-right:15px;" width="90">
```

> **Note:** For `<img src="...">` with a local path to render on GitHub Pages, the referenced file must also be committed to the repo in the correct relative path (e.g. a `Logos/` folder in the same directory as the notebook, or relative to the site root). Jupyter attachment syntax (`attachment:uuid`) is preferred because the image is embedded directly in the `.ipynb` file and has no external dependencies.

---

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero section, expertise cards, 6 featured notebooks |
| All Notebooks | `/notebooks.html` | Full grid with search and category filters |
| Research | `/research.html` | Project write-ups + Research-category notebooks |
| About Me | `/about.html` | Profile, skills and rendered About_Me notebook |

---

## Customisation

All site-wide settings live at the top of `index.html` in the `SITE` and `NOTEBOOK_INDEX` constants:

```javascript
const SITE = {
  name:        "Les Hyperion",
  author:      "Phemelo Rutlokoane",
  role:        "GIS Analyst & Researcher",
  institution: "University of the Western Cape",
  location:    "Johannesburg, South Africa",
  email:       "your@email.com",
  github:      "https://github.com/Phemelo-R",
  linkedin:    "https://www.linkedin.com/in/...",
};
```

The `NOTEBOOK_INDEX` constant in `index.html` (and mirrored in `notebooks.html` / `research.html`) is a fallback used when the live `notebooks/index.json` fetch fails. Keep it in sync with the JSON file.

---

## Tech Stack

| Layer | What |
|-------|------|
| Markup | Vanilla HTML5 |
| Styles | Vanilla CSS (custom properties, grid, clamp) |
| Scripts | Vanilla JS (ES2020+, no bundler) |
| Fonts | [Syne](https://fonts.google.com/specimen/Syne) · [DM Mono](https://fonts.google.com/specimen/DM+Mono) · [Lora](https://fonts.google.com/specimen/Lora) via Google Fonts |
| Syntax highlighting | [Prism.js](https://prismjs.com/) (R + Python) via CDN |
| Hosting | GitHub Pages |

---

## Deployment

1. Push all files (including `notebooks/`) to the `main` branch of your GitHub repo.
2. Go to **Settings → Pages → Source** and set it to `main` / `root`.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

GitHub Pages serves the files statically. The notebook fetch uses relative URLs so everything resolves correctly from the root.

---

## License

This portfolio template is open for personal use. Research content and writing are copyright © Phemelo Rutlokoane.
