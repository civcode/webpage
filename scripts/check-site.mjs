#!/usr/bin/env node
/**
 * Local, dependency-free static-site validation.
 *
 * Run manually: node scripts/check-site.mjs
 * Deliberately no GitHub Actions or network calls.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const origin = 'https://rothsoftware.com';
const slugs = ['', 'services', 'technology', 'about', 'contact', 'legal-notice', 'privacy-policy'];
const failures = [];
let checked = 0;
const fail = (file, message) => failures.push(file + ': ' + message);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const absolute = join(dir, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}
const files = walk(root);
const localPath = file => relative(root, file).replaceAll('\\', '/');
const hasFile = pathname => {
  const safePath = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (!safePath || safePath === '/') return existsSync(join(root, 'index.html'));
  if (safePath.split('/').includes('..')) return false;
  return existsSync(join(root, safePath)) || existsSync(join(root, safePath, 'index.html'));
};
function resource(file, url) {
  if (!url || /^(data:|blob:|mailto:|tel:|#|javascript:)/i.test(url)) return;
  let parsed;
  try { parsed = new URL(url.replaceAll('&amp;', '&'), origin + '/' + file); }
  catch { fail(file, 'Invalid resource URL: ' + url); return; }
  if (parsed.origin !== origin) {
    fail(file, 'External browser-loaded resource: ' + parsed.href);
    return;
  }
  if (!hasFile(parsed.pathname)) fail(file, 'Missing local asset: ' + parsed.pathname);
}
const attribute = (tag, name) => {
  const re = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))', 'i');
  const m = re.exec(tag);
  return m?.[1] ?? m?.[2] ?? m?.[3] ?? null;
};
for (const absolute of files) {
  const file = localPath(absolute);
  if (file.startsWith('.git/')) continue;
  if (file.endsWith('.css')) {
    const css = readFileSync(absolute, 'utf8');
    for (const m of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      resource(file, m[1].trim());
    }
  }
  if (!file.endsWith('.html')) continue;
  const html = readFileSync(absolute, 'utf8');
  for (const m of html.matchAll(/<(img|script|link|iframe|source|video|audio|track|object|embed)\b[^>]*>/gi)) {
    const tag = m[0], kind = m[1].toLowerCase();
    if (kind === 'link') {
      const rel = attribute(tag, 'rel')?.toLowerCase();
      if (!['stylesheet', 'icon', 'shortcut icon', 'apple-touch-icon', 'manifest', 'preload', 'modulepreload'].includes(rel)) continue;
    }
    for (const attr of ['src', 'href', 'poster', 'data']) {
      const value = attribute(tag, attr);
      if (value !== null) resource(file, value);
    }
    const srcset = attribute(tag, 'srcset');
    if (srcset) {
      for (const item of srcset.split(',')) {
        const url = item.trim().split(/\s+/)[0];
        resource(file, url);
      }
    }
  }
  checked++;
}
const rootHtml = readFileSync(join(root, 'index.html'), 'utf8');
if (!/<meta\s+http-equiv=["']?refresh["']?\s+content=["']0;\s*url=\/en\/["']/i.test(rootHtml)) {
  fail('index.html', 'Root must redirect to /en/ on the current host, not the live domain');
}
for (const lang of ['en', 'de']) {
  for (const slug of slugs) {
    const page = lang + '/' + (slug ? slug + '/' : '') + 'index.html';
    if (!hasFile('/' + page)) { fail(page, 'Missing bilingual page'); continue; }
    const html = readFileSync(join(root, page), 'utf8');
    if ((html.match(/<title>/g) || []).length !== 1) fail(page, 'Expected exactly one title');
    if (!new RegExp('<html\\s+lang=' + lang).test(html)) fail(page, 'Incorrect document language');
    if (/Lorem ipsum|This is meta description|<todo>/i.test(html)) fail(page, 'Unfinished placeholder');
    if (!/<main\s+id=(?:"main"|'main'|main)(?:\s|>)/i.test(html)) fail(page, 'Missing main landmark for skip link');
    if (!html.includes('class=skip-link')) fail(page, 'Missing keyboard skip link');
    if (!html.includes('rel=canonical')) fail(page, 'Missing canonical URL');
    if (/<base\\s+href=/i.test(html)) fail(page, 'Absolute base URL prevents a portable local preview');
    if (/<link\\s+rel="shortcut icon"\\s+href=https?:\\/\\//i.test(html)) fail(page, 'Favicon should load from the current host');
    for (const other of ['en', 'de']) {
      if (!html.includes('hreflang=' + other)) fail(page, 'Missing hreflang ' + other);
    }
    const other = lang === 'de' ? 'en' : 'de';
    const equivalent = origin + '/' + other + '/' + (slug ? slug + '/' : '');
    if (!html.includes('href="' + equivalent + '" lang=' + other) && !html.includes('href="/' + other + '/' + (slug ? slug + '/' : '') + '" lang=' + other)) fail(page, 'Missing language-switch link to ' + equivalent);
    if (/\/de\/impressum\b/.test(html)) fail(page, 'Broken legacy Impressum link');
    if (!html.includes('class="rse-theme"')) fail(page, 'Blueprint Light body class missing');
    if (!html.includes('href="/css/design.css"')) fail(page, 'Local Blueprint Light stylesheet missing');
    if (!html.includes('src="/js/design.js"')) fail(page, 'Local interactive script missing');
    if (!html.includes('<meta name="theme-color" content="#ffffff">')) fail(page, 'Blueprint Light browser theme missing');
    if (!html.includes('href="/' + lang + '/manifest.webmanifest"')) fail(page, 'Local language manifest missing');
    if (slug === '') {
      if (!html.includes('data-rse-hmi') || !html.includes('data-rse-stages')) fail(page, 'Homepage interactive demo missing');
      if (!html.includes('class="rse-hero"')) fail(page, 'Homepage hero missing');
    }
    if (slug === 'services') {
      const cards = [...html.matchAll(/class="rse-svc-cell"\s+data-rse-category="(networks|diagnostics|hmi|embedded|robotics)"/g)];
      if (cards.length !== 15) fail(page, 'Expected 15 engineering capability cards');
      const categories = ['networks', 'diagnostics', 'hmi', 'embedded', 'robotics'];
      for (const category of categories) {
        if (cards.filter(item => item[1] === category).length !== 3) fail(page, 'Expected three cards in ' + category);
        if (!html.includes('data-rse-filter="' + category + '"')) fail(page, 'Missing filter button: ' + category);
      }
      if (!html.includes('data-rse-filter="all"')) fail(page, 'Missing all-capabilities filter');
      if (!html.includes('href="/css/services.css"') || !html.includes('src="/js/services.js"')) fail(page, 'Missing local service grid assets');
      if (!/<main id=main class="rse-services">/.test(html)) fail(page, 'Missing redesigned services main');
      if (/Robust Engineering|Reliable Quality|Solides Engineering|Zuverlässige Qualität/.test(html)) fail(page, 'Old generic service blocks remain');
      for (const expected of ['CAN / CAN FD', 'SAE J1939', 'UDS', 'DoIP', 'Qt / QML']) {
        if (!html.includes(expected)) fail(page, 'Missing named technical capability: ' + expected);
      }
    }
    if (slug === 'contact') {
      if (!html.includes('action=https://airform.io/contact@rothsoftware.com')) fail(page, 'Airform action changed');
      if (!/<input\b[^>]*name=recaptcha_consent[^>]*required/i.test(html)) fail(page, 'Airform informed-consent checkbox missing');
    }
  }
}

/* Validate the editable journal source, local artwork and generated bilingual pages. */
const journal = JSON.parse(readFileSync(join(root, 'content/journal.json'), 'utf8'));
if (!Array.isArray(journal.posts) || journal.posts.length === 0) fail('content/journal.json', 'No journal entries');
const journalSlugs = new Set();
for (const post of journal.posts ?? []) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug) || journalSlugs.has(post.slug)) fail('content/journal.json', 'Invalid or duplicate slug: ' + post.slug);
  journalSlugs.add(post.slug);
  if (!post.image?.startsWith('/images/journal/')) fail('content/journal.json', 'Images must be local to the journal: ' + post.slug);
  else resource('content/journal.json', post.image);
  for (const lang of ['en', 'de']) {
    if (!post[lang]?.title || !post[lang]?.description || !post[lang]?.imageAlt || !post[lang]?.sections?.length) fail('content/journal.json', 'Missing language content for ' + lang + ': ' + post.slug);
    const page = lang + '/blog/' + post.slug + '/index.html';
    if (!existsSync(join(root, page))) { fail(page, 'Generated journal article is missing'); continue; }
    const html = readFileSync(join(root, page), 'utf8');
    if (!html.includes('src="' + post.image + '"')) fail(page, 'Post image does not match source data');
    if (!html.includes('href="/' + lang + '/blog/"')) fail(page, 'Return to journal missing');
    if (!html.includes('href="/' + (lang === 'en' ? 'de' : 'en') + '/blog/' + post.slug + '/"')) fail(page, 'Language switch missing');
    if (!/<main\s+id="main"/.test(html) || !/<h1>/.test(html)) fail(page, 'Missing semantic main or heading');
    if (journal.sampleMode && !html.includes('name="robots" content="noindex,follow"')) fail(page, 'Sample content must be noindexed');
    if (!journal.sampleMode && !html.includes('name="robots" content="index,follow"')) fail(page, 'Published content should be indexed');
  }
}
for (const lang of ['en', 'de']) {
  const file = lang + '/blog/index.html';
  const html = readFileSync(join(root, file), 'utf8');
  if (!html.includes('href="/' + lang + '/manifest.webmanifest"')) fail(file, 'Local manifest missing');
  if (!html.includes('href="/' + (lang === 'en' ? 'de' : 'en') + '/blog/"')) fail(file, 'Language switch missing');
  if (journal.sampleMode && !html.includes('name="robots" content="noindex,follow"')) fail(file, 'Sample archive must be noindexed');
  for (const slug of journalSlugs) if (!html.includes('href="/' + lang + '/blog/' + slug + '/"')) fail(file, 'Article link missing for ' + slug);
  const homepage = readFileSync(join(root, lang, 'index.html'), 'utf8');
  if (!homepage.includes('<!-- RSE JOURNAL START -->') || !homepage.includes('<!-- RSE JOURNAL END -->')) fail(lang + '/index.html', 'Regeneration markers missing');
  if (!homepage.includes('href=/' + lang + '/blog/')) fail(lang + '/index.html', 'Journal navigation missing');
  if (!existsSync(join(root, lang, 'blog/index.xml'))) fail(lang + '/blog/index.xml', 'Journal RSS feed missing');
}
if (!existsSync(join(root, 'scripts/build-journal.mjs'))) fail('scripts/build-journal.mjs', 'Manual authoring generator missing');

const designCss = readFileSync(join(root, 'css/design.css'), 'utf8');
if (!designCss.includes('--rse-bg:#f4f8fc') || !designCss.includes('--rse-red:#d12f3e') || !designCss.includes('--rse-blue:#245d93')) {
  fail('css/design.css', 'Blueprint Light palette variables changed unexpectedly');
}
const serviceCss = readFileSync(join(root, 'css/services.css'), 'utf8');
if (/@import\s|url\(\s*["']?https?:\/\//i.test(serviceCss)) fail('css/services.css', 'Remote CSS import not allowed');
const serviceJs = readFileSync(join(root, 'js/services.js'), 'utf8');
if (/\b(?:fetch|XMLHttpRequest|sendBeacon|importScripts)\s*\(/.test(serviceJs)) fail('js/services.js', 'Unexpected network API in service filters');
if (!serviceJs.includes("cell.hidden =")) fail('js/services.js', 'Filter script no longer changes card visibility');
const script = readFileSync(join(root, 'js/design.js'), 'utf8');
if (/\b(?:fetch|XMLHttpRequest|sendBeacon|importScripts)\s*\(/.test(script)) fail('js/design.js', 'Unexpected network API in client-side demo');
const sw = readFileSync(join(root, 'service-worker.js'), 'utf8');
if (/importScripts\s*\(\s*['"]https?:\/\//i.test(sw)) fail('service-worker.js', 'Remote dependency');
for (const lang of ['en', 'de']) {
  const manifest = JSON.parse(readFileSync(join(root, lang, 'manifest.webmanifest'), 'utf8'));
  if (manifest.start_url !== '/' + lang + '/') fail(lang + '/manifest.webmanifest', 'Wrong language start_url');
  if (manifest.theme_color !== '#ffffff' || manifest.background_color !== '#f4f8fc') fail(lang + '/manifest.webmanifest', 'Blueprint Light manifest theme is inconsistent');
  for (const icon of manifest.icons ?? []) resource(lang + '/manifest.webmanifest', icon.src);
}
if (failures.length) {
  console.error('FAILED: ' + failures.length + ' problems\n' + failures.map(x => ' - ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('OK: ' + checked + ' HTML files and all active bilingual pages checked; assets are same-origin.');
  console.log('Note: Airform POST is deliberately external and requires user consent; verify live network behavior manually.');
}
