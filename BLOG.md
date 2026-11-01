# Project journal / blog authoring guide

The public-facing journal is a **static, bilingual project gallery** at `/en/blog/` and `/de/blog/`. It works with GitHub Pages and does **not** require a CMS, database, server-side runtime, third-party CDN, or GitHub Actions.

The repository holds editable source records in `content/journal.json`; the rendered HTML pages, local RSS feeds and homepage cards are committed to the same branch. All browser assets and illustrations remain self-hosted.

## Preview

```sh
git switch design
git pull origin design
python3 -m http.server 8000
```

Open `http://localhost:8000/en/blog/` or `http://localhost:8000/de/blog/`. The root route stays on localhost and redirects to `/en/`.

## Add or edit a project

1. Add one or more **your own** project images to `images/journal/`, preferably compressed WebP, JPEG, PNG, or SVG. Use descriptive filenames like `robot-localization.webp`. For a gallery-oriented design, start with a landscape 16:10 cover picture around 1200 px wide; the image is cropped to 16:10 inside cards and shown at natural 16:9-ish proportions in article pages. Keep files small enough for mobile.
2. Edit `content/journal.json`. Add a post to the `posts` array or edit an existing one:
   - `slug`: unique lower-case URL slug (e.g., `robot-localization`); once published, avoid changing it.
   - `image`: absolute path on this site, e.g., `/images/journal/robot-localization.webp`.
   - `tags`: short technology labels; enter as JSON strings.
   - `en` and `de`: both languages need `category`, `title`, `description`, `imageAlt`, `imageCaption`, and at least one `sections` element with `heading` and `text`.
3. Run `node scripts/build-journal.mjs` locally. It generates both journal index pages, the individual bilingual post pages, local RSS files, and replaces the **homepage preview** content between the journal markers. Do not edit generated article HTML directly; your edits would be overwritten.
4. Run `node scripts/check-site.mjs`, inspect both journal language versions and images in a local browser, and commit `content/`, `images/journal/`, generated `en/` and `de/` pages together.
5. If you remove or rename a post, delete its old generated `en/blog/<slug>/` and `de/blog/<slug>/` directories too, or replace them with redirects. The generator does not automatically delete historical pages.

## Sample mode and publishing

All three initial posts are **illustrative samples**, with synthetic technical diagrams; they are not assertions that Roth Software has completed those exact projects. `content/journal.json` therefore starts with `"sampleMode": true`, which adds prominent sample notices and writes `noindex,follow` robots metadata for the generated journal pages.

Before a real public blog launch, **replace every example with accurate project descriptions and photographs/graphics you own or are allowed to use**. Then set `"sampleMode": false` and regenerate. That removes the sample notices and allows search-engine indexing of generated posts. Update `robots.txt` and the language sitemaps as appropriate to include real published URLs.

Never publish client, vehicle, or internal project data without permission. Strip identifiers and sensitive details from screenshots, CAN traces, and photographs.

## Privacy and deployment

Every blog image, icon, stylesheet, and script is loaded from the same site. No third-party embeds, remote font calls, analytics or network APIs are introduced. Links to external sites can be ordinary click-through links but avoid automatic browser-loaded resources.

Existing Airform contact form submission is unchanged and still requires its informed-consent control. Do not click Submit in a preview unless you want to transmit data.

No GitHub Actions or automated build/deploy workflow is involved. GitHub Pages serves only the generated HTML. The production `gh-pages` branch remains unchanged until it is deliberately updated. The original Hugo source project is not present in this repo, so exporting from another Hugo source could overwrite these direct generated-site changes.
