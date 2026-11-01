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
for (const lang of ['en', 'de']) {
  for (const slug of slugs) {
    const page = lang + '/' + (slug ? slug + '/' : '') + 'index.html';
    if (!hasFile('/' + page)) { fail(page, 'Missing bilingual page'); continue; }
    const html = readFileSync(join(root, page), 'utf8');
    if ((html.match(/<title>/g) || []).length !== 1) fail(page, 'Expected exactly one title');
    if (!new RegExp('<html\\s+lang=' + lang).test(html)) fail(page, 'Incorrect document language');
    if (/Lorem ipsum|This is meta description|<todo>/i.test(html)) fail(page, 'Unfinished placeholder');
    if (!html.includes('<main id=main>')) fail(page, 'Missing main landmark for skip link');
    if (!html.includes('class=skip-link')) fail(page, 'Missing keyboard skip link');
    if (!html.includes('rel=canonical')) fail(page, 'Missing canonical URL');
    for (const other of ['en', 'de']) {
      if (!html.includes('hreflang=' + other)) fail(page, 'Missing hreflang ' + other);
    }
    const other = lang === 'de' ? 'en' : 'de';
    const equivalent = origin + '/' + other + '/' + (slug ? slug + '/' : '');
    if (!html.includes('href="' + equivalent + '" lang=' + other)) fail(page, 'Missing language-switch link to ' + equivalent);
    if (/\/de\/impressum\b/.test(html)) fail(page, 'Broken legacy Impressum link');
    if (slug === 'contact') {
      if (!html.includes('action=https://airform.io/contact@rothsoftware.com')) fail(page, 'Airform action changed');
      if (!/<input\b[^>]*name=recaptcha_consent[^>]*required/i.test(html)) fail(page, 'Airform informed-consent checkbox missing');
    }
  }
}
const sw = readFileSync(join(root, 'service-worker.js'), 'utf8');
if (/importScripts\s*\(\s*['"]https?:\/\//i.test(sw)) fail('service-worker.js', 'Remote dependency');
for (const lang of ['en', 'de']) {
  const manifest = JSON.parse(readFileSync(join(root, lang, 'manifest.webmanifest'), 'utf8'));
  if (manifest.start_url !== '/' + lang + '/') fail(lang + '/manifest.webmanifest', 'Wrong language start_url');
  for (const icon of manifest.icons ?? []) resource(lang + '/manifest.webmanifest', icon.src);
}
if (failures.length) {
  console.error('FAILED: ' + failures.length + ' problems\n' + failures.map(x => ' - ' + x).join('\n'));
  process.exitCode = 1;
} else {
  console.log('OK: ' + checked + ' HTML files and all active bilingual pages checked; assets are same-origin.');
  console.log('Note: Airform POST is deliberately external and requires user consent; verify live network behavior manually.');
}
