import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "dist", "public");

const DOMAIN = "https://fincalc.net";

const pages = [
  { suffix: "",               priority: "1.0", changefreq: "weekly" },
  { suffix: "/installment",   priority: "0.9", changefreq: "monthly" },
  { suffix: "/average-price", priority: "0.9", changefreq: "monthly" },
  { suffix: "/privacy",       priority: "0.4", changefreq: "yearly" },
  { suffix: "/contact",       priority: "0.3", changefreq: "yearly" },
];

const today = new Date().toISOString().split("T")[0];

const urlEntries = pages
  .map(({ suffix, priority, changefreq }) => {
    const koUrl = `${DOMAIN}/ko${suffix}`;
    const enUrl = `${DOMAIN}/en${suffix}`;
    return `  <url>
    <loc>${koUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${koUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${koUrl}" />
  </url>
  <url>
    <loc>${enUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ko" href="${koUrl}" />
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${koUrl}" />
  </url>`;
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries}
</urlset>
`;

// Root redirect — serves when user hits / directly
const rootRedirect = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0;url=/ko" />
    <link rel="canonical" href="${DOMAIN}/ko" />
    <title>FinCalc – 금융 계산기</title>
    <script>window.location.replace("/ko");</script>
  </head>
  <body>
    <noscript><a href="/ko">복리 계산기 바로가기</a></noscript>
  </body>
</html>
`;

// Copy src HTML to dest as index.html so trailing-slash URLs work.
// Static file servers redirect /ko → /ko/ and then look for ko/index.html.
// Without these copies, those requests would 404.
function copyAsIndex(srcFile, destDir) {
  mkdirSync(destDir, { recursive: true });
  const html = readFileSync(srcFile, "utf-8");
  writeFileSync(join(destDir, "index.html"), html, "utf-8");
}

try {
  mkdirSync(outDir, { recursive: true });

  // Sitemap
  writeFileSync(join(outDir, "sitemap.xml"), sitemap, "utf-8");
  console.log(`✓ sitemap.xml written`);

  // Root redirect
  writeFileSync(join(outDir, "index.html"), rootRedirect, "utf-8");
  console.log(`✓ index.html (root redirect → /ko) written`);

  // Create index.html copies for every route so /ko/, /ko/installment/ etc. work.
  // The Replit static server redirects extension-less paths to trailing-slash
  // when a same-named directory exists; providing index.html inside each dir
  // prevents 404s and eliminates the need for a catch-all rewrite rule.
  const routes = [
    // top-level locale pages: ko.html  → ko/index.html
    { src: join(outDir, "ko.html"),               dest: join(outDir, "ko") },
    { src: join(outDir, "en.html"),               dest: join(outDir, "en") },
    // sub-pages already live inside ko/ and en/ directories
    { src: join(outDir, "ko", "installment.html"),   dest: join(outDir, "ko", "installment") },
    { src: join(outDir, "en", "installment.html"),   dest: join(outDir, "en", "installment") },
    { src: join(outDir, "ko", "average-price.html"), dest: join(outDir, "ko", "average-price") },
    { src: join(outDir, "en", "average-price.html"), dest: join(outDir, "en", "average-price") },
    { src: join(outDir, "ko", "privacy.html"),       dest: join(outDir, "ko", "privacy") },
    { src: join(outDir, "en", "privacy.html"),       dest: join(outDir, "en", "privacy") },
    { src: join(outDir, "ko", "contact.html"),       dest: join(outDir, "ko", "contact") },
    { src: join(outDir, "en", "contact.html"),       dest: join(outDir, "en", "contact") },
  ];

  for (const { src, dest } of routes) {
    copyAsIndex(src, dest);
    console.log(`✓ ${dest.replace(outDir, "")}/index.html written`);
  }
} catch (err) {
  console.error("Failed to write output files:", err);
  process.exit(1);
}
