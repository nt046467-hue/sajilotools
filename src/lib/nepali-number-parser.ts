// ─── NEPALI NUMBER PARSER ────────────────────────────────────────────────────────
// Bidirectional conversion engine:
// 1. Numbers / Digits -> Nepali Devanagari Words (with optional Lakh/Crore and Rupee/Paisa currency mode)
// 2. Nepali Devanagari Words -> Numbers & Digits (with error handling and validation)
// 3. Numbers -> English Words (South Asian Lakh/Crore system)

import {
  nepaliDigitsToArabic,
  arabicDigitsToNepali,
  formatNepaliComma,
  formatNepaliDigitsComma,
} from "./nepali-number-utils";

// ─── CANONICAL NEPALI NUMERAL DICTIONARY (0-99) ──────────────────────────────────
export const NEPALI_CANONICAL_WORDS: string[] = [
  "शून्य", "एक", "दुई", "तीन", "चार", "पाँच", "छ", "सात", "आठ", "नौ",
  "दस", "एघार", "बाह्र", "तेह्र", "चौध", "पन्ध्र", "सोह्र", "सत्र", "अठार", "उन्नाइस",
  "बीस", "एक्काइस", "बाइस", "तेइस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताइस", "अट्ठाइस", "उनन्तीस",
  "तीस", "एकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड्तीस", "उनन्चालीस",
  "चालीस", "एकचालीस", "बयालीस", "त्रिचालीस", "चौवालिस", "पैंतालीस", "छयालीस", "सत्चालीस", "अठचालीस", "उनन्चास",
  "पचास", "एकान्न", "बाउन्न", "त्रिपन्न", "चौन्न", "पचपन्न", "छप्पन्न", "सन्तान्न", "अन्ठाउन्न", "उनन्साठ्ठी",
  "साठ्ठी", "एकसठ्ठी", "बायसठ्ठी", "त्रिसठ्ठी", "चौंसठ्ठी", "पैंसठ्ठी", "छ्यासठ्ठी", "सतसठ्ठी", "अठसठ्ठी", "उनन्सत्तरी",
  "सत्तरी", "एकहत्तर", "बहत्तर", "त्रिहत्तर", "चौहत्तर", "पचहत्तर", "छ्याहत्तर", "सतहत्तर", "अठहत्तर", "उनासी",
  "असी", "एकासी", "बयासी", "त्रिरासी", "चौरासी", "पचासी", "छ्यासी", "सतासी", "अठासी", "उनान्नब्बे",
  "नब्बे", "एकानब्बे", "बयानब्बे", "त्रियानब्बे", "चौरानब्बे", "पञ्चानब्बे", "छ्यानब्बे", "सन्तानब्बे", "अन्ठानब्बे", "उनन्सय"
];

// Mapping of spelling variations to standard integer value (0-99)
const NEPALI_WORD_TO_VAL_MAP: Record<string, number> = {};

// Register canonical words
NEPALI_CANONICAL_WORDS.forEach((word, val) => {
  NEPALI_WORD_TO_VAL_MAP[word] = val;
});

// Register common colloquial / alternate spellings
const ALTERNATE_SPELLINGS: Record<string, number> = {
  "सुन्ना": 0, "शुन्य": 0,
  "दुइ": 2,
  "पाच": 5,
  "दश": 10,
  "बारह": 12,
  "ते्रह": 13,
  "पन्द्र": 15,
  "सोरह": 16,
  "उन्नीस": 19,
  "बिस": 20,
  "ताइस": 23,
  "चौबिस": 24,
  "पच्चिस": 25,
  "छब्बिस": 26, "छबिस": 26, "छबीस": 26, "छबिश": 26, "छब्बीश": 26,
  "अठ्ठाइस": 28, "अठाइस": 28,
  "उनन्तिस": 29,
  "तिस": 30,
  "एकतिस": 31,
  "बत्तिस": 32,
  "तेत्तीस": 33, "तैतिस": 33,
  "चौंतिस": 34,
  "पैंतिस": 35,
  "सैंतिस": 37,
  "अठतीस": 38,
  "उनन्चालिस": 39,
  "चालिस": 40,
  "एकचालिस": 41,
  "बयालसि": 42, "बयालिस": 42,
  "त्रिचालिस": 43,
  "चवालीस": 44, "चौवालीस": 44, "चवालिस": 44,
  "पैँतालीस": 45, "पैंतालिस": 45, "पैंत्तालिस": 45,
  "छयालसि": 46, "छयालिस": 46,
  "सत्चालिस": 47, "सत्तालीस": 47,
  "अठचालिस": 48,
  "एकाउन्न": 51,
  "सत्ताउन्न": 57,
  "अन्ठान्न": 58,
  "उनन्साठी": 59,
  "साठी": 60,
  "एकसाठी": 61,
  "बासठ्ठी": 62, "बासाठी": 62,
  "त्रिसाठी": 63,
  "चौंसठी": 64,
  "पैंसठी": 65,
  "छ्यासाठी": 66,
  "सतसाठी": 67,
  "अठसाठी": 68, "अठसठी": 68, "अडसठ्ठी": 68, "अड्सठ्ठी": 68, "अडसाठी": 68, "अड्सठी": 68, "अडसठी": 68, "अरसठ्ठी": 68, "अरसाठी": 68,
  "अस्सी": 80,
  "त्रियासी": 83,
  "उनान्ब्बे": 89,
  "एकानवे": 91,
  "बयानवे": 92,
  "त्रियानवे": 93,
  "चौरानवे": 94,
  "पन्चानब्बे": 95, "पञ्चानवे": 95, "पन्चानवे": 95,
  "छ्यानवे": 96,
  "सन्तानवे": 97,
  "अन्ठानवे": 98,
  "उनान्सय": 99,
};

Object.entries(ALTERNATE_SPELLINGS).forEach(([spell, val]) => {
  NEPALI_WORD_TO_VAL_MAP[spell] = val;
});

// Romanized Nepali & English Numeral Dictionary (0-99 + variants)
const ROMANIZED_AND_ENGLISH_SPELLINGS: Record<string, number> = {
  // 0-9
  "zero": 0, "sunna": 0, "sunya": 0, "shunya": 0, "shunye": 0, "null": 0, "shoonya": 0,
  "one": 1, "ek": 1, "yek": 1, "eak": 1,
  "two": 2, "dui": 2, "duyi": 2, "dwee": 2,
  "three": 3, "tin": 3, "teen": 3, "tiyn": 3,
  "four": 4, "char": 4, "chaar": 4, "chhar": 4,
  "five": 5, "pach": 5, "panch": 5, "paanch": 5, "paach": 5,
  "six": 6, "chha": 6, "cha": 6, "chhe": 6, "chhya": 6,
  "seven": 7, "sat": 7, "saat": 7,
  "eight": 8, "ath": 8, "aath": 8, "aat": 8,
  "nine": 9, "nau": 9, "naun": 9, "nao": 9,
  // 10-19
  "ten": 10, "das": 10, "dash": 10, "dosh": 10,
  "eleven": 11, "eghara": 11, "egarah": 11, "eghaar": 11, "egharaa": 11, "ehgara": 11,
  "twelve": 12, "bahra": 12, "barah": 12, "baahra": 12, "baarah": 12,
  "thirteen": 13, "tehra": 13, "terah": 13, "tehraa": 13,
  "fourteen": 14, "chaudha": 14, "chauda": 14, "chaudah": 14, "chaudhaa": 14,
  "fifteen": 15, "pandhra": 15, "pandra": 15, "pandrah": 15, "pandraha": 15,
  "sixteen": 16, "sohra": 16, "sora": 16, "sorah": 16, "sohraa": 16,
  "seventeen": 17, "satra": 17, "satrah": 17, "satraa": 17,
  "eighteen": 18, "athara": 18, "atharah": 18, "aathara": 18, "atharaa": 18,
  "nineteen": 19, "unnais": 19, "unnaees": 19, "unnis": 19, "unneyis": 19,
  // 20-29
  "twenty": 20, "bis": 20, "bees": 20,
  "twenty-one": 21, "twentyone": 21, "ekkais": 21, "ekkaees": 21, "ekkaais": 21, "ekais": 21,
  "twenty-two": 22, "twentytwo": 22, "bais": 22, "baees": 22, "baais": 22,
  "twenty-three": 23, "twentythree": 23, "teis": 23, "teees": 23, "taees": 23, "tehis": 23,
  "twenty-four": 24, "twentyfour": 24, "chaubis": 24, "chaubees": 24, "chaubish": 24, "chobis": 24, "chobees": 24,
  "twenty-five": 25, "twentyfive": 25, "pachhis": 25, "pachis": 25, "pachees": 25, "pachchees": 25, "pachhish": 25, "pachish": 25,
  "twenty-six": 26, "twentysix": 26, "chhabis": 26, "chhabbees": 26, "chhabees": 26, "chabis": 26, "chabbis": 26, "chabees": 26, "chabbees": 26, "chabbish": 26, "chhabish": 26, "chabish": 26,
  "twenty-seven": 27, "twentyseven": 27, "sattais": 27, "sattaees": 27, "sattaais": 27, "satais": 27,
  "twenty-eight": 28, "twentyeight": 28, "athais": 28, "atthais": 28, "athhais": 28, "atthaais": 28, "aathais": 28, "athayis": 28,
  "twenty-nine": 29, "twentynine": 29, "unantis": 29, "unantiis": 29, "unanteesh": 29, "unatis": 29, "unantish": 29,
  // 30-39
  "thirty": 30, "tis": 30, "tees": 30, "teesh": 30,
  "thirty-one": 31, "thirtyone": 31, "ektis": 31, "ektees": 31, "ektish": 31,
  "thirty-two": 32, "thirtytwo": 32, "battis": 32, "battees": 32, "battish": 32, "batis": 32,
  "thirty-three": 33, "thirtythree": 33, "tettis": 33, "tettees": 33, "taitise": 33, "tettish": 33, "tetis": 33,
  "thirty-four": 34, "thirtyfour": 34, "chautis": 34, "chautees": 34, "chautish": 34, "chotis": 34,
  "thirty-five": 35, "thirtyfive": 35, "paintis": 35, "paintees": 35, "pyantis": 35, "paintish": 35,
  "thirty-six": 36, "thirtysix": 36, "chhattis": 36, "chhattees": 36, "chattis": 36, "chattees": 36, "chhattish": 36, "chattish": 36, "chhatis": 36,
  "thirty-seven": 37, "thirtyseven": 37, "saintis": 37, "saintees": 37, "syantis": 37, "saintish": 37, "saitis": 37,
  "thirty-eight": 38, "thirtyeight": 38, "adtis": 38, "adtees": 38, "ahtis": 38, "athtis": 38, "adtish": 38, "athis": 38,
  "thirty-nine": 39, "thirtynine": 39, "unchalis": 39, "unanchalis": 39, "unanchaalis": 39, "unanchaalish": 39, "unchalish": 39,
  // 40-49
  "forty": 40, "chalis": 40, "chaalis": 40, "chalish": 40, "chhalis": 40, "chaalish": 40,
  "forty-one": 41, "fortyone": 41, "ekchalis": 41, "ekchaalis": 41, "ekchalish": 41, "ekchhalis": 41,
  "forty-two": 42, "fortytwo": 42, "bayalis": 42, "bayaalis": 42, "bayalish": 42,
  "forty-three": 43, "fortythree": 43, "trichalis": 43, "trichaalis": 43, "trichalish": 43, "trichhalis": 43,
  "forty-four": 44, "fortyfour": 44, "chawalis": 44, "chawaalis": 44, "chaubalis": 44, "chawalish": 44,
  // 45 - Supports exact query "paitalis" and phonetic variations
  "forty-five": 45, "fortyfive": 45, "paitalis": 45, "paitalees": 45, "paitaalis": 45, "paitalish": 45, "pyatalis": 45, "paintaalis": 45, "paintalish": 45,
  "forty-six": 46, "fortysix": 46, "chhayalis": 46, "chhayaalis": 46, "chayalis": 46, "chayaalis": 46, "chhayalish": 46, "chayalish": 46,
  "forty-seven": 47, "fortyseven": 47, "satchalis": 47, "satchaalis": 47, "sattaalis": 47, "satchalish": 47, "satchhalis": 47,
  "forty-eight": 48, "fortyeight": 48, "athchalis": 48, "athchaalis": 48, "athchalish": 48, "aathchalis": 48,
  "forty-nine": 49, "fortynine": 49, "unanchas": 49, "unanchaas": 49, "unanchash": 49, "unachas": 49,
  // 50-59
  "fifty": 50, "pachas": 50, "pachaas": 50, "pachash": 50,
  "fifty-one": 51, "fiftyone": 51, "ekaunna": 51, "ekauna": 51, "ekawanna": 51, "ekawan": 51,
  "fifty-two": 52, "fiftytwo": 52, "baunna": 52, "bauna": 52, "bawanna": 52, "bawan": 52,
  "fifty-three": 53, "fiftythree": 53, "tripanna": 53, "tripana": 53, "tirepan": 53, "tirpanna": 53,
  "fifty-four": 54, "fiftyfour": 54, "chaunna": 54, "chauna": 54, "chaupan": 54, "chaupanna": 54,
  "fifty-five": 55, "fiftyfive": 55, "pachpanna": 55, "pachpana": 55, "pachpan": 55,
  "fifty-six": 56, "fiftysix": 56, "chhappanna": 56, "chhapanna": 56, "chappanna": 56, "chapanna": 56, "chhappan": 56, "chappan": 56,
  "fifty-seven": 57, "fiftyseven": 57, "sattaunna": 57, "santaunna": 57, "sattaun": 57, "santaun": 57, "sataunna": 57,
  "fifty-eight": 58, "fiftyeight": 58, "anthaunna": 58, "anthanuna": 58, "anthaun": 58, "anthawanna": 58, "anthawan": 58, "adhtaunna": 58, "adhawanna": 58, "athawan": 58, "athawanna": 58,
  "fifty-nine": 59, "fiftynine": 59, "unansathi": 59, "unansatthi": 59, "unansatti": 59, "unasathi": 59,
  // 60-69
  "sixty": 60, "sathi": 60, "saathi": 60, "sathee": 60, "satthi": 60,
  "sixty-one": 61, "sixtyone": 61, "eksathi": 61, "eksaathi": 61, "eksatthi": 61,
  "sixty-two": 62, "sixtytwo": 62, "bayasathi": 62, "baysatthi": 62, "bayasatthi": 62, "basathi": 62, "basatthi": 62,
  "sixty-three": 63, "sixtythree": 63, "trisathi": 63, "trisatthi": 63, "tresathi": 63, "tresatthi": 63,
  "sixty-four": 64, "sixtyfour": 64, "chaunsathi": 64, "chaunsatthi": 64, "chausathi": 64, "chausatthi": 64,
  "sixty-five": 65, "sixtyfive": 65, "painsathi": 65, "painsatthi": 65, "payansathi": 65, "pansathi": 65,
  "sixty-six": 66, "sixtysix": 66, "chhyasathi": 66, "chhyasatthi": 66, "chyasathi": 66, "chyasatthi": 66, "chhasathi": 66,
  "sixty-seven": 67, "sixtyseven": 67, "satsathi": 67, "satshatthi": 67, "satsath": 67, "satsatthi": 67, "satasathi": 67,
  "sixty-eight": 68, "sixtyeight": 68, "arsathi": 68, "arsath": 68, "arsathee": 68, "arsatthi": 68, "arsatti": 68, "arasathi": 68, "athsathi": 68, "athsatthi": 68, "aathsathi": 68, "aathsatthi": 68, "athsath": 68, "athasathi": 68, "athasatthi": 68, "adsathi": 68, "adsath": 68, "adsatthi": 68, "adsathee": 68, "ardsathi": 68, "ardasathi": 68, "aadhsathi": 68,
  "sixty-nine": 69, "sixtynine": 69, "unansattari": 69, "unansattaree": 69, "unansattar": 69, "unansatar": 69, "unanchattari": 69, "unanshattar": 69,
  // 70-79
  "seventy": 70, "sattari": 70, "sattaree": 70, "sattar": 70,
  "seventy-one": 71, "seventyone": 71, "ekhattari": 71, "ekhattar": 71, "ekattari": 71, "ekattar": 71,
  "seventy-two": 72, "seventytwo": 72, "bahattari": 72, "bahattar": 72,
  "seventy-three": 73, "seventythree": 73, "trihattari": 73, "trihattar": 73, "tihattari": 73, "tihattar": 73,
  "seventy-four": 74, "seventyfour": 74, "chauhattari": 74, "chauhattar": 74, "chahattari": 74, "chahattar": 74,
  "seventy-five": 75, "seventyfive": 75, "pachhattari": 75, "pachhattar": 75, "pachattari": 75, "pachattar": 75,
  "seventy-six": 76, "seventysix": 76, "chhyahattari": 76, "chhyahattar": 76, "chyahattari": 76, "chyahattar": 76, "chhahattari": 76, "chhahattar": 76,
  "seventy-seven": 77, "seventyseven": 77, "sathattari": 77, "sathattar": 77, "satahattar": 77, "satattari": 77, "satattar": 77,
  "seventy-eight": 78, "seventyeight": 78, "athahattari": 78, "athahattar": 78, "athhattar": 78, "athattar": 78, "athattari": 78, "arahattar": 78, "arhattar": 78, "arhattari": 78, "adhattari": 78, "adhattar": 78,
  "seventy-nine": 79, "seventynine": 79, "unasi": 79, "unasee": 79, "unassi": 79,
  // 80-89
  "eighty": 80, "asi": 80, "asee": 80, "assi": 80, "assee": 80,
  "eighty-one": 81, "eightyone": 81, "ekasi": 81, "ekaasee": 81, "ekaasi": 81, "ekassi": 81,
  "eighty-two": 82, "eightytwo": 82, "bayasi": 82, "bayaasee": 82, "bayaasi": 82, "bayassi": 82,
  "eighty-three": 83, "eightythree": 83, "triyasi": 83, "triyaasee": 83, "trirasi": 83, "tirasi": 83, "tiryasi": 83,
  "eighty-four": 84, "eightyfour": 84, "chaurasi": 84, "chauraasee": 84, "chauraasi": 84,
  "eighty-five": 85, "eightyfive": 85, "pachasi": 85, "pachaasee": 85, "pachaasi": 85,
  "eighty-six": 86, "eightysix": 86, "chhyasi": 86, "chhyaasee": 86, "chyasi": 86, "chyaasee": 86, "chhaasi": 86, "chhasi": 86,
  "eighty-seven": 87, "eightyseven": 87, "satasi": 87, "sataasee": 87, "sataasi": 87, "satasee": 87,
  "eighty-eight": 88, "eightyeight": 88, "athasi": 88, "athaasee": 88, "athaasi": 88, "athasee": 88, "aathasi": 88, "adhasi": 88, "arasi": 88, "atthasi": 88,
  "eighty-nine": 89, "eightynine": 89, "unanabbye": 89, "unanawe": 89, "unanaasi": 89, "unanabbey": 89, "unanabbe": 89,
  // 90-99
  "ninety": 90, "nabbe": 90, "nabaye": 90, "nabbey": 90, "nabbai": 90,
  "ninety-one": 91, "ninetyone": 91, "ekanabbe": 91, "ekanabbey": 91, "ekanabbai": 91,
  "ninety-two": 92, "ninetytwo": 92, "bayanabbe": 92, "bayanabbey": 92, "bayanabbai": 92,
  "ninety-three": 93, "ninetythree": 93, "triyanabbe": 93, "triyanabbey": 93, "triyanabbai": 93, "tiyanabbe": 93,
  "ninety-four": 94, "ninetyfour": 94, "chauranabbe": 94, "chauranabbey": 94, "chauranabbai": 94,
  "ninety-five": 95, "ninetyfive": 95, "panchanabbe": 95, "panchanabbey": 95, "pancanabbey": 95, "pachyanabbe": 95,
  "ninety-six": 96, "ninetysix": 96, "chhyanabbe": 96, "chhyanabbey": 96, "chyanabbe": 96, "chyanabbey": 96, "chhanabbe": 96,
  "ninety-seven": 97, "ninetyseven": 97, "santanabbe": 97, "santanabbey": 97, "santanabbai": 97,
  "ninety-eight": 98, "ninetyeight": 98, "anthanabbe": 98, "anthanabbey": 98, "anthanabbai": 98,
  "ninety-nine": 99, "ninetynine": 99, "unansaya": 99, "unansau": 99, "unansaye": 99, "unansayaa": 99,
};

Object.entries(ROMANIZED_AND_ENGLISH_SPELLINGS).forEach(([spell, val]) => {
  NEPALI_WORD_TO_VAL_MAP[spell.toLowerCase()] = val;
});

// Scale multipliers and constants compatible with all TS targets
const B_0 = BigInt(0);
const B_1 = BigInt(1);
const B_100 = BigInt(100);
const B_1000 = BigInt(1000);
const B_100000 = BigInt(100000);
const B_1000000 = BigInt(1000000);
const B_10000000 = BigInt(10000000);
const B_1000000000 = BigInt(1000000000);
const B_100000000000 = BigInt("100000000000");
const B_10000000000000 = BigInt("10000000000000");
const B_1000000000000000 = BigInt("1000000000000000");
const B_100000000000000000 = BigInt("100000000000000000");

interface ScaleDef {
  words: string[];
  multiplier: bigint;
  name: string;
}

const SCALE_HIERARCHY: ScaleDef[] = [
  { words: ["शंख"], multiplier: B_100000000000000000, name: "शंख" },
  { words: ["पद्म"], multiplier: B_1000000000000000, name: "पद्म" },
  { words: ["नील"], multiplier: B_10000000000000, name: "नील" },
  { words: ["खरब", "खर्ब"], multiplier: B_100000000000, name: "खरब" },
  { words: ["अरब", "अर्ब"], multiplier: B_1000000000, name: "अरब" },
  { words: ["करोड", "करोड़"], multiplier: B_10000000, name: "करोड" },
  { words: ["लाख", "लाक"], multiplier: B_100000, name: "लाख" },
  { words: ["हजार", "हज़ार"], multiplier: B_1000, name: "हजार" },
  { words: ["सय", "सौ"], multiplier: B_100, name: "सय" },
];

const CURRENCY_FILLER_WORDS = new Set([
  // Devanagari
  "रुपैयाँ", "रुपियाँ", "रुपैया", "रु", "रु.", "रुपया",
  "मात्र", "र", "पनि", "का", "को", "मा", "ले", "लाई",
  // Romanized & English
  "rupaiya", "rupiya", "rupayan", "rupee", "rupees", "rs", "rs.", "npr",
  "matra", "only", "and", "ra", "ani", "bla", "blah", "etc"
]);

// ─── NUMBER TO NEPALI WORDS ──────────────────────────────────────────────────────

function twoDigitsToNepaliWord(num: number): string {
  if (num < 0 || num > 99) return "";
  return NEPALI_CANONICAL_WORDS[num] || "";
}

/**
 * Converts BigInt or number to Nepali Words.
 * Supports whole numbers up to Shankha (10^17+).
 */
export function integerToNepaliWords(val: bigint | number): string {
  let n = typeof val === "number" ? BigInt(Math.floor(val)) : val;
  if (n === B_0) return NEPALI_CANONICAL_WORDS[0];
  if (n < B_0) return "ऋणात्मक " + integerToNepaliWords(-n);

  const parts: string[] = [];

  for (const scale of SCALE_HIERARCHY) {
    if (n >= scale.multiplier) {
      const quotient = n / scale.multiplier;
      n = n % scale.multiplier;

      if (scale.multiplier === B_100) {
        // Hundreds scale: quotient is 1 to 9
        const qNum = Number(quotient);
        if (qNum > 0 && qNum <= 9) {
          parts.push(`${twoDigitsToNepaliWord(qNum)} सय`);
        }
      } else {
        // Higher scales (Hajar, Lakh, Crore, etc.):
        // Convert quotient to words recursively if >= 100, otherwise two digits
        const qWords = quotient < B_100 ? twoDigitsToNepaliWord(Number(quotient)) : integerToNepaliWords(quotient);
        if (qWords) {
          parts.push(`${qWords} ${scale.name}`);
        }
      }
    }
  }

  // Remainder 1-99
  if (n > B_0) {
    parts.push(twoDigitsToNepaliWord(Number(n)));
  }

  return parts.join(" ").trim();
}

export interface NumberToNepaliOptions {
  currency?: boolean; // If true, adds "रुपैयाँ" and "मात्र"
}

/**
 * Main number -> Nepali words converter.
 * Accurately handles decimal paisa if currency is true.
 * Accepts numbers, strings (e.g. "1250.50", "45678", "१२३४५").
 */
export function numberToNepaliWords(
  input: number | string,
  options: NumberToNepaliOptions = {}
): string {
  const { currency = false } = options;

  if (input === undefined || input === null || input === "") {
    return currency ? "शून्य रुपैयाँ मात्र" : "शून्य";
  }

  // Normalize digits (Devanagari to Arabic, strip commas)
  const clean = nepaliDigitsToArabic(String(input).trim().replace(/,/g, ""));
  if (!clean || isNaN(Number(clean))) {
    return "अमान्य संख्या";
  }

  const isNegative = clean.startsWith("-");
  const absStr = isNegative ? clean.slice(1) : clean;
  const [intPartStr, decPartStr] = absStr.split(".");

  let intBigInt = B_0;
  try {
    intBigInt = BigInt(intPartStr || "0");
  } catch {
    return "अमान्य संख्या";
  }

  const intWords = integerToNepaliWords(intBigInt);

  if (!currency) {
    // Standard mathematical number without currency
    let result = intWords;
    if (decPartStr) {
      // Speak individual decimal digits
      const decWords = decPartStr
        .slice(0, 4) // limit decimal places for readability
        .split("")
        .map((d) => NEPALI_CANONICAL_WORDS[Number(d)] || d)
        .join(" ");
      result += ` दशमलव ${decWords}`;
    }
    return isNegative ? `ऋणात्मक ${result}` : result;
  }

  // Currency Mode (Rupees and Paisa)
  let paisaNum = 0;
  if (decPartStr) {
    // Take first 2 decimal digits as Paisa (e.g. .5 -> 50, .05 -> 5, .50 -> 50)
    const normalizedDec = (decPartStr + "00").slice(0, 2);
    paisaNum = parseInt(normalizedDec, 10);
  }

  let result = "";
  if (intBigInt === B_0 && paisaNum === 0) {
    return "शून्य रुपैयाँ मात्र";
  }

  if (intBigInt > B_0) {
    result += `${intWords} रुपैयाँ`;
  }

  if (paisaNum > 0) {
    const paisaWords = twoDigitsToNepaliWord(paisaNum);
    result += (result ? " " : "") + `${paisaWords} पैसा`;
  }

  result += " मात्र";
  return isNegative ? `ऋणात्मक ${result}` : result;
}

// ─── NUMBER TO ENGLISH WORDS (LAKH / CRORE SYSTEM) ──────────────────────────────

const EN_UNITS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
];
const EN_TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitsToEn(n: number): string {
  if (n < 20) return EN_UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return EN_TENS[t] + (u > 0 ? " " + EN_UNITS[u] : "");
}

/**
 * Converts a number to English words using the South Asian (Lakh/Crore) system.
 */
export function numberToEnglishWords(
  input: number | string,
  options: NumberToNepaliOptions = {}
): string {
  const { currency = false } = options;

  if (input === undefined || input === null || input === "") {
    return currency ? "Zero Rupees Only" : "Zero";
  }

  const clean = nepaliDigitsToArabic(String(input).trim().replace(/,/g, ""));
  if (!clean || isNaN(Number(clean))) {
    return "Invalid Number";
  }

  const isNegative = clean.startsWith("-");
  const absStr = isNegative ? clean.slice(1) : clean;
  const [intPartStr, decPartStr] = absStr.split(".");

  let n = B_0;
  try {
    n = BigInt(intPartStr || "0");
  } catch {
    return "Invalid Number";
  }

  if (n === B_0 && (!decPartStr || parseInt(decPartStr.slice(0, 2), 10) === 0)) {
    return currency ? "Zero Rupees Only" : "Zero";
  }

  const parts: string[] = [];

  // Arab (10^9)
  if (n >= B_1000000000) {
    const arab = Number(n / B_1000000000);
    parts.push(`${twoDigitsToEn(arab)} Arab`);
    n %= B_1000000000;
  }

  // Crore (10^7)
  if (n >= B_10000000) {
    const crore = Number(n / B_10000000);
    parts.push(`${twoDigitsToEn(crore)} Crore`);
    n %= B_10000000;
  }

  // Lakh (10^5)
  if (n >= B_100000) {
    const lakh = Number(n / B_100000);
    parts.push(`${twoDigitsToEn(lakh)} Lakh`);
    n %= B_100000;
  }

  // Thousand (10^3)
  if (n >= B_1000) {
    const thousand = Number(n / B_1000);
    parts.push(`${twoDigitsToEn(thousand)} Thousand`);
    n %= B_1000;
  }

  // Hundred (10^2)
  if (n >= B_100) {
    const hundred = Number(n / B_100);
    parts.push(`${EN_UNITS[hundred]} Hundred`);
    n %= B_100;
  }

  // Remainder
  if (n > B_0) {
    parts.push(twoDigitsToEn(Number(n)));
  }

  let result = parts.join(" ").trim();

  let paisaNum = 0;
  if (decPartStr) {
    const normalizedDec = (decPartStr + "00").slice(0, 2);
    paisaNum = parseInt(normalizedDec, 10);
  }

  if (!currency) {
    if (decPartStr) {
      const decWords = decPartStr
        .slice(0, 4)
        .split("")
        .map((d) => (d === "0" ? "Zero" : EN_UNITS[Number(d)]))
        .join(" ");
      result += ` Point ${decWords}`;
    }
    return isNegative ? `Minus ${result}` : result;
  }

  if (result) {
    result += " Rupees";
  }

  if (paisaNum > 0) {
    result += (result ? " and " : "") + `${twoDigitsToEn(paisaNum)} Paisa`;
  }

  result += " Only";
  return isNegative ? `Minus ${result}` : result;
}

// ─── NEPALI WORDS TO NUMBER PARSER ──────────────────────────────────────────────

export interface NepaliWordsToNumberResult {
  success: boolean;
  value?: number;
  valueBigInt?: bigint;
  formattedArabic?: string;
  formattedNepali?: string;
  isCurrency?: boolean;
  error?: string;
  errorDetail?: string;
  suggestions?: string[];
  didYouMean?: string;
  rupees?: number;
  paisa?: number;
  nepaliWords?: string;
  englishWords?: string;
  chequeFormat?: string;
}

/**
 * Normalizes Nepali text:
 * - Trims and replaces multiple spaces
 * - Lowercases for English / Romanized matching
 * - Strips punctuation
 */
function cleanNepaliText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[।,\.\?;:!\(\)\[\]"'`\-_/\\|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses a sequence of Nepali or Romanized/English number words into a BigInt value.
 * Supports:
 * - Devanagari: "पैंतालीस हजार छ सय अठहत्तर"
 * - Romanized: "paitalis hajar chha saya athahattar", "paitalis"
 * - English: "forty five thousand six hundred seventy eight"
 * - Mixed: "45 hajar", "1.5 lakh"
 */
function parseNepaliIntegerTokens(tokens: string[]): { success: boolean; value?: bigint; error?: string } {
  if (tokens.length === 0) {
    return { success: false, error: "शब्दहरू खाली छन्।" };
  }

  // Check if single token zero
  const firstToken = tokens[0].toLowerCase();
  if (
    tokens.length === 1 &&
    (firstToken === "शून्य" || firstToken === "सुन्ना" || firstToken === "शुन्य" ||
     firstToken === "zero" || firstToken === "sunna" || firstToken === "shunya" || firstToken === "0")
  ) {
    return { success: true, value: B_0 };
  }

  let total = B_0;
  let currentGroup = B_0;
  let hasValidToken = false;

  // Scale map for rapid lookup (Devanagari, Romanized Nepali, English)
  const scaleMap: Record<string, bigint> = {
    // Devanagari
    "शंख": B_100000000000000000,
    "पद्म": B_1000000000000000,
    "नील": B_10000000000000,
    "खरब": B_100000000000,
    "खर्ब": B_100000000000,
    "अरब": B_1000000000,
    "अर्ब": B_1000000000,
    "करोड": B_10000000,
    "करोड़": B_10000000,
    "लाख": B_100000,
    "लाक": B_100000,
    "हजार": B_1000,
    "हज़ार": B_1000,
    "सय": B_100,
    "सौ": B_100,

    // Romanized Nepali & English
    "shankha": B_100000000000000000,
    "shanka": B_100000000000000000,
    "padma": B_1000000000000000,
    "padam": B_1000000000000000,
    "neel": B_10000000000000,
    "nil": B_10000000000000,
    "kharab": B_100000000000,
    "kharb": B_100000000000,
    "arab": B_1000000000,
    "arb": B_1000000000,
    "billion": B_1000000000,
    "billions": B_1000000000,
    "karod": B_10000000,
    "crore": B_10000000,
    "crores": B_10000000,
    "kror": B_10000000,
    "cr": B_10000000,
    "lakh": B_100000,
    "lakhs": B_100000,
    "laakh": B_100000,
    "lac": B_100000,
    "lacs": B_100000,
    "million": B_1000000,
    "millions": B_1000000,
    "hajar": B_1000,
    "hazar": B_1000,
    "hazaar": B_1000,
    "thousand": B_1000,
    "thousands": B_1000,
    "k": B_1000,
    "saya": B_100,
    "say": B_100,
    "sau": B_100,
    "sai": B_100,
    "se": B_100,
    "hundred": B_100,
    "hundreds": B_100,
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].toLowerCase();

    // Skip filler words
    if (CURRENCY_FILLER_WORDS.has(token)) {
      continue;
    }

    // Check if numeric digits (e.g. "45" or "४५")
    const cleanNum = nepaliDigitsToArabic(token);
    if (/^\d+$/.test(cleanNum)) {
      currentGroup += BigInt(cleanNum);
      hasValidToken = true;
      continue;
    }

    // Check if token is a scale multiplier
    if (scaleMap[token] !== undefined) {
      const multiplier = scaleMap[token];
      // If no preceding number (e.g. "hajar" instead of "ek hajar"), treat as 1
      const count = currentGroup === B_0 ? B_1 : currentGroup;
      total += count * multiplier;
      currentGroup = B_0;
      hasValidToken = true;
      continue;
    }

    // Check if token is a 0-99 number word
    if (NEPALI_WORD_TO_VAL_MAP[token] !== undefined) {
      const val = BigInt(NEPALI_WORD_TO_VAL_MAP[token]);
      currentGroup += val;
      hasValidToken = true;
      continue;
    }

    // Any token that is neither a number, scale, number word, nor explicit filler is an unrecognized word / typo
    return {
      success: false,
      error: `अमान्य वा अपरिचित शब्द: "${token}"`,
    };
  }

  if (!hasValidToken) {
    return {
      success: false,
      error: "संख्या पहिचान हुन सकेन (Unable to recognize number)",
    };
  }

  total += currentGroup;
  return { success: true, value: total };
}

// ─── SMART SUGGESTION & TYPO CORRECTION ENGINE ─────────────────────────────────

// High-speed Levenshtein edit distance computation (O(M*N) where M,N <= 15)
function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  const dp: number[] = [];

  for (let j = 0; j <= n; j++) dp[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const val = Math.min(dp[j] + 1, prev + 1, dp[j - 1] + cost);
      dp[j - 1] = prev;
      prev = val;
    }
    dp[n] = prev;
  }
  return dp[n];
}

// Pre-compiled list of all recognized number and scale words for typo matching
const TYPO_VOCABULARY: string[] = Array.from(
  new Set([
    ...Object.keys(NEPALI_WORD_TO_VAL_MAP),
    "hajar", "lakh", "crore", "karod", "arab", "kharab", "saya", "say",
    "हजार", "लाख", "करोड", "अरब", "खरब", "सय", "सौ",
    "rupaiya", "rupee", "rupees", "paisa", "matra", "only",
    "रुपैयाँ", "पैसा", "मात्र",
  ])
);

/**
 * Finds the closest recognized word for a single token if it has a typo.
 * Returns the corrected word or null if no close match is found.
 */
function findBestTokenMatch(token: string): string | null {
  const t = token.toLowerCase();
  if (/^\d+$/.test(t)) return token;
  if (NEPALI_WORD_TO_VAL_MAP[t] !== undefined) return t;
  if (TYPO_VOCABULARY.includes(t)) return t;

  let bestMatch: string | null = null;
  let minDistance = 999;
  // Dynamic threshold: words > 4 chars allow edit distance 2, shorter words allow distance 1
  const maxAllowedDistance = t.length > 4 ? 2 : (t.length >= 3 ? 1 : 0);

  for (const cand of TYPO_VOCABULARY) {
    if (Math.abs(cand.length - t.length) > maxAllowedDistance) continue;
    // Require matching first character for words of length >= 2
    if (t.length >= 2 && cand.length >= 2 && t[0] !== cand[0]) continue;

    const dist = levenshteinDistance(t, cand);
    if (dist <= maxAllowedDistance && dist < minDistance) {
      minDistance = dist;
      bestMatch = cand;
      if (dist === 1 && t.length <= 4) break;
    }
  }

  return bestMatch;
}

/**
 * Builds a smart "Did you mean?" suggestion for a multi-token phrase with typos.
 */
function findSmartPhraseCorrection(tokens: string[]): string | null {
  if (tokens.length === 0) return null;

  let hadCorrection = false;
  const corrected: string[] = [];

  for (const t of tokens) {
    const match = findBestTokenMatch(t);
    if (match) {
      if (match !== t.toLowerCase()) {
        hadCorrection = true;
      }
      corrected.push(match);
    } else {
      return null;
    }
  }

  return hadCorrection ? corrected.join(" ") : null;
}

/**
 * Parses full Nepali, Romanized, or English words into a numeric result.
 * Detects currency words (रुपैयाँ, पैसा, मात्र, rs, paisa), handles both integer and paise components.
 */
export function nepaliWordsToNumber(
  input: string,
  options: { currency?: boolean } = {}
): NepaliWordsToNumberResult {
  if (!input || !input.trim()) {
    return {
      success: false,
      error: "कुनै शब्द फेला परेन (No input provided)",
      errorDetail: "कृपया रूपान्तरण गर्न नेपाली शब्द, रोमनाइज्ड रूप वा संख्या लेख्नुहोस् (उदा. 'पैंतालीस हजार', 'paitalis hajar', '45,000')।",
      suggestions: ["पैंतालीस हजार", "paitalis hajar", "ek lakh", "५० हजार"],
    };
  }

  const cleaned = cleanNepaliText(input);
  const rawTokens = cleaned.split(" ").filter(Boolean);

  if (rawTokens.length === 0) {
    return {
      success: false,
      error: "कुनै मान्य शब्द फेला परेन (No valid words found)",
      errorDetail: "कृपया रूपान्तरण गर्न संख्यात्मक शब्दहरू लेख्नुहोस्।",
      suggestions: ["पैंतालीस हजार", "paitalis hajar", "ek lakh"],
    };
  }

  const isPaisaToken = (t: string) => t === "पैसा" || t === "paisa" || t === "paise" || t === "cents";
  const isRupeeToken = (t: string) =>
    t === "रुपैयाँ" || t === "रुपियाँ" || t === "रुपैया" || t === "रु" ||
    t === "rupaiya" || t === "rupiya" || t === "rupee" || t === "rupees" || t === "rs";

  // Detect currency indicators or respect explicit option
  const detectedCurrency = rawTokens.some((t) => CURRENCY_FILLER_WORDS.has(t) || isPaisaToken(t) || isRupeeToken(t));
  const isCurrency = options.currency !== undefined ? options.currency : detectedCurrency;

  // Check for "पैसा" / "paisa" to separate rupees and paisa parts
  let rupeeTokens: string[] = [];
  let paisaTokens: string[] = [];
  let paisaIndex = -1;
  for (let i = 0; i < rawTokens.length; i++) {
    if (isPaisaToken(rawTokens[i])) {
      paisaIndex = i;
      break;
    }
  }

  if (paisaIndex !== -1) {
    let rupeesEndIdx = -1;
    for (let i = 0; i < paisaIndex; i++) {
      if (isRupeeToken(rawTokens[i])) {
        rupeesEndIdx = i;
        break;
      }
    }

    if (rupeesEndIdx !== -1) {
      rupeeTokens = rawTokens.slice(0, rupeesEndIdx).filter((t) => !CURRENCY_FILLER_WORDS.has(t));
      paisaTokens = rawTokens.slice(rupeesEndIdx + 1, paisaIndex).filter((t) => !CURRENCY_FILLER_WORDS.has(t));
    } else {
      rupeeTokens = rawTokens.slice(0, paisaIndex - 1).filter((t) => !CURRENCY_FILLER_WORDS.has(t));
      paisaTokens = [rawTokens[paisaIndex - 1]].filter((t) => !CURRENCY_FILLER_WORDS.has(t));
    }
  } else {
    rupeeTokens = rawTokens.filter((t) => !CURRENCY_FILLER_WORDS.has(t));
  }

  // Parse rupees
  let rupeesVal = B_0;
  if (rupeeTokens.length > 0) {
    const parsedRupees = parseNepaliIntegerTokens(rupeeTokens);
    if (!parsedRupees.success || parsedRupees.value === undefined) {
      const suggestedCorrection = findSmartPhraseCorrection(rawTokens);
      const suggestions: string[] = [];
      if (suggestedCorrection) {
        suggestions.push(suggestedCorrection);
      }
      ["पैंतालीस हजार", "paitalis hajar", "ek lakh", "५० हजार", "arsathi"].forEach((s) => {
        if (!suggestions.includes(s)) suggestions.push(s);
      });

      return {
        success: false,
        error: "संख्या पहिचान हुन सकेन (Unable to recognize number)",
        errorDetail: suggestedCorrection
          ? `के तपाईंको भनाइ "${suggestedCorrection}" हो? (Did you mean "${suggestedCorrection}"?)`
          : `तपाईंले प्रविष्ट गर्नुभएको शब्दहरू (${input.trim()}) बाट कुनै मान्य संख्या फेला परेन। कृपया हिज्जे जाँच गर्नुहोस् वा सुझावहरू हेर्नुहोस्।`,
        didYouMean: suggestedCorrection || undefined,
        suggestions: suggestions.slice(0, 5),
      };
    }
    rupeesVal = parsedRupees.value;
  }

  // Parse paisa
  let paisaVal = 0;
  if (paisaTokens.length > 0) {
    const parsedPaisa = parseNepaliIntegerTokens(paisaTokens);
    if (!parsedPaisa.success || parsedPaisa.value === undefined) {
      return {
        success: false,
        error: "पैसाको मान पहिचान हुन सकेन (Invalid paisa amount)",
        errorDetail: "पैसाको भाग स्पष्ट भएन। कृपया 'पचास पैसा' वा '५० पैसा' जस्ता ढाँचामा लेख्नुहोस्।",
        suggestions: ["५० पैसा", "पचास पैसा", "२५ पैसा"],
      };
    }
    paisaVal = Number(parsedPaisa.value);
    if (paisaVal > 99) {
      return {
        success: false,
        error: "पैसाको मान ० देखि ९९ सम्म हुनुपर्छ (Paisa must be 0-99)",
        errorDetail: "१०० पैसा बराबर १ रुपैयाँ हुने भएकाले पैसा ० देखि ९९ सम्म मात्र मान्य हुन्छ।",
        suggestions: ["५० पैसा", "७५ पैसा", "९९ पैसा"],
      };
    }
  }

  const rupeesNum = Number(rupeesVal);
  const totalValue = paisaVal > 0 ? rupeesNum + paisaVal / 100 : rupeesNum;

  // Format strings
  const formattedArabic = paisaVal > 0
    ? `${formatNepaliComma(rupeesVal.toString())}.${paisaVal.toString().padStart(2, "0")}`
    : formatNepaliComma(rupeesVal.toString());

  const formattedNepali = paisaVal > 0
    ? `${formatNepaliDigitsComma(rupeesVal.toString())}.${arabicDigitsToNepali(paisaVal.toString().padStart(2, "0"))}`
    : formatNepaliDigitsComma(rupeesVal.toString());

  // Canonical Devanagari words & English words
  const nepaliWords = numberToNepaliWords(totalValue, { currency: isCurrency });
  const englishWords = numberToEnglishWords(totalValue, { currency: isCurrency });
  const chequeFormat = isCurrency
    ? `रु ${formattedArabic}/- (${nepaliWords})`
    : undefined;

  return {
    success: true,
    value: totalValue,
    valueBigInt: rupeesVal,
    formattedArabic,
    formattedNepali,
    isCurrency,
    rupees: rupeesNum,
    paisa: paisaVal,
    nepaliWords,
    englishWords,
    chequeFormat,
  };
}
