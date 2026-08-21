import { TOOLS, ToolDef } from "./tools-registry";

export interface SearchResult {
  tool: ToolDef;
  score: number;
  matchedOn: "exact" | "name" | "intent" | "tag" | "desc" | "category" | "popular";
  highlightSnippet?: string;
}

// ── HIGH-INTENT SYNONYMS & INTENT PHRASES ─────────────────────────────────────
// Comprehensive search intent mappings covering all 40+ tools across developer,
// text, pdf, image, finance, nepal, and everyday categories.
export const SEARCH_INTENTS: Record<string, string[]> = {
  // Developer Tools
  "json-formatter": [
    "json", "prettify json", "minify json", "beautify json", "validate json", "parse json",
    "json validator", "clean json", "format json", "indent json", "json tree"
  ],
  "base64-encoder": [
    "base64", "b64", "base64 encode", "base64 decode", "string to base64", "decode base64",
    "binary to string", "b64 converter", "base 64"
  ],
  "url-encoder": [
    "url encode", "url decode", "uri encode", "percent encoding", "url escape", "unescape url",
    "query param encode", "url special characters"
  ],
  "hash-generator": [
    "hash", "md5", "sha1", "sha256", "sha512", "md5 generator", "sha256 hash", "crypto hash",
    "checksum generator", "hash text", "encryption hash"
  ],
  "regex-tester": [
    "regex", "regexp", "regular expression", "regex tester", "regex debugger", "pattern match",
    "regex replace", "test regex", "javascript regex"
  ],
  "color-picker": [
    "color picker", "hex to rgb", "rgb to hex", "hsl converter", "color code", "palette",
    "eyedropper", "color converter", "css color", "hex color"
  ],
  "password-generator": [
    "password", "generate password", "strong password", "random password", "secure password",
    "pass generator", "random key", "wifi password maker", "password maker"
  ],
  "lorem-ipsum": [
    "lorem ipsum", "dummy text", "placeholder text", "sample text", "mockup text", "lorem generator",
    "filler text", "dummy paragraphs"
  ],
  "qr-generator": [
    "qr code", "generate qr", "qr maker", "wifi qr", "vcard qr", "create qr", "barcode",
    "link to qr", "qr code generator", "scan qr", "qr download"
  ],
  "timezone-converter": [
    "timezone", "time converter", "world clock", "nepal time", "utc to npt", "est to npt",
    "gmt converter", "time zone compare", "kathmandu time"
  ],
  "markdown-preview": [
    "markdown", "md preview", "markdown editor", "md to html", "live markdown", "render markdown",
    "markdown viewer"
  ],
  "link-shortener": [
    "link shortener", "short url", "tiny url", "url alias", "shorten link", "cut url", "custom link"
  ],
  "uuid-generator": [
    "uuid", "guid", "uuid v4", "generate uuid", "bulk uuid", "random uuid", "unique identifier"
  ],
  "jwt-decoder": [
    "jwt", "decode jwt", "jwt token", "json web token", "jwt claims", "jwt inspector", "parse jwt"
  ],
  "unix-timestamp-converter": [
    "unix timestamp", "epoch time", "epoch converter", "timestamp to date", "current epoch",
    "epoch to utc", "unix time"
  ],
  "css-js-minifier": [
    "minify css", "minify js", "javascript minifier", "compress css", "clean javascript",
    "code minifier", "shrink js", "uglify"
  ],
  "hmac-generator": [
    "hmac", "hmac sha256", "hmac signature", "api signature", "secret key hash", "hmac md5",
    "hmac generator"
  ],
  "random-token-generator": [
    "random token", "api key generator", "secret token", "hex token", "auth token", "generate token",
    "cryptographic key"
  ],
  "file-checksum-verifier": [
    "checksum", "file hash", "sha256 file", "md5 file", "verify file integrity", "file checksum",
    "hash file check"
  ],

  // Text Tools
  "word-counter": [
    "word count", "character count", "count letters", "sentence counter", "paragraph counter",
    "reading time", "word length", "text stats"
  ],
  "case-converter": [
    "case converter", "uppercase", "lowercase", "title case", "camelcase", "snake_case",
    "kebab-case", "capitalize text", "capital letters"
  ],
  "text-diff": [
    "text diff", "diff checker", "compare text", "text comparison", "check changes", "difference checker",
    "compare two files"
  ],
  "string-utilities": [
    "string utilities", "reverse text", "trim spaces", "slugify text", "strip whitespace",
    "text cleanup", "string reverse"
  ],

  // PDF Tools
  "pdf-merger": [
    "merge pdf", "combine pdf", "join pdf", "unite pdfs", "merge multiple pdfs", "pdf joiner",
    "merge documents"
  ],
  "pdf-splitter": [
    "split pdf", "extract pdf pages", "separate pdf", "cut pdf", "pdf separator", "remove pdf pages",
    "divide pdf"
  ],
  "pdf-to-word": [
    "pdf to word", "pdf to docx", "convert pdf to editable word", "pdf word converter", "pdf doc",
    "edit pdf text"
  ],
  "pdf-organizer": [
    "reorder pdf", "rotate pdf pages", "delete pdf pages", "organize pdf", "rearrange pdf",
    "rotate pdf", "pdf pages order"
  ],
  "pdf-watermark": [
    "watermark pdf", "add watermark to pdf", "pdf stamp", "confidential watermark", "logo watermark pdf"
  ],
  "jpg-pdf-converter": [
    "jpg to pdf", "image to pdf", "png to pdf", "pdf to jpg", "pdf to image", "convert photo to pdf",
    "photos to pdf"
  ],
  "pdf-compressor": [
    "compress pdf", "shrink pdf", "reduce pdf size", "pdf size reducer", "make pdf smaller",
    "pdf optimizer", "compress pdf mb to kb", "small pdf"
  ],

  // Image Tools
  "image-compressor": [
    "compress image", "reduce photo size", "shrink png", "shrink jpg", "image size reducer",
    "optimize image", "compress photo mb to kb", "make photo smaller"
  ],
  "image-resizer": [
    "resize image", "resize photo", "scale image", "change photo resolution", "image dimensions",
    "resize width height", "pixel resizer"
  ],
  "image-cropper": [
    "crop image", "crop photo", "cut image", "aspect ratio crop", "16:9 crop", "1:1 square crop",
    "photo trimmer"
  ],
  "image-converter": [
    "convert image", "png to jpg", "jpg to png", "webp to png", "png to webp", "image format converter",
    "heic to jpg", "bmp converter"
  ],
  "image-to-base64": [
    "image to base64", "photo to datauri", "image data uri", "img base64 html", "convert image to text"
  ],
  "background-remover": [
    "remove background", "bg remover", "transparent background", "cutout photo", "ai background remover",
    "remove bg", "erase background", "make transparent"
  ],
  "favicon-generator": [
    "favicon generator", "create favicon", "ico generator", "apple touch icon", "website icon",
    "favicon ico", "app icon"
  ],
  "image-watermark": [
    "watermark photo", "watermark image", "add logo to photo", "protect image", "text on photo"
  ],
  "image-rotate-flip": [
    "rotate image", "flip photo", "mirror image", "rotate 90 degrees", "upside down photo",
    "horizontal flip"
  ],

  // Finance Tools
  "nrs-converter": [
    "nrs converter", "currency converter", "nepali rupee exchange rate", "nrb forex rate",
    "dollar to nrs", "nrs to usd", "inr to nrs", "aud to nrs", "forex nepal"
  ],
  "emi-calculator": [
    "emi calculator", "loan calculator", "home loan emi", "car loan emi", "monthly installment",
    "bank interest calculation", "loan interest schedule"
  ],
  "tax-calculator": [
    "income tax nepal", "salary tax calculator", "tds calculator nepal", "nepal tax slabs",
    "salary deductions", "tax on salary", "income tax calculation"
  ],
  "interest-calculator": [
    "interest calculator", "simple interest", "compound interest", "loan return", "interest rate calculator",
    "interest formula"
  ],
  "pf-calculator": [
    "provident fund", "epf calculator", "cit nepal", "ssf calculator", "retirement fund",
    "gratuity calculator", "citizens investment trust"
  ],
  "gold-silver-calculator": [
    "gold price nepal", "silver price nepal", "tola calculator", "gold tola to gram", "lal calculator",
    "daily gold rate", "sun ko vau", "chandi price"
  ],
  "sip-calculator": [
    "sip calculator", "mutual fund return", "monthly investment sip", "compounding investment",
    "wealth calculator", "share market investment"
  ],
  "fd-calculator": [
    "fixed deposit calculator", "fd interest nepal", "bank fd return", "fixed deposit with tax",
    "fixed deposit maturity"
  ],
  "vat-calculator": [
    "vat calculator", "13% vat", "nepal vat calculation", "add vat", "remove vat", "pan vat bill",
    "value added tax", "calculate 13 percent"
  ],

  // Nepal Specific Tools
  "land-converter": [
    "land converter", "ropani aana paisa daam", "bigha kattha dhur", "nepal land measurement",
    "square feet to ropani", "aana to sq feet", "jagga converter"
  ],
  "nepali-translator": [
    "nepali translator", "english to nepali", "nepali to english", "translate nepali",
    "nepali dictionary", "anuvad", "translate devanagari"
  ],
  "nepali-date-converter": [
    "nepali date converter", "bs to ad", "ad to bs", "bikram sambat converter", "miti converter",
    "today nepali date", "nepali age calculator", "patro date", "nepali birthday"
  ],
  "nepali-unicode": [
    "nepali unicode", "romanized nepali typing", "preeti to unicode", "nepali typing tool",
    "type in nepali", "devanagari font typing", "roman nepali"
  ],
  "nepali-number-words": [
    "number to words", "nepali number in words", "lakh crore converter", "cheque number to words",
    "amount in words nepali", "rupees in words", "bank cheque writer"
  ],
  "nepali-calendar": [
    "nepali calendar", "bikram sambat calendar", "nepali patro", "nepali holidays",
    "nepali festivals", "saturday holiday", "bs calendar"
  ],
  "traditional-unit-converter": [
    "traditional nepali units", "dharni to kg", "mana pathi muri", "tola pau seer",
    "nepali weight converter", "dharni converter", "traditional grain converter"
  ],
  "vehicle-tax-calculator": [
    "vehicle tax nepal", "bluebook tax calculator", "bike tax nepal", "car tax renewal",
    "bagmati province vehicle tax", "blue book renewal", "motorcycle tax"
  ],
  "ward-municipality-lookup": [
    "ward lookup", "municipality search", "gaupalika", "nagarpalika wards", "local government nepal",
    "753 local levels", "nepal ward number", "district wards"
  ],

  // Everyday Tools
  "unit-converter": [
    "unit converter", "length converter", "weight converter", "kg to lbs", "celsius to fahrenheit",
    "meter to feet", "speed converter", "temperature converter"
  ],
  "percentage-calculator": [
    "percentage calculator", "percent change", "percentage increase", "calculate %", "fraction to percent",
    "percentage of number"
  ],
  "gpa-percentage-converter": [
    "gpa to percentage", "neb gpa converter", "see gpa", "percentage to gpa", "grade point average nepal",
    "marks to gpa", "tu gpa"
  ],
  "bmi-calculator": [
    "bmi calculator", "body mass index", "healthy weight check", "bmi chart", "ideal weight calculator",
    "overweight check"
  ],
  "discount-calculator": [
    "discount calculator", "sale price calculator", "markup calculator", "percentage off",
    "price after discount", "clearance sale"
  ],
  "bmr-calculator": [
    "bmr calculator", "tdee calculator", "daily calorie burn", "basal metabolic rate",
    "metabolism calculator", "calories burned"
  ],
  "calorie-calculator": [
    "calorie calculator", "macro calculator", "weight loss calories", "protein carbs fats target",
    "daily calorie intake", "diet macros"
  ],
  "age-calculator": [
    "age calculator", "calculate exact age", "birthday countdown", "how old am i",
    "days alive calculator", "age in months days"
  ],
};

// Popular search recommendation keywords for empty/quick discovery
export const POPULAR_SEARCH_CHIPS = [
  { label: "PDF Compressor", query: "compress pdf", icon: "FileText" },
  { label: "Nepali Date", query: "nepali date", icon: "Calendar" },
  { label: "13% VAT", query: "vat calculator", icon: "Receipt" },
  { label: "QR Generator", query: "qr generator", icon: "QrCode" },
  { label: "Image Compressor", query: "image compressor", icon: "Image" },
  { label: "Salary Tax", query: "tax calculator", icon: "Calculator" },
  { label: "Unicode Typing", query: "nepali unicode", icon: "Keyboard" },
  { label: "Land Unit", query: "land converter", icon: "Ruler" },
];

/**
 * Normalizes strings by removing extra spaces and special punctuation for fuzzy matching
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\d.-]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Main Unified Search Ranking Engine
 */
export function searchTools(query: string, limit = 8): SearchResult[] {
  const q = normalize(query);
  if (!q) {
    // Return curated popular & featured tools when query is empty
    return TOOLS.filter((t) => t.featured || ["Popular", "New", "Nepal"].includes(t.badge))
      .slice(0, limit)
      .map((tool) => ({
        tool,
        score: 10,
        matchedOn: "popular",
      }));
  }

  const queryWords = q.split(" ").filter(Boolean);
  const results: SearchResult[] = [];

  for (const tool of TOOLS) {
    let score = 0;
    let matchedOn: SearchResult["matchedOn"] = "popular";

    const nameNorm = normalize(tool.name);
    const slugNorm = normalize(tool.slug.replace(/-/g, " "));
    const descNorm = normalize(tool.desc);
    const catNorm = normalize(tool.category);
    const seoTitleNorm = normalize(tool.seoTitle || "");
    const seoDescNorm = normalize(tool.seoDescription || "");
    const synonyms = SEARCH_INTENTS[tool.slug] || [];

    // 1. Exact Name Match (Score: 120)
    if (nameNorm === q || slugNorm === q) {
      score += 120;
      matchedOn = "exact";
    }
    // 2. Name Starts With Query (Score: 90)
    else if (nameNorm.startsWith(q) || slugNorm.startsWith(q)) {
      score += 90;
      matchedOn = "name";
    }
    // 3. Name Contains Full Query (Score: 70)
    else if (nameNorm.includes(q) || slugNorm.includes(q)) {
      score += 70;
      matchedOn = "name";
    }

    // 4. Intent & Synonym Matching
    let maxSynonymScore = 0;
    for (const syn of synonyms) {
      const synNorm = normalize(syn);
      if (synNorm === q) {
        maxSynonymScore = Math.max(maxSynonymScore, 85);
      } else if (synNorm.startsWith(q)) {
        maxSynonymScore = Math.max(maxSynonymScore, 65);
      } else if (synNorm.includes(q) || q.includes(synNorm)) {
        maxSynonymScore = Math.max(maxSynonymScore, 50);
      } else {
        // Multi-word partial synonym match
        const synWords = synNorm.split(" ");
        const matchedWordsCount = queryWords.filter((w) =>
          synWords.some((sw) => sw.includes(w) || w.includes(sw))
        ).length;
        if (matchedWordsCount > 0) {
          maxSynonymScore = Math.max(
            maxSynonymScore,
            25 + (matchedWordsCount / queryWords.length) * 20
          );
        }
      }
    }

    if (maxSynonymScore > 0) {
      score += maxSynonymScore;
      if (matchedOn === "popular") matchedOn = "intent";
    }

    // 5. Individual Query Words in Tool Name
    const nameWords = nameNorm.split(" ");
    let nameWordsMatchCount = 0;
    for (const qw of queryWords) {
      if (nameWords.some((nw) => nw.includes(qw) || qw.includes(nw))) {
        nameWordsMatchCount++;
      }
    }
    if (nameWordsMatchCount > 0) {
      score += (nameWordsMatchCount / queryWords.length) * 45;
      if (matchedOn === "popular") matchedOn = "name";
    }

    // 6. Description / SEO Text Match
    if (descNorm.includes(q) || seoTitleNorm.includes(q) || seoDescNorm.includes(q)) {
      score += 25;
      if (matchedOn === "popular") matchedOn = "desc";
    } else {
      const descWordsMatch = queryWords.filter((w) => descNorm.includes(w)).length;
      if (descWordsMatch > 0) {
        score += (descWordsMatch / queryWords.length) * 15;
        if (matchedOn === "popular") matchedOn = "desc";
      }
    }

    // 7. Category Match
    if (catNorm.includes(q)) {
      score += 20;
      if (matchedOn === "popular") matchedOn = "category";
    }

    // 8. Popularity / Featured / Badge Boost
    if (tool.featured) score += 4;
    if (tool.trending) score += 3;
    if (tool.badge === "Popular") score += 3;
    if (tool.badge === "New") score += 2;

    // 9. Nepal context boost
    if (
      (q.includes("nepal") || q.includes("nrs") || q.includes("bs") || q.includes("miti")) &&
      tool.categorySlug === "nepal"
    ) {
      score += 15;
    }

    // Filter threshold
    if (score > 15) {
      results.push({
        tool,
        score,
        matchedOn,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Returns suggestions for empty search state
 */
export function getPopularSuggestions(limit = 6): ToolDef[] {
  return TOOLS.filter((t) => t.featured || t.badge === "Popular" || t.badge === "Nepal").slice(0, limit);
}
