# CGPA Tools

Static website (plain HTML, CSS and JavaScript, no build step). Deployed on Vercel (`vercel.json`).

## Rules this project follows

- **HTML files contain only HTML.** No `<style>` blocks, no `style=""` attributes, no inline event handlers
  (`onclick=` etc.) and no inline scripts. The only `<script>` tag left inside the HTML is the
  `application/ld+json` SEO data, which is data and not code.
- **CSS files contain only CSS**, **JavaScript files contain only JavaScript**.
- Every page loads only the CSS and JS it actually needs.

## Folder map

### CSS (loaded in this order)

| File | Loaded by |
| --- | --- |
| `base.css` | every page: tokens, reset, header/menu, footer, tables, FAQ, utilities |
| `article.css` | guide / blog / legal pages |
| `hub.css` | `cgpa-information.html` |
| `tool.css` | every calculator and converter page |
| `calculator.css` | the six CGPA calculators |
| `converter.css` | CGPA to GPA, CGPA to Percentage |
| `grade-calculator.css`, `weighted-average.css` | their own page |
| `exam-form.css` | SSC, HSC and IELTS calculators (shared form kit, classes start with `ex-`) |
| `ielts.css` | IELTS only |
| `home.css`, `error-page.css`, `info-pages.css` | home, 404, about + contact |

### JavaScript

| File | Purpose |
| --- | --- |
| `site.js` | all pages: fonts, mobile menu, mega menu, FAQ accordions |
| `analytics.js` | all pages: Google Analytics + Clarity, loaded after the page has loaded |
| `calculator.js` | the six CGPA calculators. The grading scale comes from `<body data-scale="...">` |
| `calculator-report.js` | HTML report template, downloaded only when "Download Report" is clicked |
| `gpa-cgpa.js`, `percentage-converter.js`, `copy-text.js` | the two converters |
| `grade-calculator.js` | grade calculator |
| `weighted-math.js`, `weighted-average-calculator.js` | weighted average calculator |
| `exam-calculator.js` + `ssc-data.js` / `hsc-data.js` | SSC and HSC calculators (same engine, different subject data) |
| `ielts-calculator.js` | IELTS band score calculator |

## Everyday tasks

- **Change a grading scale** (grade points, labels, CGPA remarks): edit the `SCALES` object at the top of `calculator.js`.
- **Add another CGPA calculator page**: copy an existing calculator page, add a new entry to `SCALES` and set
  `data-scale` on `<body>`.
- **Change SSC / HSC subjects**: edit `ssc-data.js` or `hsc-data.js`.
- **After editing a CSS or JS file**, change the `?v=...` number on its `<link>`/`<script>` tags (search and
  replace the old number across all pages) so visitors get the new file instead of a cached one.
- Spacing helpers (`mt-16`, `mb-20`, `my-16`, `text-center`...) live at the bottom of `base.css`. Use them
  instead of `style=""` attributes.

## Deliberate exceptions

Two JavaScript lines set a style directly, because the value is computed at run time:
the CGPA progress bar width (`calculator.js`) and the mega-menu position offset (`site.js`).
