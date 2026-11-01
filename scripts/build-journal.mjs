#!/usr/bin/env node
/* Manual static journal builder; no npm dependencies or GitHub Actions. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const {posts,sampleMode}=JSON.parse(readFileSync(join(root,'content/journal.json'),'utf8'));
const word={"en":{"home":"Home","services":"Services","technology":"Development","blog":"Journal","contact":"Contact","about":"About","legal":"Legal notice","privacy":"Privacy policy","skip":"Skip to main content","menu":"Open navigation menu","eyebrow":"FIELD NOTES / SOFTWARE & SYSTEMS","title":"Engineering journal","intro":"Engineering notes on hardware experiments, robotics software, interfaces and systems integration.","read":"Read project note","notice":"Illustrative sample content and diagrams — not completed project claims.","latest":"LATEST NOTES","projects":"Projects & experiments","all":"View all notes","back":"Back to journal","related":"More engineering notes","company":"Company","info":"Information","tagline":"Smarter Software for Smarter Systems."},"de":{"home":"Startseite","services":"Leistungen","technology":"Technologien","blog":"Journal","contact":"Kontakt","about":"Über mich","legal":"Impressum","privacy":"Datenschutz","skip":"Zum Inhalt springen","menu":"Menü öffnen","eyebrow":"WERKSTATTNOTIZEN / SOFTWARE & SYSTEME","title":"Engineering-Journal","intro":"Technische Notizen zu Hardware-Experimenten, Robotiksoftware, HMIs und Systemintegration.","read":"Projektbeitrag lesen","notice":"Fiktive Beispielbeiträge und Illustrationen – keine realisierten Projektberichte.","latest":"AKTUELLE BEITRÄGE","projects":"Projekte & Experimente","all":"Alle Beiträge ansehen","back":"Zurück zum Journal","related":"Weitere Engineering-Beiträge","company":"Unternehmen","info":"Informationen","tagline":"Intelligente Software für intelligente Systeme."}};
function esc(t){return String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function card(p,l){
 const t=p[l],w=word[l],url=`/${l}/blog/${p.slug}/`;
 return `<article class="rse-journal-card rse-reveal"><a href="${url}" aria-label="${esc(t.title)}"><img loading="lazy" decoding="async" src="${esc(p.image)}" alt="${esc(t.imageAlt)}" width="960" height="600"></a><div class="rse-journal-card-body"><span class="rse-journal-category">${esc(t.category)}</span><h3><a href="${url}">${esc(t.title)}</a></h3><p>${esc(t.description)}</p><a href="${url}" class="rse-journal-link">${esc(w.read)} <span aria-hidden="true">↗</span></a></div></article>`;
}

function page(l,slug,title,description,body,image,mode){
 const w=word[l],o=l==="en"?"de":"en",r=`/${l}/blog/${slug?slug+"/":""}`,alt=`/${o}/blog/${slug?slug+"/":""}`,origin="https://rothsoftware.com",nav=[[w.home,`/${l}/`],[w.services,`/${l}/services/`],[w.technology,`/${l}/technology/`],[w.blog,`/${l}/blog/`],[w.contact,`/${l}/contact/`]];
 const navHtml=nav.map(([label,u])=>`<li class="nav-item"><a class="nav-link" href="${u}"${u===`/${l}/blog/`?' aria-current="page"':''}>${esc(label)}</a></li>`).join("");
 return `<!doctype html><html lang="${l==="de"?"de-AT":"en-US"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Roth Software Engineering</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${mode?"noindex,follow":"index,follow"}"><meta name="author" content="ROTH Software Engineering e. U."><link rel="canonical" href="${origin+r}"><link rel="alternate" hreflang="en" href="${origin+(l==="en"?r:alt)}"><link rel="alternate" hreflang="de" href="${origin+(l==="de"?r:alt)}"><link rel="alternate" hreflang="x-default" href="${origin+(l==="en"?r:alt)}"><meta property="og:type" content="article"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${origin+r}"><meta property="og:image" content="${origin+(image||"/images/rse-logo-02.svg")}"><meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light"><link rel="stylesheet" href="/css/fonts.css"><link rel="stylesheet" href="/css/fontawesome.min.04e2e5bb347710a4a503d9faf657313f8876c252a713f76a15479a5baa749e67.css"><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/design.css"><link rel="icon" href="/images/rse-favicon-01_hu_45d2dd63ef672a4c.png"><link rel="manifest" href="/${l}/manifest.webmanifest"><link rel="alternate" type="application/rss+xml" href="/${l}/blog/index.xml" title="Engineering Journal"></head>
<body class="rse-theme"><a class="skip-link" href="#main">${esc(w.skip)}</a><header class="navigation"><div class="container"><nav class="navbar navbar-expand-lg navbar-light bg-transparent"><a class="navbar-brand" href="/${l}/"><img class="img" src="/images/rse-logo-02.svg" alt="ROTH Software" width="180" height="60"></a><button class="navbar-toggler border-0" type="button" aria-label="${esc(w.menu)}" aria-expanded="false"><i class="fa-solid fa-bars" aria-hidden="true"></i></button><div class="collapse navbar-collapse justify-content-end"><ul class="navbar-nav ml-auto">${navHtml}<li class="nav-item"><a class="nav-link" href="${alt}" lang="${o}" hreflang="${o}" aria-label="${o==="de"?"Auf Deutsch anzeigen":"View in English"}">${o.toUpperCase()}</a></li></ul></div></nav></div></header>
${body}
<footer class="bg-light section pb-0"><div class="container"><div class="row justify-content-center"><div class="col-xl-11"><div class="section pt-0"><div class="row gy-4"><div class="col-lg-3 col-sm-6"><div class="h5 mb-4">${esc(w.company)}</div><ul class="list-unstyled footer-list"><li><a href="/${l}/about/">${esc(w.about)}</a></li><li><a href="/${l}/legal-notice/">${esc(w.legal)}</a></li></ul></div><div class="col-lg-3 col-sm-6"><div class="h5 mb-4">${esc(w.info)}</div><ul class="list-unstyled footer-list"><li><a href="/${l}/privacy-policy/">${esc(w.privacy)}</a></li><li><a href="/${l}/blog/">${esc(w.blog)}</a></li></ul></div><div class="col-lg-3 col-sm-6"></div><div class="col-lg-3 col-sm-6"><a class="d-block h5 mb-3" href="/${l}/"><img class="img" src="/images/rse-logo-02.svg" alt="ROTH Software" width="180" height="60"></a><p>${esc(w.tagline)}</p></div></div></div><div class="border-top border-default text-center py-4"><small class="content">© ROTH Software Engineering e. U.</small></div></div></div></div></footer><script defer src="/js/design.js"></script></body></html>`;
}

function archive(ps,l,mode){
 const w=word[l],main=`<main id="main"><section class="rse-journal-hero"><div class="rse-wrap"><p class="rse-eyebrow">${esc(w.eyebrow)}</p><h1 class="rse-heading">${esc(w.title)}</h1><p class="rse-journal-intro">${esc(w.intro)}</p>${mode?`<p class="rse-journal-notice">${esc(w.notice)}</p>`:""}</div></section><section class="rse-section rse-section--dark"><div class="rse-wrap"><div class="rse-journal-headrow"><div><p class="rse-eyebrow">${esc(w.latest)}</p><h2 class="rse-heading">${esc(w.projects)}</h2></div><a class="rse-btn rse-btn--ghost" href="/${l}/">${esc(w.home)} ↗</a></div><div class="rse-journal-grid">${ps.map(p=>card(p,l)).join("")}</div></div></section></main>`;
 return page(l,"",w.title,w.intro,main,ps[0]?.image,mode);
}

function article(p,ps,l,mode){
 const t=p[l],w=word[l];
 const body=`<main id="main" class="rse-journal-article"><article><header class="rse-article-top"><div class="rse-article-narrow"><a class="rse-article-back" href="/${l}/blog/">← ${esc(w.back)}</a><p class="rse-journal-category">${esc(t.category)}</p><h1>${esc(t.title)}</h1><p class="rse-article-intro">${esc(t.description)}</p><div class="rse-article-details">${p.tags.map(tag=>`<span>${esc(tag)}</span>`).join("")}</div><figure><img class="rse-article-image" src="${esc(p.image)}" alt="${esc(t.imageAlt)}" width="960" height="600"><figcaption class="rse-article-figcaption">${esc(t.imageCaption)}</figcaption></figure></div></header><div class="rse-article-content"><div class="rse-article-narrow">${mode?`<p class="rse-journal-notice">${esc(w.notice)}</p>`:""}${t.sections.map(s=>`<section><h2>${esc(s.heading)}</h2><p>${esc(s.text)}</p></section>`).join("")}</div></div></article><section class="rse-article-more"><div class="rse-wrap"><h2 class="rse-heading">${esc(w.related)}</h2><div class="rse-journal-grid">${ps.filter(x=>x.slug!==p.slug).map(x=>card(x,l)).join("")}</div></div></section></main>`;
 return page(l,p.slug,t.title,t.description,body,p.image,mode);
}

function teaser(ps,l,mode){
 const w=word[l];
 return `<!-- RSE JOURNAL START --><section class="rse-section rse-section--dark" id="journal" aria-labelledby="rse-journal-home-title"><div class="rse-wrap"><div class="rse-journal-headrow rse-reveal"><div><p class="rse-eyebrow">${esc(w.latest)}</p><h2 class="rse-heading" id="rse-journal-home-title">${esc(w.projects)}</h2><p class="rse-lede">${esc(w.intro)}</p></div></div><div class="rse-journal-grid">${ps.slice(0,3).map(p=>card(p,l)).join("")}</div>${mode?`<p class="rse-journal-note" style="margin-top:21px">${esc(w.notice)}</p>`:""}<div class="rse-journal-footer"><a class="rse-btn rse-btn--ghost" href="/${l}/blog/">${esc(w.all)} <span aria-hidden="true">↗</span></a></div></div></section><!-- RSE JOURNAL END -->`;
}

function rss(ps,l,mode){
 const x=v=>esc(v).replaceAll("&#39;","&apos;"),u=`https://rothsoftware.com/${l}/blog/`;
 return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>ROTH Software — ${x(word[l].title)}</title><link>${u}</link><description>${x(word[l].intro)}</description><language>${l==="de"?"de-AT":"en"}</language>${ps.map(p=>`<item><title>${x(p[l].title)}${mode?" (sample)":""}</title><link>${u+p.slug}/</link><guid isPermaLink="true">${u+p.slug}/</guid><description>${x(p[l].description)}${mode?" — "+x(word[l].notice):""}</description></item>`).join("")}</channel></rss>\n`;
}
const known=new Set();
for(const p of posts){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||known.has(p.slug))throw Error('Invalid/duplicate post slug: '+p.slug);
 known.add(p.slug);
 if(!/^\/images\/journal\/[\w.-]+\.(?:svg|png|webp|jpg|jpeg)$/i.test(p.image)||!existsSync(join(root,p.image.slice(1))))throw Error('Missing local image: '+p.image);
 for(const lang of ['en','de'])if(!p[lang]?.title||!p[lang]?.description||!p[lang]?.imageAlt||!p[lang]?.sections?.length)throw Error('Missing translation: '+p.slug+' '+lang);
}
const write=(rel,t)=>{const filename=join(root,rel);mkdirSync(dirname(filename),{recursive:true});writeFileSync(filename,t,'utf8')};
for(const lang of ['en','de']){
 write(lang+'/blog/index.html',archive(posts,lang,sampleMode));
 write(lang+'/blog/index.xml',rss(posts,lang,sampleMode));
 for(const p of posts)write(lang+'/blog/'+p.slug+'/index.html',article(p,posts,lang,sampleMode));
 const current=readFileSync(join(root,lang,'index.html'),'utf8'),pattern=/<!-- RSE JOURNAL START -->[\s\S]*?<!-- RSE JOURNAL END -->/;
 if(!pattern.test(current))throw Error('Missing journal markers in '+lang+'/index.html');
 write(lang+'/index.html',current.replace(pattern,teaser(posts,lang,sampleMode)));
}
console.log('Generated journal in EN and DE ('+posts.length+' entries each).');
