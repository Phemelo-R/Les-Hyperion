# Les Hyperion

What this repository includes:
- about.html — introduction page that describes the site, author, dates, update frequency and focus areas.
- interactive.html — in-browser interactive runner letting visitors choose R (WebR) or Python (Pyodide), edit code and run it client-side.
- assets/css/rebrand.css — styling for the new pages; respects the existing styles.css via a `.theme-light` class toggle.
- assets/js/runner.mjs — client-side code that loads Pyodide & WebR, runs user code, captures output and displays plots.
- metadata.json — single place to update author, dates, frequency and short description.
