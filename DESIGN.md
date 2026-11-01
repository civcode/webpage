# Industrial Dark website prototype

This is the static GitHub Pages design prototype on branch `design`, based on the `dev` branch. The production `gh-pages` branch is deliberately untouched.

## Preview locally

1. Check out this branch: `git switch design` (or `git clone -b design https://github.com/civcode/webpage.git`).
2. At the repository root run: `python3 -m http.server 8000`.
3. Open `http://localhost:8000/en/` and `http://localhost:8000/de/`.
4. Review the services, technology, about, contact and legal pages from the site navigation. Switch EN/DE to test matching routes.

**Do not test-submit the contact form unless you intend to transmit the data to Airform.** The form continues to POST to `airform.io` only after the visitor explicitly submits the required consent form. Local preview does not disable that action.

The GitHub Pages production site remains unchanged until someone explicitly merges/publishes a branch. GitHub Pages doesn't automatically deploy arbitrary development branches; do not change the published branch merely to preview this design.

## What's in this prototype

- `css/design.css`: responsive Industrial Dark palette (navy, teal and coral logo accents), technical hero, navigation, content cards and shared inner-page styling. Existing CSS/fonts/icons stay in the repository and remain available.
- `js/design.js`: dependency-free mobile navigation, clickable system-layer explainer, deterministic virtual HMI inputs/output and scroll reveals. It performs **no network requests**.
- `en/index.html` and `de/index.html`: entirely rebuilt, localized homepages with an inline SVG signal schematic, dedicated service cards, technical stack, interactive demo, and direct contact call-to-action.
- Core English/German content pages share the visual theme and use root-relative first-party asset/navigation URLs for portability.
- `scripts/check-site.mjs`: a manually run static reference and privacy check.

## Quality and privacy guardrails

- All browser-loaded images, SVG artwork, CSS, JS, fonts and icons remain self-hosted in this repository. No CDN, remote font stylesheet, analytics embed, live map, or remote runtime UI library was added.
- GitHub Pages works because the site consists only of HTML/CSS/JS/locally hosted assets. There is no backend requirement.
- Animation is progressively enhanced and respects `prefers-reduced-motion`; buttons and range input are keyboard-accessible. The HMI is explicitly simulated, not real telemetry.
- English and German homepages contain equivalent copy and interactive features.
- Airform and its consent checkbox were **not changed**. Existing legal and privacy information is not a compliance certification. Hosting on GitHub Pages has its own international-transfer implications distinct from the asset-loading policy.
- The original Hugo source templates are **not** in this repository. Regenerating the deployed HTML from a separate source project can overwrite these changes; port the design components to the actual source before the next rebuild.

## Manual checks before publishing

Run `node scripts/check-site.mjs` locally. Also check desktop and small-screen layout, keyboard navigation and Escape-to-close mobile menu, reduced-motion preferences, network requests in browser developer tools, and the EN/DE contact form consent display. Review copy and simulated behavior before merging to production.

No GitHub Actions are added or executed as part of this design.
