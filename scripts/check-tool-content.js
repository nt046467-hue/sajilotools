const fs = require("fs");
const path = require("path");

const registryFile = path.join(__dirname, "../src/lib/tools-registry.ts");
const contentFile = path.join(__dirname, "../src/lib/tool-content.ts");

const registryCode = fs.readFileSync(registryFile, "utf8");
const contentCode = fs.readFileSync(contentFile, "utf8");

// Extract slugs from tools-registry.ts
const slugMatches = [...registryCode.matchAll(/slug:\s*"([^"]+)"/g)];
const slugs = [...new Set(slugMatches.map((m) => m[1]))];

// Extract defined slugs in TOOL_CONTENT_MAP
const contentSlugMatches = [...contentCode.matchAll(/"([a-z0-9-]+)":\s*\{/g)];
const customSlugs = new Set(contentSlugMatches.map((m) => m[1]));

console.log("=== SajiloTools SEO Content Coverage Report ===");
let customCount = 0;
let fallbackCount = 0;

slugs.forEach((slug) => {
  if (customSlugs.has(slug)) {
    customCount++;
    console.log(`[OK] ${slug} -> Custom tool-specific content & FAQs`);
  } else {
    fallbackCount++;
    console.log(`[FALLBACK] ${slug} -> Dynamic fallback content`);
  }
});

console.log("\n--- Summary ---");
console.log(`Total Registered Tools: ${slugs.length}`);
console.log(`Custom Unique Content: ${customCount}`);
console.log(`Fallback Content: ${fallbackCount}`);
console.log(`Coverage Rate: ${((customCount / slugs.length) * 100).toFixed(1)}%`);
