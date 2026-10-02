<p align="center">
	<img src="assets/brand/les-hyperion-dark.svg" alt="Les Hyperion" width="420" />
</p>

# Les Hyperion

Les Hyperion is a static portfolio and research website for Phemelo Rutlokoane. It presents work in quantitative ecology, biostatistics, spatial ecology, remote sensing, and conservation. The site includes research writing, interactive R notebooks, a browser-based carbon tracker, a project portfolio, and a curriculum vitae. It has no application server or account system; the carbon tracker saves records in the visitor's browser.

## Run locally

Requirements: Node.js 18 or newer.

```sh
npm install
npm run build
npm run dev
```

The development server prints the local address to open. `npm run preview` starts the same static server. `npm run format:check` checks formatting; `npm run format` formats the HTML, CSS, JavaScript, and JSON source files.

The site is designed to work with its browser libraries supplied locally. Run the build after changing source templates, data, or carbon modules: it generates the served pages and browser-ready data/runtime files. Edit the source files described below rather than their generated counterparts.

## Repository guide

### Root documents

| File                    | Purpose                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| `index.html`            | Home page and entry point for the portfolio.                                      |
| `research.html`         | Research listing and writing page.                                                |
| `notebooks.html`        | Catalogue and reader for the R notebooks.                                         |
| `carbon.html`           | Interactive travel and carbon-record tracker.                                     |
| `about.html`            | Biography, portfolio, and project galleries.                                      |
| `cv.html`               | Curriculum vitae page.                                                            |
| `LICENSE`               | Repository licence.                                                               |
| `THIRDPARTY-NOTICES.md` | Third-party browser dependencies, licences, attribution, and data-source notices. |
| `package.json`          | Project metadata, Node requirement, and development/build/format commands.        |
| `package-lock.json`     | Locked npm dependency versions for reproducible installs.                         |
| `README.md`             | Project overview and repository guide.                                            |

### `content/`

HTML fragments inserted into generated site pages by the build script.

| File or folder        | Purpose                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| `carbon-tracker.html` | Carbon tracker workspace, controls, summaries, and method content.      |
| `cv-screen.html`      | Main CV experience, education, and professional profile content.        |
| `cv.html`             | Additional CV page content used by the build.                           |
| `protocol.html`       | Content for the research protocol page.                                 |
| `research/`           | Source notebooks for research essays; see the notebook inventory below. |

### `pages/`

Generated HTML pages for longer-form documents. Their source content is in `content/` and `data/json/`; the build writes the results here instead of the repository root.

| File or folder                        | Purpose                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `protocol.html`                       | Generated biodiversity monitoring protocol page, assembled from `content/protocol.html`. |
| `research/krill-research.html`        | Generated research article page on krill ecology.                                        |
| `research/science-pseudoscience.html` | Generated essay page distinguishing scientific and pseudoscientific claims.              |

### `css/`

Stylesheets for the site and its individual pages/features.

| File or folder                                | Purpose                                                     |
| --------------------------------------------- | ----------------------------------------------------------- |
| `tokens.css`                                  | Shared design tokens such as colours and spacing.           |
| `base.css`                                    | Base typography, layout, and element styles.                |
| `site.css`                                    | Shared site shell and global styles.                        |
| `nav.css`                                     | Navigation styles.                                          |
| `home.css`                                    | Home page styles.                                           |
| `about.css`                                   | About and portfolio page styles.                            |
| `research.css`                                | Research page styles.                                       |
| `notebooks.css`                               | Notebook catalogue styles.                                  |
| `reader.css`                                  | Notebook and research reader styles.                        |
| `cv.css`                                      | CV page styles.                                             |
| `cv-screen.css`                               | CV screen-specific layout and presentation.                 |
| `carbon-tracker.css`                          | Carbon tracker interface styles.                            |
| `carbon-redesign.css`                         | Carbon page redesign styles.                                |
| `carbon/`                                     | Additional carbon tracker styling in `carbon.css`.          |
| `modal.css`                                   | Shared modal/dialog styles.                                 |
| `protocol.css`                                | Research protocol page styles.                              |
| `refinement.css`, `revision.css`, `silvi.css` | Shared visual refinements and Silvi character presentation. |

### `js/`

Browser-side site behavior and source JavaScript modules.

| File or folder              | Purpose                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data.js`                   | Source catalogue data for notebooks and research.                                                                                                                                                                                                                                                                                                                                                                |
| `site.js`                   | Shared site interactions.                                                                                                                                                                                                                                                                                                                                                                                        |
| `nav.js`                    | Responsive navigation behavior.                                                                                                                                                                                                                                                                                                                                                                                  |
| `theme-init.js`, `theme.js` | Early theme setup and theme switching.                                                                                                                                                                                                                                                                                                                                                                           |
| `home.js`                   | Home page interactions.                                                                                                                                                                                                                                                                                                                                                                                          |
| `about.js`                  | About and portfolio interactions.                                                                                                                                                                                                                                                                                                                                                                                |
| `research.js`               | Research listing and article interactions.                                                                                                                                                                                                                                                                                                                                                                       |
| `notebooks.js`              | Notebook catalogue behavior.                                                                                                                                                                                                                                                                                                                                                                                     |
| `reader.js`                 | Notebook/research reader behavior.                                                                                                                                                                                                                                                                                                                                                                               |
| `globe.js`                  | Interactive globe visualization.                                                                                                                                                                                                                                                                                                                                                                                 |
| `math-config.js`            | MathJax configuration.                                                                                                                                                                                                                                                                                                                                                                                           |
| `silvi.js`                  | Silvi character presentation and related behavior.                                                                                                                                                                                                                                                                                                                                                               |
| `landscapes.js`             | Generated browser data for landscape visualizations; source data is in `data/json/landscapes.json`.                                                                                                                                                                                                                                                                                                              |
| `carbon/`                   | Carbon tracker source modules: `carbon-math.js` calculates emissions; `carbon-allocation.js` assigns emissions; `carbon-store.js` persists records; `carbon-export.js` exports and backs up records; `carbon-workspace.js` coordinates tracker state and views; `carbon-controls.js` handles interface controls; `carbon-reference.js` and `carbon-runtime.js` are generated reference data and bundled runtime. |

### `data/json/`

JSON source data used by the website and build scripts.

| File                               | Purpose                                                      |
| ---------------------------------- | ------------------------------------------------------------ |
| `airports.json`                    | Airport reference data for route and distance calculations.  |
| `carbon-aircraft.json`             | Aircraft names, ICAO codes, and seat-count reference data.   |
| `carbon-configurations.json`       | Carbon tracker calculation and configuration options.        |
| `carbon-landscapes.json`           | Landscape-specific carbon reference factors.                 |
| `carbon-operators.json`            | Airline/operator catalogue and source references.            |
| `icao-legacy-curves.json`          | Legacy ICAO aircraft fuel/emissions curves.                  |
| `icao-v13-curves.json`             | ICAO methodology v13.1 curve data.                           |
| `galleries.json`                   | Definitions and image selections for site galleries.         |
| `landscapes.json`                  | Landscape and location data used by the site visualizations. |
| `portfolio.json`                   | Portfolio project entries and associated gallery content.    |
| `research-writings.json`           | Research writing metadata and article content.               |
| `work-in-development.json`         | Projects and work currently in development.                  |
| `original-notebook-checksums.json` | Checksums used to track the original notebook files.         |
| `world.json`                       | Geographic map data for the globe/map visualizations.        |

### `notebooks/`

R teaching and analysis notebooks, along with their generated web-readable versions.

| File or folder                             | Purpose                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `Introduction_to_R.ipynb`                  | R language fundamentals.                                                          |
| `Data_Manipulation.ipynb`                  | Data wrangling and manipulation in R.                                             |
| `Data_Visualisation.ipynb`                 | Data visualization in R.                                                          |
| `Introduction_to_Spatial_Mapping999.ipynb` | Introduction to spatial mapping and remote sensing.                               |
| `Vector_Data_with_sf.ipynb`                | Vector spatial data workflows using `sf`.                                         |
| `Introduction_to_Machine_Learning.ipynb`   | Machine-learning concepts and workflow for ecological data.                       |
| `Linear_Regression.ipynb`                  | Linear regression modelling and interpretation.                                   |
| `Generalized_Linear_Models.ipynb`          | Generalized linear modelling.                                                     |
| `read/`                                    | Generated HTML versions of the eight notebooks above, used by the website reader. |
| `media/`                                   | Contains images used by notebooks.                                                |

`content/research/` also contains `Krill_research.ipynb` (krill research analysis) and `Pseudoscience.ipynb` (science/pseudoscience essay source notebooks).

### `assets/`

Branding, fonts, images, research illustrations, and locally bundled browser dependencies.

| File or folder         | Purpose                                                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LesHyperion_logo.png` | Raster logo asset.                                                                                                                                                                                                                                                       |
| `brand/`               | Brand marks, icons, and Silvi illustrations; `masters/` contains image masters.                                                                                                                                                                                          |
| `fonts/`               | Local font files and `fonts.css`, which declares them for the site.                                                                                                                                                                                                      |
| `images/`              | Contains images; its `berg-river/`, `cape-flats/`, `fieldwork/`, `grootbos/`, and `practicals/` folders also contain images.                                                                                                                                             |
| `web/`                 | Contains images used on site pages.                                                                                                                                                                                                                                      |
| `research/`            | Contains research images.                                                                                                                                                                                                                                                |
| `papers/`              | Contains paper assets; `protocol/` contains images for the protocol document.                                                                                                                                                                                            |
| `vendor/`              | Locally bundled browser libraries: Chart.js, D3, Marked, TopoJSON, World Atlas data, and MathJax. `licenses/` contains their licence texts; `mathjax/` contains MathJax components, including accessibility (`a11y/`), input (`input/`), and output (`output/`) modules. |

### `scripts/`

Node.js tooling for local development and generation.

| File                   | Purpose                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `serve.mjs`            | Serves the repository locally for development and preview.                                                  |
| `build.mjs`            | Generates assembled pages, notebook reader outputs, carbon runtime/reference data, and other derived files. |
| `research-utils.mjs`   | Shared research sorting and status utilities used by the build.                                             |
| `research-writing.mjs` | Renders research writing for generated pages.                                                               |

`node_modules/` is created by `npm install`; it contains installed development dependencies and is not project source.
