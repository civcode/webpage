# ROTH Software static website

This repository contains the **published, generated static website** for [rothsoftware.com](https://rothsoftware.com/). The production branch is `gh-pages`; prepare changes on `dev` and review before merging. This repository currently does **not** contain the Hugo source project used to generate the pages. Future regeneration must retain the fixes committed here or they will be overwritten. Do not add automatic GitHub Actions workflows.

## Privacy and asset policy

- **Keep all browser-loaded CSS, JavaScript, fonts, images, icons and other assets within this repository**, served from the site's own origin. No CDN imports or Google Fonts. Avoid third-party iframes, maps, analytics and media embeds.
- **Exception:** The contact form intentionally posts to Airform (USA) only when a visitor submits it after checking the required informed-consent checkbox. Retain this behavior unless the business owner explicitly changes it.
- The service worker must not import remote scripts. Hosting on GitHub Pages is a separate issue from self-hosting assets; assess the host's data-processing and international transfer compliance independently.
- Social links to third-party websites may remain ordinary user-initiated navigation links, but must not cause third-party asset requests on page load.

## Language pages

The English pages are the basis for the German pages. Active bilingual sections are `/`, `/services/`, `/technology/`, `/about/`, `/contact/`, `/legal-notice/` and `/privacy-policy/`, each under `/en` and `/de`. The language switch links to the corresponding translated page. Keep `hreflang`, page title, canonical link and sitemap synchronized when adding pages. Demo FAQ, pricing, blog and terms content is not part of the active navigation or sitemap.

## Validation

Run `node scripts/check-site.mjs` from the repository root after edits. It checks representative privacy requirements and local references without installing npm packages. Review browser developer tools' Network tab for all routes before publishing, including form submission/redirect behavior; submissions to Airform are intentionally external and consent-gated. Manually check keyboard and small-screen navigation.
