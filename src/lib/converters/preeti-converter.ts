/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SajiloTools — Official Preeti ↔ Devanagari Unicode Bidirectional Engine
 * ─────────────────────────────────────────────────────────────────────────────
 * Accurately implements character mappings, composite vowels, conjunct formation,
 * matra reordering (chhoti i-kar), subjoined rakar, superscript reph, and
 * modifier keystrokes according to the official Preeti standard and Madan
 * Puraskar Pustakalaya / FOSS Nepal conversion rules.
 */

// ── PREETI TO UNICODE CHARACTER MAP ──────────────────────────────────────────

const PREETI_TO_UNICODE_MAP: Record<string, string> = {
  // Numerals & Top row symbols
  "~": "ञ्",
  "`": "ञ",
  "!": "१",
  "@": "२",
  "#": "३",
  "$": "४",
  "%": "५",
  "^": "६",
  "&": "७",
  "*": "८",
  "(": "९",
  ")": "०",
  "-": "(",
  "_": ")",
  "+": "ं",
  "=": ".",
  "<": "?",
  "÷": "/",
  "×": "×",
  "±": "+",

  // Ligatures & complex conjuncts
  "¡": "ज्ञ्",
  "1": "ज्ञ",
  "q": "त्र",
  "Q": "त्त",
  "2": "द्द",
  "4": "द्ध",
  "å": "द्व",
  "ß": "द्म",
  "B": "द्य",
  "¢": "द्घ",
  "§": "ट्ट",
  "¶": "ठ्ठ",
  "•": "ड्ड",
  "Ý": "ट्ठ",
  "Í": "ङ्क",
  "Î": "ङ्ख",
  "Ë": "ङ्ग",
  "‹": "ङ्घ",
  "°": "ङ्ढ",
  "ª": "ङ",
  "Ì": "न्न",
  "„": "ध्र",
  "›": "द्र",
  "ˆ": "फ्",
  ">": "श्र",
  "ç": "ॐ",
  "¥": "र्‍",
  "¿": "रू",
  "?": "रु",

  // Independent vowels
  "c": "अ",
  "O": "इ",
  "p": "उ",
  "C": "ऋ",
  "P": "ए",

  // Consonants (full & half)
  "s": "क",
  "S": "क्",
  "v": "ख",
  "V": "ख्",
  "u": "ग",
  "U": "ग्",
  "3": "घ",
  "£": "घ्",
  "r": "च",
  "R": "च्",
  "5": "छ",
  "h": "ज",
  "H": "ज्",
  "´": "झ",
  "¤": "झ्",
  "‰": "झ्",
  "6": "ट",
  "7": "ठ",
  "8": "ड",
  "9": "ढ",
  "0": "ण",
  "t": "त",
  "T": "त्",
  "y": "थ",
  "Y": "थ्",
  "b": "द",
  "w": "ध",
  "W": "ध्",
  "g": "न",
  "G": "न्",
  "k": "प",
  "K": "प्",
  "a": "ब",
  "A": "ब्",
  "e": "भ",
  "E": "भ्",
  "d": "म",
  "D": "म्",
  "o": "य",
  "/": "र",
  "n": "ल",
  "N": "ल्",
  "j": "व",
  "J": "व्",
  "z": "श",
  "Z": "श्",
  "i": "ष",
  "I": "क्ष्",
  ";": "स",
  ":": "स्",
  "x": "ह",
  "X": "ह्",

  // Matras & diacritics
  "f": "ा",
  "l": "ि",
  "L": "ी",
  "'": "ु",
  "\"": "ू",
  "[": "ृ",
  "]": "े",
  "}": "ै",
  "F": "ँ",
  "M": "ः",
  "\\": "्",
  ".": "।",
  "|": "्र",
  "«": "्र",

  // Typographic Quotes
  "æ": "“",
  "Æ": "”",
  "Ú": "’",
  "…": "‘",
};

/**
 * Converts legacy Preeti ASCII text to modern Devanagari Unicode.
 */
export function preetiToUnicode(text: string): string {
  if (!text) return "";

  let output = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    output += PREETI_TO_UNICODE_MAP[ch] !== undefined ? PREETI_TO_UNICODE_MAP[ch] : ch;
  }

  // Multi-stage transformation pipeline (order-sensitive)
  const rules: [RegExp, string][] = [
    // Clean up halant + aa-kar
    [/्ा/g, ""],

    // Modifier 'm' combinations (e.g. km -> फ, pm -> ऊ, qm -> क्र, Qm -> क्त, em -> झ)
    [/(त्र|त्त)([^उभप]+?)m/g, "$1m$2"],
    [/त्रm/g, "क्र"],
    [/त्तm/g, "क्त"],
    [/([^उभप]+?)m/g, "m$1"],
    [/उm/g, "ऊ"],
    [/भm/g, "झ"],
    [/पm/g, "फ"],

    // Reph on 'इ' gives 'ई'
    [/इ{/g, "ई"],

    // Shift chhoti i-kar 'ि' (typed before consonant 'l' in Preeti) to after the consonant/cluster
    [/ि(([\u0915-\u0939\u0958-\u095F]्)*[\u0915-\u0939\u0958-\u095F])/g, "$1ि"],

    // Reph '{' shifting: moves before the whole consonant cluster as 'र्'
    [/([\u0915-\u0939\u0958-\u095F][\u093E-\u094C\u0901-\u0903\u094D]*?){/g, "{$1"],
    [/(([\u0915-\u0939\u0958-\u095F]्)*){/g, "{$1"],
    [/{/g, "र्"],

    // Composite vowels and matras
    [/अाे/g, "ओ"],
    [/अाै/g, "औ"],
    [/अा/g, "आ"],
    [/एे/g, "ऐ"],
    [/ाे/g, "ो"],
    [/ाै/g, "ौ"],
    [/ेा/g, "ो"],
    [/ैा/g, "ौ"],
    [/टृ/g, "ट्ट"],

    // Order corrections for matras and combining marks
    [/([ाीुूृेैोौंःँ]+?)(्([\u0915-\u0939\u0958-\u095F]्)*[\u0915-\u0939\u0958-\u095F])/g, "$2$1"],
    [/्([ाीुूृेैोौंःँ]+?)(([\u0915-\u0939\u0958-\u095F]्)*[\u0915-\u0939\u0958-\u095F])/g, "्$2$1"],
    [/([ंँ])([ािीुूृेैोौः]*)/g, "$2$1"],

    // Deduplication of double matras/marks
    [/ँँ/g, "ँ"],
    [/ंं/g, "ं"],
    [/ेे/g, "े"],
    [/ैै/g, "ै"],
    [/ुु/g, "ु"],
    [/ूू/g, "ू"],
  ];

  for (const [pattern, replacement] of rules) {
    output = output.replace(pattern, replacement);
  }

  return output;
}

// ── UNICODE TO PREETI CHARACTER MAP ──────────────────────────────────────────

const UNICODE_TO_PREETI_CHAR_MAP: Record<string, string> = {
  // Consonants (full)
  "क": "s",
  "ख": "v",
  "ग": "u",
  "घ": "3",
  "ङ": "ª",
  "च": "r",
  "छ": "5",
  "ज": "h",
  "झ": "´",
  "ञ": "`",
  "ट": "6",
  "ठ": "7",
  "ड": "8",
  "ढ": "9",
  "ण": "0",
  "त": "t",
  "थ": "y",
  "द": "b",
  "ध": "w",
  "न": "g",
  "प": "k",
  "फ": "km",
  "ब": "a",
  "भ": "e",
  "म": "d",
  "य": "o",
  "र": "/",
  "ल": "n",
  "व": "j",
  "श": "z",
  "ष": "i",
  "स": ";",
  "ह": "x",

  // Consonants (half with halant)
  "क्": "S",
  "ख्": "V",
  "ग्": "U",
  "घ्": "£",
  "ङ्": "ª\\",
  "च्": "R",
  "छ्": "5\\",
  "ज्": "H",
  "झ्": "¤",
  "ञ्": "~",
  "ट्": "6\\",
  "ठ्": "7\\",
  "ड्": "8\\",
  "ढ्": "9\\",
  "ण्": "0\\",
  "त्": "T",
  "थ्": "Y",
  "द्": "b\\",
  "ध्": "W",
  "न्": "G",
  "प्": "K",
  "फ्": "Km",
  "ब्": "A",
  "भ्": "E",
  "म्": "D",
  "य्": "o\\",
  "ल्": "N",
  "व्": "J",
  "श्": "Z",
  "ष्": "i\\",
  "स्": ":",
  "ह्": "X",

  // Matras & Punctuation
  "ा": "f",
  "ि": "l",
  "ी": "L",
  "ु": "'",
  "ू": "\"",
  "ृ": "[",
  "े": "]",
  "ै": "}",
  "ं": "+",
  "ँ": "F",
  "ः": "M",
  "्": "\\",
  "।": ".",

  // Digits (Nepali numerals -> Preeti ASCII)
  "०": ")",
  "१": "!",
  "२": "@",
  "३": "#",
  "४": "$",
  "५": "%",
  "६": "^",
  "७": "&",
  "८": "*",
  "९": "(",

  // Typographic Quotes
  "“": "æ",
  "”": "Æ",
  "’": "Ú",
  "‘": "…",
};

/**
 * Converts modern Devanagari Unicode text to legacy Preeti ASCII font representation.
 */
export function unicodeToPreeti(text: string): string {
  if (!text) return "";

  let res = text;

  // Step 1: Pre-process literal question mark and composite vowels
  res = res.replace(/\?/g, "<");
  res = res.replace(/ओ/g, "cf]");
  res = res.replace(/औ/g, "cf}");
  res = res.replace(/आ/g, "cf");
  res = res.replace(/ई/g, "O{");
  res = res.replace(/ऐ/g, "P]");
  res = res.replace(/ऊ/g, "pm");
  res = res.replace(/ऋ/g, "C");
  res = res.replace(/अ/g, "c");
  res = res.replace(/इ/g, "O");
  res = res.replace(/उ/g, "p");
  res = res.replace(/ए/g, "P");
  res = res.replace(/ॐ/g, "ç");

  // Step 2: Composite matras
  res = res.replace(/ौँ/g, "f}F");
  res = res.replace(/ों/g, "f]+");
  res = res.replace(/ो/g, "f]");
  res = res.replace(/ौ/g, "f}");

  // Step 3: Special ligatures and conjuncts (ordered by specificity)
  res = res.replace(/क्र/g, "qm");
  res = res.replace(/क्त/g, "Qm");
  res = res.replace(/ज्ञ्/g, "¡");
  res = res.replace(/ज्ञ/g, "1");
  res = res.replace(/त्र्/g, "q\\");
  res = res.replace(/त्र/g, "q");
  res = res.replace(/त्त/g, "Q");
  res = res.replace(/श्र/g, ">");
  res = res.replace(/क्ष्/g, "I");
  res = res.replace(/क्ष/g, "If");
  res = res.replace(/रू/g, "¿");
  res = res.replace(/रु/g, "?");
  res = res.replace(/द्द/g, "2");
  res = res.replace(/द्ध/g, "4");
  res = res.replace(/द्य/g, "B");
  res = res.replace(/द्व/g, "å");
  res = res.replace(/द्म/g, "ß");
  res = res.replace(/द्घ/g, "¢");
  res = res.replace(/ट्ट/g, "§");
  res = res.replace(/ठ्ठ/g, "¶");
  res = res.replace(/ड्ड/g, "•");
  res = res.replace(/ङ्क/g, "Í");
  res = res.replace(/ङ्ख/g, "Î");
  res = res.replace(/ङ्ग/g, "Ë");
  res = res.replace(/ङ्घ/g, "‹");
  res = res.replace(/ङ्ढ/g, "°");
  res = res.replace(/ङ/g, "ª");
  res = res.replace(/झ/g, "´");
  res = res.replace(/झ्/g, "¤");
  res = res.replace(/फ/g, "km");
  res = res.replace(/फ्/g, "Km");
  res = res.replace(/ध्र/g, "„");
  res = res.replace(/द्र/g, "›");
  res = res.replace(/र्‍/g, "¥");

  // Step 4: Handle Rakar (् + र -> |)
  res = res.replace(/्\s*र/g, "|");

  // Step 5: Handle Reph (र् at start of consonant cluster -> moves after cluster + matras as '{')
  const rephRegex = /र्((?:[\u0915-\u0939\u0958-\u095F]्)*[\u0915-\u0939\u0958-\u095F]|q|Q|1|2|4|å|ß|B|¢|§|¶|•|Í|Î|Ë|‹|°|ª|´|¤|km|Km|„|›|>|If|I|¿|\?)([\u093E-\u094C\u0901-\u0903f\]\}'\"\[FL\+M]*)/g;
  res = res.replace(rephRegex, "$1$2{");

  // Step 6: Handle chhoti i-kar 'ि' (moves BEFORE consonant / cluster as 'l')
  const ikarRegex = /((?:[\u0915-\u0939\u0958-\u095F]्)*[\u0915-\u0939\u0958-\u095F]|q|Q|1|2|4|å|ß|B|¢|§|¶|•|Í|Î|Ë|‹|°|ª|´|¤|km|Km|„|›|>|If|I|¿|\?)(?:\|)?ि/g;
  res = res.replace(ikarRegex, (match) => {
    // If rakar '|' was attached, preserve it after consonant: 'l' + base + '|'
    const clusterWithoutMatra = match.slice(0, -1);
    return "l" + clusterWithoutMatra;
  });

  // Step 7: Map remaining characters / half-letters
  let output = "";
  for (let i = 0; i < res.length; i++) {
    // Check two-character half consonant (char + halant)
    if (i + 1 < res.length && res[i + 1] === "्") {
      const pair = res[i] + "्";
      if (UNICODE_TO_PREETI_CHAR_MAP[pair] !== undefined) {
        output += UNICODE_TO_PREETI_CHAR_MAP[pair];
        i++;
        continue;
      }
    }

    const ch = res[i];
    output += UNICODE_TO_PREETI_CHAR_MAP[ch] !== undefined ? UNICODE_TO_PREETI_CHAR_MAP[ch] : ch;
  }

  return output;
}

/**
 * Helper to detect if a text contains Preeti encoding characteristics.
 */
export function isPreetiText(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  // If it has Devanagari Unicode characters, it's not Preeti
  if (/[\u0900-\u097F]/.test(text)) return false;
  // Preeti typically uses characters like ], }, |, {, +, f, l, etc. in clusters
  return /[g]kfn|[k]\||ljB|sfo\{|gd:t]/.test(text);
}
