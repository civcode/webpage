# Blueprint Light website prototype

This is the static GitHub Pages design prototype on branch `design`, based on the `dev` branch. The production `gh-pages` branch is deliberately untouched.

## Preview locally

1. Check out this branch: `git switch design` (or `git clone -b design https://github.com/civcode/webpage.git`).
2. At the repository root run: `python3 -m http.server 8000`. If you previously cloned this branch, first run `git pull origin design` so the local redirect fix is present.
3. Open `http://localhost:8000/` (which now redirects **locally** to `/en/`), or go directly to `http://localhost:8000/en/` and `http://localhost:8000/de/`. Do not use `0.0.0.0` as the browser address; use `localhost` or `127.0.0.1`.
4. Review the services, technology, about, contact and legal pages from the site navigation. Switch EN/DE to test matching routes.

**Do not test-submit the contact form unless you intend to transmit the data to Airform.** The form continues to POST to `airform.io` only after the visitor explicitly submits the required consent form. Local preview does not disable that action.

The GitHub Pages production site remains unchanged until someone explicitly merges/publishes a branch. GitHub Pages doesn't automatically deploy arbitrary development branches; do not change the published branch merely to preview this design.

## What's in this prototype

- `css/design.css`: responsive Blueprint Light palette (white and pale-blue surfaces, navy typography, engineering blue and the logo's original red), technical hero, navigation, content cards and shared inner-page styling. Existing CSS/fonts/icons stay in the repository and remain available.
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

## Visual palette and logo integration

- Background: `#f4f8fc`; alternate surface: `#eaf2f9`; cards: `#ffffff`.
- Engineering blue: `#245d93`; navy headings: `#19344f`; supporting text: `#4e657c`.
- Logo red: `#d12f3e`, reserved for fine highlights, active schematic markers and focus accents. The original SVG logo is unchanged.
- The header and footer logo plaques are always **white**, as requested; the original red/grey SVG mark is unchanged.
- The SVG diagram, interactive system stages, HMI visualization, navigation, footer, forms and PWA manifest use Blueprint Light. Animations and functionality are retained.

## Bilingual project journal

- Journal landing pages: `/en/blog/` and `/de/blog/`, with three illustrative posts, three local SVG covers and language-matched article detail pages.
- All maintained site pages include a Journal navigation and footer link. The two homepages show three latest-post cards before the contact CTA.
- The three example topics are a 64 GB VRAM AI workstation, mobile robot path planning, and J1939 HMI visualization. These are **sample concepts**, not claims that the projects have been completed. The journal and generated articles are noindexed while `content/journal.json` has `sampleMode: true`.
- `content/journal.json` is the editable source, and `node scripts/build-journal.mjs` rebuilds the bilingual HTML, local RSS and homepage cards. See [BLOG.md](BLOG.md) for the complete photo/post workflow.
- Obsolete template posts and pagination pages redirect to the journal **on the current host**, including when previewed at localhost.

## Services capability grid

- `/en/services/` and `/de/services/` now use a technical Blueprint Light grid instead of the original generic service text-and-slider sections.
- 15 bilingual cards in five groups: **vehicle networks** (CAN/CAN FD, J1939, Ethernet/TCP-IP), **diagnostics** (UDS, DoIP, diagnostic trace analysis), **HMI** (Qt/QML, industrial HMI, signal visualization), **embedded** (C++/Python, embedded Linux, system integration), and **robotics** (ROS/Gazebo, path planning, computer vision).
- A local `css/services.css` stylesheet renders the responsive three/two/one-column cards. Local `js/services.js` provides category filtering with pressed-state accessibility and a live results count; every card remains visible if JavaScript is disabled.
- The top panel illustrates the flow from network signals through diagnostics and application logic to user interfaces. The page concludes with a four-step engineering process and a project contact CTA.
- The design uses the same original white-backed logo and does not add third-party images, fonts, JavaScript, analytics or external services. The existing Airform contact form and consent remain unchanged.
- `scripts/check-site.mjs` includes regression checks for both language versions. Run it manually before deployment.

## Technology toolchain grid

- `/en/technology/` and `/de/technology/` now match the Blueprint Light Services design instead of using long alternating icon/text rows.
- There are **16 technology tiles** with icon or logo, purpose, and description in both languages. Categories: languages (C, C++, Python), development tools (Linux, Docker, VS Code, Jupyter), frameworks/AI (Qt/QML, OpenCV, PyTorch), robotics/simulation (ROS, Gazebo), and delivery/collaboration (Git, GitHub, Bitbucket, Jira).
- Visitors can filter the grid by category using the existing self-hosted `js/services.js`. All tiles are visible without JavaScript. The filter also updates the accessible result count.
- `css/services.css` provides the common grid and hero, while `css/technology.css` styles the technology-logo tiles and system workflow. All icon assets and icon fonts are served from this repository; the existing SVG logo retains a **white background**.
- A toolchain overview, example signal-to-HMI schematic, four-phase development workflow and local links to Services, Journal and Contact connect the technology stack to practical outcomes.
- `scripts/check-site.mjs` includes bilingual Technology page regression checks. No additional GitHub Actions or remote dependencies were introduced.
