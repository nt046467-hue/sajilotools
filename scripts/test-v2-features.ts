import {
  nepaliDigitsToArabic,
  arabicDigitsToNepali,
  normalizeNumericInput,
  formatNepaliComma,
  formatNepaliDigitsComma,
} from "../src/lib/nepali-number-utils";
import {
  numberToNepaliWords,
  nepaliWordsToNumber,
  numberToEnglishWords,
} from "../src/lib/nepali-number-parser";
import {
  getDaysInBsMonth,
  isValidBsDate,
  bsToAdDate,
  adToBsDate,
} from "../src/lib/bs-date-utils";
import {
  calculateAge,
} from "../src/lib/age-calculator";

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

console.log("==========================================");
console.log("RUNNING V2 NEPALI NUMBER TESTS");
console.log("==========================================");

// 1. Devanagari digit conversion
assert(nepaliDigitsToArabic("१२३४५") === "12345", "Devanagari to Arabic: १२३४५ -> 12345");
assert(arabicDigitsToNepali("12345") === "१२३४५", "Arabic to Devanagari: 12345 -> १२३४५");
assert(normalizeNumericInput(" १२,३४५.५० ") === "12345.50", "Normalize numeric input with commas and spaces");
assert(formatNepaliComma("145000") === "1,45,000", "Nepali comma formatting: 145000 -> 1,45,000");
assert(formatNepaliDigitsComma("145000") === "१,४५,०००", "Nepali digits comma formatting: 145000 -> १,४५,०००");

// 2. Mandatory PRD Number List & Round-trip test
const TEST_NUMBERS = [
  0, 1, 9, 10, 19, 20, 21, 99, 100, 101, 999, 1000, 1001,
  9999, 10000, 99999, 100000, 100001, 999999, 1000000,
  9999999, 10000000, 10000001, 99999999, 100000000, 1000000000, 1234567890
];

console.log("\nTesting Round-trip: Number -> Words -> Number...");
for (const n of TEST_NUMBERS) {
  const words = numberToNepaliWords(n);
  const parsed = nepaliWordsToNumber(words);
  const ok = parsed.success && parsed.value === n;
  assert(ok, `Roundtrip ${n}: "${words}" -> ${parsed.value}`);
  if (!ok) {
    console.error(`    Mismatch detail: input=${n}, words=${words}, parsed=${parsed.value}, error=${parsed.error}`);
  }
}

// 3. User PRD specific examples:
console.log("\nTesting PRD specific examples...");
const ex1 = numberToNepaliWords(45678);
assert(ex1.includes("पैंतालीस हजार छ सय अठहत्तर"), `45678 -> ${ex1}`);

const ex2Words = "पैंतालीस हजार छ सय अठहत्तर";
const ex2Parsed = nepaliWordsToNumber(ex2Words);
assert(ex2Parsed.success && ex2Parsed.value === 45678, `Words to number: "${ex2Words}" -> 45,678`);
assert(ex2Parsed.formattedArabic === "45,678", `Formatted Arabic: 45,678`);
assert(ex2Parsed.formattedNepali === "४५,६७८", `Formatted Nepali: ४५,६७८`);

const exCurrencyWords = "रु पैंतालीस हजार छ सय अठहत्तर मात्र";
const exCurrencyParsed = nepaliWordsToNumber(exCurrencyWords);
assert(exCurrencyParsed.success && exCurrencyParsed.value === 45678, `Currency parsing with रु and मात्र`);

const ex3 = numberToNepaliWords(145000);
assert(ex3.includes("एक लाख पैंतालीस हजार"), `145000 -> ${ex3}`);

const exDecimal = numberToNepaliWords(1250.5, { currency: true });
assert(exDecimal.includes("एक हजार दुई सय पचास रुपैयाँ पचास पैसा मात्र"), `1250.5 currency -> ${exDecimal}`);

const exDecWords = "एक हजार दुई सय पचास रुपैयाँ पचास पैसा मात्र";
const exDecParsed = nepaliWordsToNumber(exDecWords);
assert(exDecParsed.success && exDecParsed.value === 1250.5, `Words to decimal currency: "${exDecWords}" -> 1250.50`);

// 4. Romanized Nepali & English input parsing
const testPaitalis = nepaliWordsToNumber("paitalis");
assert(testPaitalis.success && testPaitalis.value === 45, `Romanized single numeral: "paitalis" -> 45`);

const testPaitalisBla = nepaliWordsToNumber("paitalis bla bla ???");
assert(testPaitalisBla.success && testPaitalisBla.value === 45, `Romanized with casual trailing filler: "paitalis bla bla ???" -> 45`);

const testPaitalisHajar = nepaliWordsToNumber("paitalis hajar chha saya athahattar");
assert(testPaitalisHajar.success && testPaitalisHajar.value === 45678, `Romanized full compound: "paitalis hajar chha saya athahattar" -> 45,678`);

const testEkLakh = nepaliWordsToNumber("ek lakh");
assert(testEkLakh.success && testEkLakh.value === 100000, `Romanized scale: "ek lakh" -> 100,000`);

const testArsathi = nepaliWordsToNumber("arsathi");
assert(testArsathi.success && testArsathi.value === 68, `Romanized "arsathi" -> 68`);

const testArsath = nepaliWordsToNumber("arsath");
assert(testArsath.success && testArsath.value === 68, `Romanized "arsath" -> 68`);

const testAdasatthi = nepaliWordsToNumber("अडसठ्ठी");
assert(testAdasatthi.success && testAdasatthi.value === 68, `Devanagari colloquial "अडसठ्ठी" -> 68`);

const testArsathiCurrencyOff = nepaliWordsToNumber("arsathi", { currency: false });
assert(testArsathiCurrencyOff.success && testArsathiCurrencyOff.value === 68, `Currency OFF: value === 68`);
assert(testArsathiCurrencyOff.chequeFormat === undefined, `Currency OFF: chequeFormat is undefined`);
assert(testArsathiCurrencyOff.nepaliWords === "अठसठ्ठी", `Currency OFF: nepaliWords === "अठसठ्ठी" without रुपैयाँ`);

const testArsathiCurrencyOn = nepaliWordsToNumber("arsathi", { currency: true });
assert(testArsathiCurrencyOn.success && testArsathiCurrencyOn.chequeFormat !== undefined, `Currency ON: chequeFormat exists`);
assert(Boolean(testArsathiCurrencyOn.nepaliWords?.includes("रुपैयाँ मात्र")), `Currency ON: nepaliWords contains रुपैयाँ मात्र`);

// 5. Smart Typo suggestions (Did You Mean)
const typoPaitlis = nepaliWordsToNumber("paitlis");
assert(!typoPaitlis.success, "Typo 'paitlis' is caught as error");
assert(typoPaitlis.didYouMean === "paitalis", `Typo 'paitlis' suggests 'paitalis' (got ${typoPaitlis.didYouMean})`);

const typoPhrase = nepaliWordsToNumber("paitlis hajar");
assert(!typoPhrase.success, "Typo phrase 'paitlis hajar' is caught");
assert(typoPhrase.didYouMean === "paitalis hajar", `Typo 'paitlis hajar' suggests 'paitalis hajar' (got ${typoPhrase.didYouMean})`);

const typoEkLak = nepaliWordsToNumber("ek lak");
assert(typoEkLak.didYouMean === "ek lakh", `Typo 'ek lak' suggests 'ek lakh' (got ${typoEkLak.didYouMean})`);

// 6. Invalid input rejection
const invalidParsed = nepaliWordsToNumber("केही नभएको नक्कली शब्द");
assert(!invalidParsed.success, "Invalid words rejected with error");

console.log("\n==========================================");
console.log("RUNNING V2 AGE CALCULATOR TESTS");
console.log("==========================================");

// Calendar days validation
assert(getDaysInBsMonth(2081, 1) === 31, "2081 Baisakh has 31 days");
assert(getDaysInBsMonth(2081, 2) === 32, "2081 Jestha has 32 days");
assert(isValidBsDate(2081, 2, 32) === true, "2081 Jestha 32 is valid");
assert(isValidBsDate(2081, 1, 32) === false, "2081 Baisakh 32 is invalid (max 31)");

// Case A: BS birth -> AD target (2058 Bhadra 12 to 2026-09-03)
console.log("\nCase A: BS DOB -> AD Target");
const caseA = calculateAge(
  { calendar: "BS", bsYear: 2058, bsMonth: 5, bsDay: 12 },
  { calendar: "AD", adDateStr: "2026-09-03" }
);
assert(caseA.years >= 24 && caseA.years <= 26, `BS to AD age computed: ${caseA.years} years, ${caseA.months} months, ${caseA.days} days`);
assert(caseA.totalDays > 8000, `Total days computed: ${caseA.totalDays}`);
assert(caseA.dobBs.year === 2058 && caseA.dobBs.day === 12, `BS DOB retained: ${caseA.dobBs.formattedEn}`);

// Case B: AD birth -> BS target (2001-01-01 AD to 2083-05-18 BS)
console.log("\nCase B: AD DOB -> BS Target");
const caseB = calculateAge(
  { calendar: "AD", adDateStr: "2001-01-01" },
  { calendar: "BS", bsYear: 2083, bsMonth: 5, bsDay: 18 }
);
assert(caseB.years >= 25, `AD to BS age: ${caseB.years} years`);

// Case C: BS birth -> BS target (Exact match)
console.log("\nCase C: BS DOB -> BS Target");
const caseC = calculateAge(
  { calendar: "BS", bsYear: 2058, bsMonth: 5, bsDay: 12 },
  { calendar: "BS", bsYear: 2083, bsMonth: 5, bsDay: 12 }
);
assert(caseC.years === 25 && caseC.months === 0 && caseC.days === 0, `Exact 25 years in BS: ${caseC.years}y ${caseC.months}m ${caseC.days}d`);
assert(caseC.nextBirthday.isToday === true, "Next birthday is today!");

// Case D: AD birth -> AD target (Exact match)
console.log("\nCase D: AD DOB -> AD Target");
const caseD = calculateAge(
  { calendar: "AD", adDateStr: "2000-05-15" },
  { calendar: "AD", adDateStr: "2025-05-15" }
);
assert(caseD.years === 25 && caseD.months === 0 && caseD.days === 0, `Exact 25 years in AD: ${caseD.years}y ${caseD.months}m ${caseD.days}d`);
assert(caseD.nextBirthday.isToday === true, "AD birthday today verified");

// Case E: Birthday tomorrow
console.log("\nCase E: Birthday tomorrow");
const caseE = calculateAge(
  { calendar: "AD", adDateStr: "2000-05-16" },
  { calendar: "AD", adDateStr: "2025-05-15" }
);
assert(caseE.nextBirthday.daysUntil === 1 && caseE.nextBirthday.isTomorrow === true, "Birthday tomorrow verified");

// Case F: Birthday already passed
console.log("\nCase F: Birthday passed this year");
const caseF = calculateAge(
  { calendar: "AD", adDateStr: "2000-05-10" },
  { calendar: "AD", adDateStr: "2025-05-15" }
);
assert(caseF.nextBirthday.daysUntil > 300, `Next birthday next year: in ${caseF.nextBirthday.daysUntil} days`);

// Case G: Invalid BS date rejection
console.log("\nCase G: Invalid BS date rejection");
let invalidThrown = false;
try {
  calculateAge(
    { calendar: "BS", bsYear: 2081, bsMonth: 1, bsDay: 32 }, // Baisakh only has 31
    { calendar: "AD", adDateStr: "2026-09-03" }
  );
} catch (e: any) {
  invalidThrown = true;
  assert(true, `Caught expected invalid BS date: ${e.message}`);
}
assert(invalidThrown, "Invalid BS date threw error");

// Case H: Future birthdate rejection
console.log("\nCase H: Future birthdate rejection");
let futureThrown = false;
try {
  calculateAge(
    { calendar: "AD", adDateStr: "2030-01-01" },
    { calendar: "AD", adDateStr: "2026-09-03" }
  );
} catch (e: any) {
  futureThrown = true;
  assert(true, `Caught expected future birthdate: ${e.message}`);
}
assert(futureThrown, "Future DOB threw error");

console.log("\n==========================================");
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("==========================================");

if (failed > 0) {
  process.exit(1);
}
