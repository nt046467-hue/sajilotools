const fs = require("fs");
const path = require("path");

const registryPath = path.join(__dirname, "../src/lib/tools-registry.ts");
const loaderPath = path.join(__dirname, "../src/components/ToolPageClient.tsx");

const registryContent = fs.readFileSync(registryPath, "utf8");
const loaderContent = fs.readFileSync(loaderPath, "utf8");

// Extract category slugs first so we can exclude them from the tool slug list
const categorySlugs = new Set();
const catSection = registryContent.match(/CATEGORIES[\s\S]*?(?=export const TOOLS|$)/);
if (catSection) {
  const catMatches = [...catSection[0].matchAll(/slug:\s*"([^"]+)"/g)];
  catMatches.forEach((m) => categorySlugs.add(m[1]));
}

// Extract all tool slugs from tools-registry.ts (excluding category slugs)
const slugMatches = [...registryContent.matchAll(/slug:\s*"([^"]+)"/g)];
const registeredSlugs = [...new Set(slugMatches.map((m) => m[1]))].filter((s) => !categorySlugs.has(s));

// Extract all component keys from TOOL_COMPONENTS in ToolPageClient.tsx
const loaderMatches = [...loaderContent.matchAll(/"([a-z0-9-]+)":\s*(?:dynamic|loadTool)\(/g)];
const loaderSlugs = new Set(loaderMatches.map((m) => m[1]));

console.log("=== SajiloTools Tool Registry & Loader Validator ===");
console.log(`Found ${registeredSlugs.length} registered tools in tools-registry.ts`);
console.log(`Found ${loaderSlugs.size} tool component loaders in ToolPageClient.tsx\n`);

let missingCount = 0;
registeredSlugs.forEach((slug) => {
  if (!loaderSlugs.has(slug)) {
    console.error(`❌ MISSING COMPONENT LOADER: "${slug}" is registered in tools-registry.ts but missing in ToolPageClient.tsx!`);
    missingCount++;
  } else {
    console.log(`[OK] "${slug}" is correctly mapped.`);
  }
});

console.log("\n--- Validation Summary ---");
if (missingCount > 0) {
  console.error(`FAILED: ${missingCount} registered tool(s) missing component mapping in ToolPageClient.tsx!`);
  process.exit(1);
} else {
  console.log("SUCCESS: All registered tools are correctly mapped in ToolPageClient.tsx! 🚀");
  process.exit(0);
}
