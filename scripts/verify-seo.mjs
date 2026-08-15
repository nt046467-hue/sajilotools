#!/usr/bin/env node
// ─── SEO REGRESSION VERIFICATION SCRIPT ────────────────────────────────────
// Validates critical SEO invariants after changes.
// Run with:  node scripts/verify-seo.mjs

import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const ROOT = resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// ─── 1. Favicon: must be a valid binary ICO ──────────────────────────────────
console.log("\n🔍 Favicon Checks:");

const faviconPath = join(ROOT, "public", "favicon.ico");
assert(existsSync(faviconPath), "public/favicon.ico exists");

if (existsSync(faviconPath)) {
  const faviconBuf = readFileSync(faviconPath);
  // ICO magic bytes: 00 00 01 00
  const isBinaryIco =
    faviconBuf.length > 4 &&
    faviconBuf[0] === 0x00 &&
    faviconBuf[1] === 0x00 &&
    faviconBuf[2] === 0x01 &&
    faviconBuf[3] === 0x00;
  assert(isBinaryIco, "favicon.ico is a valid binary ICO file (magic bytes 00 00 01 00)");

  const isSvgMasquerading = faviconBuf.toString("utf8", 0, 20).includes("<svg");
  assert(!isSvgMasquerading, "favicon.ico is NOT an SVG masquerading as .ico");
}

const favicon48Path = join(ROOT, "public", "favicon-48x48.png");
assert(existsSync(favicon48Path), "public/favicon-48x48.png exists (Google requires 48px multiples)");

// ─── 2. Title Duplication: no double SajiloTools suffix ─────────────────────
console.log("\n🔍 Title Duplication Checks:");

const pagesToCheck = [
  "src/app/page.tsx",
  "src/app/tools/page.tsx",
  "src/app/tools/[category]/page.tsx",
  "src/app/tools/[category]/[slug]/page.tsx",
  "src/app/about/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/privacy-policy/page.tsx",
  "src/app/terms/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/blog/[slug]/page.tsx",
];

for (const relPath of pagesToCheck) {
  const filePath = join(ROOT, relPath);
  if (!existsSync(filePath)) continue;
  const content = readFileSync(filePath, "utf8");
  // Check for hardcoded "| SajiloTools" in title strings (except template definition and absolute title)
  // A title value like: title: "Something | SajiloTools" would produce double suffix
  const titleMatches = content.match(/title:\s*["'`][^"'`]*\|\s*SajiloTools["'`]/g) || [];
  // Filter out: title.template definitions and absolute title definitions
  const problematic = titleMatches.filter(
    (m) => !m.includes("template") && !m.includes("absolute")
  );
  assert(
    problematic.length === 0,
    `${relPath}: No hardcoded "| SajiloTools" in title values (would cause double suffix)`
  );
}

// ─── 3. Layout: verify sameAs is clean ──────────────────────────────────────
console.log("\n🔍 Layout Schema Checks:");

const layoutPath = join(ROOT, "src", "app", "layout.tsx");
if (existsSync(layoutPath)) {
  const layoutContent = readFileSync(layoutPath, "utf8");
  const hasDummySameAs =
    layoutContent.includes("github.com/sajilotools") ||
    layoutContent.includes("linkedin.com/company/sajilotools") ||
    layoutContent.includes("twitter.com/sajilotools") ||
    layoutContent.includes("facebook.com/sajilotools");
  assert(!hasDummySameAs, "layout.tsx: No unverified dummy sameAs social profile URLs");
}

// ─── 4. Sitemap and Robots: use SITE_URL ────────────────────────────────────
console.log("\n🔍 Sitemap & Robots Checks:");

const sitemapPath = join(ROOT, "src", "app", "sitemap.ts");
if (existsSync(sitemapPath)) {
  const sitemapContent = readFileSync(sitemapPath, "utf8");
  assert(
    sitemapContent.includes("SITE_URL") || sitemapContent.includes("site-config"),
    "sitemap.ts imports SITE_URL from site-config"
  );
  assert(
    !sitemapContent.includes("new Date()"),
    "sitemap.ts: No indiscriminate new Date() for lastModified (causes constant cache busting)"
  );
}

const robotsPath = join(ROOT, "src", "app", "robots.ts");
if (existsSync(robotsPath)) {
  const robotsContent = readFileSync(robotsPath, "utf8");
  assert(
    robotsContent.includes("SITE_URL") || robotsContent.includes("site-config"),
    "robots.ts imports SITE_URL from site-config"
  );
  const hasHardcodedUrl = robotsContent.includes("NEXTAUTH_URL") && !robotsContent.includes("site-config");
  assert(!hasHardcodedUrl, "robots.ts: No hardcoded NEXTAUTH_URL fallback (uses site-config)");
}

// ─── 5. Manifest.json: no stale "100+" claim ───────────────────────────────
console.log("\n🔍 Manifest Checks:");

const manifestPath = join(ROOT, "public", "manifest.json");
if (existsSync(manifestPath)) {
  const manifestContent = readFileSync(manifestPath, "utf8");
  assert(!manifestContent.includes("100+"), 'manifest.json: No stale "100+" tool count claim');
}

// ─── 6. Tools Registry: seoTitle should not contain "| SajiloTools" ─────────
console.log("\n🔍 Tools Registry Checks:");

const registryPath = join(ROOT, "src", "lib", "tools-registry.ts");
if (existsSync(registryPath)) {
  const registryContent = readFileSync(registryPath, "utf8");
  const seoTitleMatches = registryContent.match(/seoTitle:\s*["'][^"']*\|\s*SajiloTools["']/g) || [];
  assert(
    seoTitleMatches.length === 0,
    'tools-registry.ts: No seoTitle contains "| SajiloTools" (template adds it automatically)'
  );
}

// ─── 7. Translator privacy note accuracy ────────────────────────────────────
console.log("\n🔍 Translator Privacy Checks:");

const privacyPolicyPath = join(ROOT, "src", "app", "privacy-policy", "page.tsx");
if (existsSync(privacyPolicyPath)) {
  const privacyContent = readFileSync(privacyPolicyPath, "utf8");
  assert(
    !privacyContent.includes("never shared with third parties"),
    "privacy-policy/page.tsx: Does not falsely claim translation text is 'never shared with third parties'"
  );
  assert(
    privacyContent.includes("Google Translate") && privacyContent.includes("MyMemory"),
    "privacy-policy/page.tsx: Accurately discloses Google Translate and MyMemory providers"
  );
}

const translatorPath = join(ROOT, "src", "components", "tools", "NepaliTranslatorTool.tsx");
if (existsSync(translatorPath)) {
  const translatorContent = readFileSync(translatorPath, "utf8");
  assert(
    !translatorContent.includes("never shared") && !translatorContent.includes("never stored"),
    "NepaliTranslatorTool.tsx: Does not contain inaccurate 'never stored/shared' claims"
  );
}

const toolContentPath = join(ROOT, "src", "lib", "tool-content.ts");
if (existsSync(toolContentPath)) {
  const toolContent = readFileSync(toolContentPath, "utf8");
  const translatorSection = toolContent.slice(
    toolContent.indexOf('"nepali-translator"'),
    toolContent.indexOf('"nepali-date-converter"')
  );
  if (translatorSection) {
    assert(
      !translatorSection.includes("never shared") && !translatorSection.includes("never stored"),
      "tool-content.ts nepali-translator: Accurately reflects translation privacy boundaries"
    );
  }
}

const siteConfigPath = join(ROOT, "src", "lib", "site-config.ts");
if (existsSync(siteConfigPath)) {
  const siteConfigContent = readFileSync(siteConfigPath, "utf8");
  assert(
    !siteConfigContent.includes("NEXTAUTH_URL"),
    "site-config.ts: Does not include NEXTAUTH_URL in canonical SEO domain fallback"
  );
}

// ─── 8. Blog & Article Schema & Link Integrity Checks ───────────────────────
console.log("\n🔍 Blog & Guides Schema & Link Checks:");

const blogDataPath = join(ROOT, "src", "lib", "blog-data.ts");
if (existsSync(blogDataPath) && existsSync(registryPath)) {
  const blogDataContent = readFileSync(blogDataPath, "utf8");
  const registryContent = readFileSync(registryPath, "utf8");
  const blogToolMatches = [...blogDataContent.matchAll(/slug:\s*["']([a-z0-9-]+)["']/g)].map(m => m[1]);
  const invalidBlogSlugs = blogToolMatches.filter(slug => !registryContent.includes(`slug: "${slug}"`) && !blogDataContent.includes(`slug: "${slug}",\n    title:`));
  assert(
    invalidBlogSlugs.length === 0,
    `blog-data.ts: All linked tool slugs exist in tools-registry.ts (found ${invalidBlogSlugs.length} invalid: ${invalidBlogSlugs.join(", ")})`
  );
}

const blogSlugPagePath = join(ROOT, "src", "app", "blog", "[slug]", "page.tsx");
if (existsSync(blogSlugPagePath)) {
  const blogSlugContent = readFileSync(blogSlugPagePath, "utf8");
  assert(
    blogSlugContent.includes('"@type": "Article"') && blogSlugContent.includes('"@type": "BreadcrumbList"'),
    "blog/[slug]/page.tsx: Includes Article & BreadcrumbList JSON-LD structured data"
  );
}

// ─── 9. Robots & API Protection Checks ──────────────────────────────────────
console.log("\n🔍 Security & Crawl Boundary Checks:");

if (existsSync(robotsPath)) {
  const robotsContent = readFileSync(robotsPath, "utf8");
  assert(
    robotsContent.includes('"/s/"') && robotsContent.includes('"/api/"'),
    "robots.ts: Disallows /s/ and /api/ from crawler indexation"
  );
}

const contactApiPath = join(ROOT, "src", "app", "api", "contact", "route.ts");
if (existsSync(contactApiPath)) {
  const contactContent = readFileSync(contactApiPath, "utf8");
  assert(contactContent.includes("SITE_URL"), "api/contact/route.ts: Uses centralized SITE_URL");
}

const subscribeApiPath = join(ROOT, "src", "app", "api", "subscribe", "route.ts");
if (existsSync(subscribeApiPath)) {
  const subscribeContent = readFileSync(subscribeApiPath, "utf8");
  assert(subscribeContent.includes("SITE_URL"), "api/subscribe/route.ts: Uses centralized SITE_URL");
}

// ─── Summary ────────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log(`  SEO Verification: ${passed} passed, ${failed} failed`);
console.log("═".repeat(60));

if (failed > 0) {
  process.exit(1);
}
