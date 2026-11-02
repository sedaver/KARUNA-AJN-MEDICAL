import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, ".next", "server", "app");
const outputDir = path.join(root, "dist");

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await cp(path.join(root, ".next", "static"), path.join(outputDir, "_next", "static"), {
  recursive: true,
});
await cp(path.join(root, "public", "images"), path.join(outputDir, "images"), {
  recursive: true,
});

const pages = [
  ["index.html", "index.html"],
  ["about.html", "about/index.html"],
  ["camps.html", "camps/index.html"],
  ["gallery.html", "gallery/index.html"],
  ["contact.html", "contact/index.html"],
  ["_not-found.html", "404.html"],
];

function makeStatic(html) {
  return html
    .replace(/<link[^>]+rel="preload"[^>]+as="script"[^>]*>/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(
      /\/_next\/image\?url=%2Fimages%2F([^&"]+)&amp;w=\d+&amp;q=\d+/g,
      "/images/$1",
    )
    .replace(
      "</body>",
      '<script src="/site.js" defer></script></body>',
    );
}

for (const [sourceName, outputName] of pages) {
  const html = makeStatic(await readFile(path.join(sourceDir, sourceName), "utf8"));
  const destination = path.join(outputDir, outputName);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html, "utf8");
}

const loginHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Staff portal | KARUNA AJN medical trust</title>
<style>
:root{--teal:#087f8c;--dark:#075a63;--ice:#f6fafa;--ink:#172b3a;--line:#dce8ea;--amber:#f4a261}
*{box-sizing:border-box}body{margin:0;background:var(--ice);color:var(--ink);font-family:Arial,sans-serif;line-height:1.6}.bar{height:40px;background:var(--dark)}
header{display:flex;align-items:center;justify-content:space-between;padding:24px max(24px,calc((100vw - 1120px)/2));background:#fff;border-bottom:1px solid var(--line)}
.brand{font-weight:700}.brand small{display:block;letter-spacing:.15em;margin-top:3px}.back{color:var(--dark);font-weight:700;text-decoration:none}
main{min-height:calc(100vh - 190px);display:grid;place-items:center;padding:48px 22px}.card{width:min(580px,100%);padding:48px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 24px 70px #172b3a12}
.icon{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:var(--teal);color:#fff;font-size:30px}h1{font-size:clamp(2.2rem,6vw,3.8rem);line-height:1.05;margin:26px 0 18px}p{color:#64748b}.notice{margin-top:28px;padding:18px;border-left:4px solid var(--amber);background:#fff7f0}.button{display:inline-block;margin-top:24px;padding:13px 20px;border-radius:8px;background:var(--teal);color:#fff;text-decoration:none;font-weight:700}
footer{padding:22px;text-align:center;border-top:1px solid var(--line);color:#64748b;font-size:13px}
</style></head><body><div class="bar"></div><header><div class="brand">KARUNA AJN<small>medical trust</small></div><a class="back" href="/">Return home →</a></header>
<main><section class="card"><div class="icon">◎</div><h1>Secure staff portal</h1><p>The hosted public website is ready. Staff sign-in will be enabled after the trust’s Supabase project, approved domain, and first authorised account are configured.</p><div class="notice">No patient or clinical information is available on this public hosting preview.</div><a class="button" href="/contact/">Contact the trust</a></section></main><footer>KARUNA AJN medical trust · Privacy-first Phase 1 foundation</footer>
</body></html>`;
await mkdir(path.join(outputDir, "login"), { recursive: true });
await writeFile(path.join(outputDir, "login", "index.html"), loginHtml, "utf8");

const siteJs = `(() => {
  const button = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#public-nav');
  if (button && nav) button.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    button.innerHTML = (open ? 'Close' : 'Menu') + ' <span aria-hidden="true">☰</span>';
  });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('motion-ready');
  const selectors = ['main > section','main > .container.section > *','.hero-copy > *','.values-grid > *','.approach-journey > article','.care-photo-grid > article','.three-grid > *','.community-banner > *','.privacy-section > *','.footer-grid > *'];
  const items = [...new Set(selectors.flatMap(s => [...document.querySelectorAll(s)]))];
  items.forEach((el, i) => { el.classList.add('motion-target'); el.style.setProperty('--motion-delay', Math.min(i % 6, 5) * 70 + 'ms'); });
  const reveal = () => items.forEach(el => { if (el.getBoundingClientRect().top < innerHeight * .94) el.classList.add('is-visible'); });
  addEventListener('scroll', reveal, {passive:true}); addEventListener('resize', reveal, {passive:true}); requestAnimationFrame(reveal);
})();`;
await writeFile(path.join(outputDir, "site.js"), siteJs, "utf8");
await cp(path.join(root, ".openai"), path.join(outputDir, ".openai"), { recursive: true });

console.log(`Static hosting output written to ${outputDir}`);
