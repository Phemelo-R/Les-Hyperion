# Les Hyperion

<a href="https://phemelo-r.github.io/Les-Hyperion/" aria-label="Open the Les Hyperion website">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://phemelo-r.github.io/Les-Hyperion/assets/brand/les-hyperion-dark.svg" />
    <source media="(prefers-color-scheme: light)" srcset="https://phemelo-r.github.io/Les-Hyperion/assets/brand/les-hyperion-light.svg" />
    <img src="https://phemelo-r.github.io/Les-Hyperion/assets/brand/les-hyperion-light.svg" alt="Les Hyperion logo; click to visit the website" width="420" />
  </picture>
</a>

**Live site:** [phemelo-r.github.io/Les-Hyperion](https://phemelo-r.github.io/Les-Hyperion/)

Les Hyperion is the professional portfolio and research website of Phemelo Rutlokoane. It brings together conservation and ecology work, remote sensing, spatial analysis, scientific communication and reproducible learning materials. The site includes project and research records, fieldwork photography, written research, teaching notebooks, a curriculum vitae, a biodiversity monitoring protocol, and a local carbon-recording tool.

## Purpose and content

The portfolio documents work and interests in coastal and marine ecology, biodiversity monitoring, conservation, landscape ecology, remote sensing, GIS, biostatistics and ecological data science. It is intended to make project context and methods accessible while providing original notebooks and writing for readers who want to examine or adapt the work.

The homepage includes an interactive globe for the landscapes associated with the work, including the Fiji Islands, a featured silvertree research project, a summary of research areas, selected notebooks and an introduction to the author. Other pages provide the full research archive, notebook collection, biography and CV, monitoring protocol, and carbon tracker.

The carbon tracker runs in the browser. It records flight and electric-motorcycle activity locally, calculates project-defined emissions estimates, and supports JSON backup/import and Excel workbook export. Records are stored in browser storage and are not sent to a project server.

## Website pages

| Page                                        | What it contains                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `index.html`                                | Homepage, interactive globe, featured research, areas of practice, selected notebooks and author introduction.     |
| `about.html`                                | Biography, research interests and visual portfolio galleries.                                                      |
| `research.html`                             | Dated research and coursework archive, status labels, project summaries and links to related writing or notebooks. |
| `notebooks.html`                            | Searchable and filterable notebook catalogue.                                                                      |
| `carbon.html`                               | Browser-based flight and electric-motorcycle carbon-recording tool, charts, records, backup and workbook export.   |
| `cv.html`                                   | Screen-readable and print-oriented curriculum vitae.                                                               |
| `pages/protocol.html`                       | Generated biodiversity monitoring protocol for Saldanha Bay Municipality.                                          |
| `pages/research/krill-research.html`        | Generated written research article on diel vertical migration of _Euphausia lucens_.                               |
| `pages/research/science-pseudoscience.html` | Generated written evaluation of product claims and scientific evidence.                                            |
| `notebooks/read/*.html`                     | Generated site readers for the notebooks registered in `js/data.js`.                                               |

## Project map

Generated pages and bundles are kept beside the source files they serve. Edit the source and rebuild rather than editing generated output by hand.

### Root files

| File                                                                                    | Contents and purpose                                                                                                                               |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                                                             | This project guide, file map, setup instructions and credits.                                                                                      |
| `LICENSE`                                                                               | MIT License for the project software. Research, photographs, artwork and third-party assets remain subject to their respective rights and notices. |
| `THIRD-PARTY-NOTICES.md`                                                                | Versions, sources and licences for bundled browser libraries, geography data and fonts; also records the provenance of original project material.  |
| `package.json`                                                                          | Project scripts, Node.js version requirement and build-time dependencies.                                                                          |
| `package-lock.json`                                                                     | Locked npm dependency versions for repeatable installation.                                                                                        |
| `index.html`, `about.html`, `research.html`, `notebooks.html`, `carbon.html`, `cv.html` | Generated top-level website pages. Their templates and data are in `scripts/`, `content/`, `js/data.js` and `data/json/`.                          |

### `content/`

Source templates and source documents used by the site generator:

| File                                    | Contents and purpose                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------- |
| `content/carbon-tracker.html`           | Carbon page's source markup, including workspace forms, help text and methods sections. |
| `content/cv-screen.html`                | Screen-focused CV content and layout.                                                   |
| `content/cv.html`                       | CV details used with the screen template and print view.                                |
| `content/protocol.html`                 | Source markup for the biodiversity monitoring protocol document.                        |
| `content/research/Krill_research.ipynb` | Written research notebook for the _Euphausia lucens_ diel vertical migration article.   |
| `content/research/Pseudoscience.ipynb`  | Written coursework notebook evaluating Protex Deep Clean Bar Soap claims and evidence.  |

### `data/json/`

Structured content and reference data. These files are the editable source for site lists, project material and the carbon tracker.

| File                               | Contents and purpose                                                                                                             |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `airports.json`                    | Local airport and airfield catalogue with codes, names, countries, coordinates and source metadata.                              |
| `carbon-aircraft.json`             | Aircraft types, ICAO codes and default seat estimates for carbon calculations.                                                   |
| `carbon-configurations.json`       | Published operator/aircraft cabin layouts, seat counts, allocation weights and sources.                                          |
| `carbon-landscapes.json`           | Carbon-tool locations, countries and associated airports. Separate from the homepage globe locations.                            |
| `carbon-operators.json`            | Airline/operator catalogue and source notes.                                                                                     |
| `galleries.json`                   | Gallery titles, descriptions, dates and image/portfolio mappings.                                                                |
| `icao-legacy-curves.json`          | Retained legacy aircraft fuel-curve stages and reference values.                                                                 |
| `icao-v13-curves.json`             | Added ICAO Carbon Emissions Calculator v13.1 aircraft curves and source/version information.                                     |
| `landscapes.json`                  | Homepage globe labels and approximate longitude/latitude markers, including Fiji Islands.                                        |
| `original-notebook-checksums.json` | SHA-256 reference hashes for the original teaching notebook files.                                                               |
| `portfolio.json`                   | Portfolio/gallery item descriptions and image slots.                                                                             |
| `research-writings.json`           | Maps written research notebooks to generated pages, titles, categories and illustrations.                                        |
| `work-in-development.json`         | Separate source list for planned or developing work shown on the research page.                                                  |
| `world.json`                       | Local geographic reference data. The current interactive globe loads its bundled World Atlas data from `assets/vendor/world.js`. |

### `scripts/`

Node.js build and preview tooling:

| File                   | Contents and purpose                                                                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build.mjs`            | Main generator. Builds site pages and notebook readers, creates automatic heading-based notebook tables of contents, materialises embedded images and generates the carbon reference/runtime bundles. |
| `research-utils.mjs`   | Shared research date sorting and status-label helpers.                                                                                                                                                |
| `research-writing.mjs` | Converts the written research `.ipynb` sources into readable article HTML and extracts their section headings.                                                                                        |
| `serve.mjs`            | Local static preview server with MIME types, no-store responses and safe path handling.                                                                                                               |

### `js/`

Browser-side behavior and source data:

| File             | Contents and purpose                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `data.js`        | Notebook catalogue, categories, research metadata and shared page data. Register new notebooks here after adding their source file. |
| `globe.js`       | Draws and operates the interactive globe, including location selection, rotation, pointer and keyboard interaction.                 |
| `landscapes.js`  | Generated JavaScript copy of `data/json/landscapes.json` for browser use. Do not edit directly.                                     |
| `math-config.js` | Configuration for MathJax rendering in notebook and research readers.                                                               |
| `reader.js`      | Reader-page interactions such as code copying, output visibility, active section tracking and print behavior.                       |
| `silvi.js`       | Silvi illustrations and associated page interactions.                                                                               |
| `site.js`        | Shared navigation, galleries, dialogs, notifications and other common page interactions.                                            |
| `theme-init.js`  | Applies saved or system light/dark theme preference early in page loading.                                                          |

#### `js/carbon/`

| File                   | Contents and purpose                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| `carbon-allocation.js` | Cabin layout and seat-equivalent allocation logic.                                           |
| `carbon-controls.js`   | Carbon form controls, search lists, tabs and user interaction.                               |
| `carbon-export.js`     | JSON backup handling and Excel workbook generation.                                          |
| `carbon-math.js`       | Flight and electric-motorcycle calculations, validation and date helpers.                    |
| `carbon-reference.js`  | Generated browser-side reference catalogue built from `data/json/`; do not edit directly.    |
| `carbon-runtime.js`    | Generated, versioned bundle of carbon modules for the page; edit the source modules instead. |
| `carbon-store.js`      | Local record persistence, migration, backup merge and storage error handling.                |
| `carbon-workspace.js`  | Carbon application orchestration, record rendering, charts and form workflow.                |

### `css/`

Stylesheets for the pages and components that are currently used by the generated site:

| File                  | Contents and purpose                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `site.css`            | Shared design tokens in use, layout, typography, homepage, navigation and responsive site styles. |
| `revision.css`        | Site-wide theme and refinement overrides included by the page shell.                              |
| `refinement.css`      | Additional current page and component refinements.                                                |
| `silvi.css`           | Silvi illustrations and scene layouts.                                                            |
| `reader.css`          | Notebook and written-research reader layout, TOC/sidebar, code cells and print styles.            |
| `protocol.css`        | Biodiversity monitoring protocol document styles.                                                 |
| `cv.css`              | CV document and print styles.                                                                     |
| `cv-screen.css`       | Screen-specific CV presentation.                                                                  |
| `carbon-redesign.css` | Carbon page layout and visual redesign.                                                           |
| `carbon-tracker.css`  | Carbon forms, tables, charts, status and tracker-specific interaction states.                     |

### `assets/`

Images, typography, local browser libraries and source photography:

| Folder                    | Contents and purpose                                                                                                                                                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `assets/brand/`           | Light/dark wordmark SVGs, favicon/app icons, Silvi illustrations and marine/landscape habitat imagery. `masters/` contains master artwork files used as illustration sources.     |
| `assets/fonts/`           | Locally bundled Inter and Playfair Display font files plus their `fonts.css` declarations.                                                                                        |
| `assets/images/`          | Original portfolio photographs grouped by portrait, fieldwork, Berg River, Cape Flats, practicals and Grootbos subject. Some originals are HEIC.                                  |
| `assets/web/`             | Web-ready image derivatives used by page templates and galleries.                                                                                                                 |
| `assets/papers/protocol/` | Cover, section backgrounds, maps and figures used in the biodiversity monitoring protocol.                                                                                        |
| `assets/research/`        | Extracted figures from the written research notebooks; filenames are content hashes generated during the build.                                                                   |
| `assets/vendor/`          | Local copies of Chart.js, D3, Marked, TopoJSON Client, World Atlas data and the MathJax distribution. These allow the site to work without fetching browser libraries from a CDN. |
| `assets/vendor/licenses/` | Licence texts for bundled software, data and fonts.                                                                                                                               |
| `assets/portfolio/`       | Reserved location for portfolio imagery; currently contains no active site content.                                                                                               |

#### Asset file groups

- Brand marks: `les-hyperion-light.svg` and `les-hyperion-dark.svg` are the theme variants used for the wordmark; `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` and `icon-192.png` are browser and home-screen icons; `silvi-face.png` is the small character mark in the site navigation.
- Silvi and learning illustrations: `unique-welcome.png`, `unique-camera.png`, `unique-r.png`, `unique-tidy.png`, `unique-charts.png`, `unique-regression.png`, `unique-glm.png`, `unique-ml.png`, `unique-map.png`, `unique-vector.png`, `unique-krill.png`, `unique-temperature.png` and `unique-guide.png` provide scene or notebook artwork. `silvi-spectral-v2.png`, `silvi-telescope-v3.png`, `silvi-protocol-v2.png`, `silvi-about-v2.png`, `silvi-cv-v2.png`, `silvi-soap-v2.png` and `silvi-data-explorer.png` illustrate research, protocol, profile, CV, essay and notebook pages.
- Place and carbon illustrations: `silvi-bazaruto-v3.png`, `silvi-mnemba-v3.png`, `silvi-okavango-v3.png`, `silvi-isimangaliso-v3.png`, `silvi-carbon-v3.png` and `silvi-motorcycle-v3.png` illustrate place and carbon content. `habitat-marine.png`, `habitat-ocean.png`, `habitat-bazaruto.png` and `habitat-mnemba.png` provide underwater scene backgrounds.
- Source artwork: `assets/brand/masters/silvi-face.png` and `silvi-data-explorer.png` are retained master illustrations corresponding to web artwork.
- Research figures: `assets/research/fec36b56d9d078bd5e51.png`, `0a6e87789aefd53f51d1.png` and `7a9f96bd1544321b6c3b.png` are extracted figure attachments from the written research notebooks.
- Protocol visuals: `assets/papers/protocol/cover.jpg`, `author-page.jpg`, `toc-bg.jpg`, `abbr-bg.jpg`, `section1.jpg`, `section2.jpg`, `section3.png`, `section4.jpg`, `section5.jpg`, `section6.jpg`, `fig1-langebaan.png`, `fig2-cba-map.png`, `fig3-invasives.png`, `fig4-fire.png` and `fig5-dpsir.png` are the document cover, page backgrounds, section images and figures.
- Original photographs: `assets/images/portrait.JPG`; `grootbos/grootbos-1.JPG`; `fieldwork/fieldwork-1.JPG` through `fieldwork-4.HEIC`; `berg-river/berg-river-1.jpeg` through `berg-river-3.jpeg`; `cape-flats/cape-flats-1.JPG` through `cape-flats-8.JPG`/`.HEIC`; and `practicals/practicals-1.HEIC`, `practicals-2.heic`, `practicals-3.HEIC` and `practicals-4.JPG` are source portfolio images. Web-ready derivatives in `assets/web/` are `portrait.jpg`, `grootbos-1.jpg`, `fieldwork-1.jpg` through `fieldwork-4.jpg`, `berg-river-1.jpg` through `berg-river-3.jpg`, `cape-flats-1.jpg` through `cape-flats-8.jpg`, and `practicals-1.jpg` through `practicals-4.jpg`; page templates use these smaller files for display.
- Browser bundles at the root of `assets/vendor/`: `chart.min.js` powers tracker charts; `d3.min.js` and `topojson.min.js` draw the globe; `world.js` provides bundled globe geography; `marked.umd.js` renders Markdown during generation. `mathjax/` contains MathJax's TeX/MathML input, CommonHTML/SVG output, fonts and accessibility modules.

### `notebooks/`

Teaching and analysis notebooks:

| File or folder                             | Contents and purpose                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `Data_Manipulation.ipynb`                  | R data creation, transformation and wrangling.                                             |
| `Data_Visualisation.ipynb`                 | R plotting and data visualisation.                                                         |
| `Generalized_Linear_Models.ipynb`          | Generalized linear model concepts and workflow.                                            |
| `Introduction_to_Machine_Learning.ipynb`   | Introductory ecological machine learning workflow.                                         |
| `Introduction_to_R.ipynb`                  | R installation, fundamentals, data types and functions.                                    |
| `Introduction_to_Spatial_Mapping999.ipynb` | Spatial mapping and remote sensing introduction.                                           |
| `Linear_Regression.ipynb`                  | Linear regression concepts and modelling workflow.                                         |
| `Vector_Data_with_sf.ipynb`                | Vector data handling and mapping with `sf`.                                                |
| `media/`                                   | Extracted embedded images with content-hash filenames, generated by the reader build.      |
| `read/`                                    | Generated HTML readers corresponding to registered notebook entries. Do not edit directly. |

The current generated reader files are `read/Data_Manipulation.html`, `read/Data_Visualisation.html`, `read/Generalized_Linear_Models.html`, `read/Introduction_to_Machine_Learning.html`, `read/Introduction_to_R.html`, `read/Introduction_to_Spatial_Mapping999.html`, `read/Linear_Regression.html` and `read/Vector_Data_with_sf.html`.

### `pages/`

Generated pages that are nested for organisation and URL structure:

| File or folder                              | Contents and purpose                |
| ------------------------------------------- | ----------------------------------- |
| `pages/protocol.html`                       | Generated monitoring protocol page. |
| `pages/research/krill-research.html`        | Generated krill research article.   |
| `pages/research/science-pseudoscience.html` | Generated pseudoscience essay.      |

### `docs/`

| File                        | Contents and purpose                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `docs/CARBON-GUIDE.md`      | Carbon tracker instructions, data boundaries, calculations, assumptions, sources, backup and export guidance. |
| `docs/GEOGRAPHY-SOURCES.md` | Approximate homepage marker coordinates, geographic sources and scope notes.                                  |

## Fonts and visual identity

The site uses two locally bundled type families:

| Family               | Use and bundled weights/styles                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Inter**            | Interface and body text; normal weights 400, 500, 600 and 700.                                                 |
| **Playfair Display** | Display and editorial serif typography; normal weights 400, 500, 600 and 700, plus italic weights 400 and 500. |

`assets/fonts/fonts.css` maps the files as follows: `font-0.ttf` through `font-3.ttf` are Inter 400/500/600/700; `font-4.ttf` and `font-5.ttf` are italic Playfair Display 400/500; `font-6.ttf` through `font-9.ttf` are normal Playfair Display 400/500/600/700. The fonts are distributed under the SIL Open Font License 1.1; the licence notices are in `assets/vendor/licenses/`. The logo's SVG lettering is outlined from Playfair Display. The logo at the top of this README switches between the light and dark SVG using the viewer's `prefers-color-scheme` setting and links to the live site.

## Build and preview

Requirements: Node.js 18 or later and npm.

```bash
npm install
npm run build
npm run preview
```

Open the preview URL printed by the server, then visit `/index.html` for the homepage. `npm run dev` starts the same local preview server. `npm run format` applies the repository's Prettier rules to HTML, CSS, JavaScript, JSON and build scripts; `npm run format:check` checks those files.

## Adding a notebook

1. Put an `.ipynb` notebook or a Jupyter-exported `.html` notebook in `notebooks/`.
2. Add its display title, description, category, date, keywords and filename to `NOTEBOOKS` in `js/data.js`.
3. Run `npm run build`.

The build generates its site reader and table of contents from notebook headings. HTML exports are parsed for headings, and existing heading IDs are preserved for notebook-internal links. If both `.html` and `.ipynb` sources with the same basename are present, the HTML export is used for the reader. Generated pages in `notebooks/read/`, generated shared data scripts and carbon runtime bundles should not be edited by hand.

## Credits and sources

### Software, data and fonts

| Component        | Version or source                      | Licence / credit                                                                 |
| ---------------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| D3               | 7.9.0                                  | ISC; bundled locally.                                                            |
| TopoJSON Client  | 3.1.0                                  | ISC; bundled locally.                                                            |
| World Atlas      | 2.0.2, Natural Earth-derived geography | ISC; Natural Earth data is public domain.                                        |
| Chart.js         | 4.4.1                                  | MIT; bundled locally for carbon charts.                                          |
| Marked           | 15.0.12                                | MIT; bundled locally for Markdown rendering during build.                        |
| MathJax          | 3.2.2                                  | Apache License 2.0; bundled locally for equations.                               |
| Inter            | Google Fonts distribution              | SIL Open Font License 1.1.                                                       |
| Playfair Display | Google Fonts distribution              | SIL Open Font License 1.1.                                                       |
| parse5           | npm package                            | MIT; build-time HTML parsing for exported notebook sources.                      |
| Prettier         | 3.9.8                                  | MIT; build-time formatting of generated pages and repository formatting scripts. |

Licence texts for bundled browser libraries, geography data and fonts are included in `assets/vendor/licenses/` and `THIRD-PARTY-NOTICES.md`: `ChartJS-LICENSE.txt` covers Chart.js, `D3-LICENSE.txt` covers D3, `TopoJSON-LICENSE.txt` covers TopoJSON Client, `WorldAtlas-LICENSE.txt` covers World Atlas, `Marked-LICENSE.txt` covers Marked, `MathJax-LICENSE.txt` covers MathJax, `Inter-OFL.txt` covers Inter and `Playfair-Display-OFL.txt` covers Playfair Display. The build-only npm tools parse5 and Prettier are MIT-licensed; their package metadata and versions are recorded in `package-lock.json`.

### Scientific and geographic references

- Airport names and coordinates: [OurAirports](https://ourairports.com/data/), public-domain snapshot accessed 28 September 2026; source and snapshot information are recorded in `data/json/airports.json`.
- Added aircraft fuel-curve data: [ICAO Carbon Emissions Calculator Methodology, v13.1](https://icec.icao.int/Documents/Methodology%20ICAO%20Carbon%20Emissions%20Calculator_v13_Final.pdf), August 2024; source/version is recorded in `data/json/icao-v13-curves.json`.
- Legacy carbon factors, landscape and operator sources, and calculation assumptions are described in `docs/CARBON-GUIDE.md` and the relevant files under `data/json/`.
- Homepage landscape marker sources and their approximate-coordinate limitations are documented in `docs/GEOGRAPHY-SOURCES.md`.
- World Atlas geography is Natural Earth-derived; attribution and licence are also listed in `THIRD-PARTY-NOTICES.md`.

### Original project material

Research writing, teaching notebooks and portfolio photography are retained from the Les Hyperion source portfolio; project illustrations are included as site-specific artwork. These materials are not represented as third-party stock imagery. The project software is covered by the MIT License in `LICENSE`; that software licence does not replace or override rights in research content, photographs, artwork, fonts or separately licensed dependencies.
