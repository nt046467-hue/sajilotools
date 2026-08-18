/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SajiloTools — Comprehensive Preeti ↔ Unicode Regression Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { preetiToUnicode, unicodeToPreeti } from "../src/lib/converters/preeti-converter";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (!condition) {
    failedTests++;
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   Details: ${details}`);
    process.exitCode = 1;
  } else {
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
  }
}

console.log("==================================================");
console.log("PREETI ↔ UNICODE COMPREHENSIVE CONVERTER TEST SUITE");
console.log("==================================================\n");

// ── 1. UNICODE ➔ PREETI TESTS ─────────────────────────────────────────────────
console.log("--- 1. Unicode ➔ Preeti Conversions ---");

const unicodeToPreetiCases: [string, string][] = [
  ["नेपाल", "g]kfn"],
  ["प्रीति", "k|Llt"],
  ["नेपाली", "g]kfnL"],
  ["नेपाल प्रीति", "g]kfn k|Llt"],
  ["नमस्ते", "gd:t]"],
  ["काठमाडौं", "sf7df8f}+"],
  ["काठमाडौँ", "sf7df8f}F"],
  ["शुभकामना", "z'esfdgf"],
  ["प्रेम", "k|]d"],
  ["प्रिति", "lk|lt"],
  ["प्रति", "k|lt"],
  ["प्रतीति", "k|tLlt"],
  ["विद्यालय", "ljBfno"],
  ["विद्यार्थी", "ljBfyL{"],
  ["स्वास्थ्य", ":jf:Yo"],
  ["प्रविधि", "k|ljlw"],
  ["कार्यक्रम", "sfo{qmd"],
  ["कर्म", "sd{"],
  ["धर्म", "wd{"],
  ["वर्ष", "ji{"],
  ["क्रान्ति", "qmflGt"],
  ["भक्तपुर", "eQmk'/"],
  ["श्रीमान्", ">LdfG"],
  ["ज्ञान", "1fg"],
  ["क्षेत्र", "If]q"],
  ["उद्योग", "pBf]u"],
  ["द्वन्द्व", "åGå"],
  ["ऋषि", "Cli"],
  ["ॐ", "ç"],
  ["रु ५००", "? %))"],
  ["रूपैयाँ", "¿k}ofF"]
];

for (const [uni, expectedPreeti] of unicodeToPreetiCases) {
  const actual = unicodeToPreeti(uni);
  assert(
    actual === expectedPreeti,
    `Unicode ➔ Preeti: "${uni}"`,
    `Expected "${expectedPreeti}", got "${actual}"`
  );
}

// ── 2. PREETI ➔ UNICODE TESTS ─────────────────────────────────────────────────
console.log("\n--- 2. Preeti ➔ Unicode Conversions ---");

const preetiToUnicodeCases: [string, string][] = [
  ["sD: g]kfn k|Llt", "कम्स् नेपाल प्रीति"],
  ["g]kfn", "नेपाल"],
  ["k|Llt", "प्रीति"],
  ["g]kfnL", "नेपाली"],
  ["g]kfn k|Llt", "नेपाल प्रीति"],
  ["gd:t]", "नमस्ते"],
  ["sf7df8f}+", "काठमाडौं"],
  ["sf7df8f}F", "काठमाडौँ"],
  ["z'esfdgf", "शुभकामना"],
  ["k|]d", "प्रेम"],
  ["lk|lt", "प्रिति"],
  ["k|lt", "प्रति"],
  ["k|tLlt", "प्रतीति"],
  ["ljBfno", "विद्यालय"],
  ["ljBfyL{", "विद्यार्थी"],
  [":jf:Yo", "स्वास्थ्य"],
  ["k|ljlw", "प्रविधि"],
  ["sfo{qmd", "कार्यक्रम"],
  ["eQmk'/", "भक्तपुर"],
  [">Ldfg\\", "श्रीमान्"],
  [">LdfG", "श्रीमान्"],
  ["1fg", "ज्ञान"],
  ["If]q", "क्षेत्र"],
  ["pBf]u", "उद्योग"],
  ["åGå", "द्वन्द्व"],
  ["sfd", "काम"],
  ["k|Llt /fdf]", "प्रीति रामो"],
  ["sd{", "कर्म"],
  ["wd{", "धर्म"],
  ["Cli", "ऋषि"]
];

for (const [preeti, expectedUni] of preetiToUnicodeCases) {
  const actual = preetiToUnicode(preeti);
  assert(
    actual === expectedUni,
    `Preeti ➔ Unicode: "${preeti}"`,
    `Expected "${expectedUni}", got "${actual}"`
  );
}

// ── 3. REAL NEPALI SENTENCES ROUND-TRIP TESTS ─────────────────────────────────
console.log("\n--- 3. Full Sentences Bidirectional Round-Trip (Unicode ➔ Preeti ➔ Unicode) ---");

const realSentences = [
  "नेपाल सुन्दर देश हो।",
  "म नेपाली हुँ।",
  "तपाईंलाई कस्तो छ?",
  "नमस्ते, तपाईंलाई स्वागत छ।",
  "नेपालमा धेरै सुन्दर ठाउँहरू छन्।",
  "विद्यार्थीहरू विद्यालयमा गएर ज्ञान हासिल गर्छन्।",
  "काठमाडौँ नेपालको राजधानी सहर हो।",
  "हाम्रो देश नेपाल प्राकृतिक रूपमा धनी छ।"
];

for (const sentence of realSentences) {
  const preeti = unicodeToPreeti(sentence);
  const backToUni = preetiToUnicode(preeti);
  assert(
    backToUni === sentence,
    `Sentence Roundtrip: "${sentence}"`,
    `Unicode: "${sentence}"\n   ➔ Preeti: "${preeti}"\n   ➔ Back: "${backToUni}"`
  );
}

// ── 4. PREETI ➔ UNICODE ➔ PREETI ROUND-TRIP TESTS ─────────────────────────────
console.log("\n--- 4. Preeti ➔ Unicode ➔ Preeti Round-Trip ---");

const preetiStrings = [
  "g]kfn",
  "k|Llt",
  "g]kfnL",
  "gd:t]",
  "z'esfdgf",
  "k|]d",
  "lk|lt",
  "k|lt",
  "k|tLlt",
  "ljBfno",
  "ljBfyL{",
  ":jf:Yo",
  "k|ljlw",
  "sfo{qmd"
];

for (const p of preetiStrings) {
  const uni = preetiToUnicode(p);
  const backToPreeti = unicodeToPreeti(uni);
  assert(
    backToPreeti === p,
    `Preeti Roundtrip: "${p}"`,
    `Preeti: "${p}" ➔ Uni: "${uni}" ➔ Back: "${backToPreeti}"`
  );
}

// ── 5. EDGE CASES & SAFETY TESTS ──────────────────────────────────────────────
console.log("\n--- 5. Edge Cases & Safety Tests ---");

// Empty string
assert(unicodeToPreeti("") === "" && preetiToUnicode("") === "", "Empty input handles safely");

// Digits
assert(unicodeToPreeti("०१२३४५६७८९") === ")!@#$%^&*(", "Devanagari digits map to Preeti number keys");
assert(preetiToUnicode(")!@#$%^&*(") === "०१२३४५६७८९", "Preeti number keys map to Devanagari digits");

// Punctuation
assert(unicodeToPreeti("। , ?") === ". , <", "Unicode punctuation maps to Preeti layout");
assert(preetiToUnicode(". , <") === "। , ?", "Preeti punctuation maps to Unicode");

console.log("\n==================================================");
console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log("==================================================");
