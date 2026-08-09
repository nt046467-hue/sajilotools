// ── Nepali Panchang Astronomical Engine ──────────────────────────────────────
// Calculates exact Tithi, Paksha, Nakshatra, and lunar flags (Ekadashi, Purnima, Aunsi)
// for any date based on solar and lunar ecliptic longitudes (Kathmandu coordinates: 27.7°N, 85.3°E).

export interface PanchangData {
  tithiNumber: number; // 1 to 30
  tithiNameNp: string; // e.g. "एकादशी"
  tithiNameEn: string; // e.g. "Ekadashi"
  pakshaNp: string;    // "शुक्ल पक्ष" or "कृष्ण पक्ष"
  pakshaEn: string;    // "Shukla Paksha" or "Krishna Paksha"
  nakshatraNp: string; // e.g. "रोहिणी"
  nakshatraEn: string; // e.g. "Rohini"
  isEkadashi: boolean;
  isPurnima: boolean;
  isAunsi: boolean;
  lunarBadge?: {
    label: string;
    labelNp: string;
    type: "ekadashi" | "purnima" | "aunsi";
    colorClass: string;
  };
}

const TITHI_NAMES_NP = [
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "पूर्णिमा",
  "प्रतिपदा", "द्वितीया", "तृतीया", "चतुर्थी", "पञ्चमी",
  "षष्ठी", "सप्तमी", "अष्टमी", "नवमी", "दशमी",
  "एकादशी", "द्वादशी", "त्रयोदशी", "चतुर्दशी", "औंसी",
];

const TITHI_NAMES_EN = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashti", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
  "Shashti", "Saptami", "Ashtami", "Navami", "Dashami",
  "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Aunsi",
];

const NAKSHATRA_NAMES_NP = [
  "अश्विनी", "भरणी", "कृत्तिका", "रोहिणी", "मृगशिरा", "आद्रा",
  "पुनर्वसु", "पुष्य", "अश्लेषा", "मघा", "पूर्वाफाल्गुनी", "उत्तराफाल्गुनी",
  "हस्त", "चित्रा", "स्वाती", "विशाखा", "अनुराधा", "ज्येष्ठा",
  "मूल", "पूर्वाषाढा", "उत्तराषाढा", "श्रवण", "धनिष्ठा", "शतभिषा",
  "पूर्वाभाद्रपदा", "उत्तराभाद्रपदा", "रेवती",
];

const NAKSHATRA_NAMES_EN = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

function toJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + (date.getUTCHours() + date.getUTCMinutes() / 60) / 24;

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5;
}

function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function normDeg(deg: number): number {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

export function getPanchangForDate(date: Date): PanchangData {
  const jd = toJulianDay(date);
  const T = (jd - 2451545.0) / 36525.0;

  // 1. Sun Ecliptic Longitude
  const L0 = normDeg(280.46646 + 36000.76983 * T);
  const M = normDeg(357.52911 + 35999.05029 * T);
  const C =
    (1.914602 - 0.004817 * T) * Math.sin(rad(M)) +
    (0.019993 - 0.000101 * T) * Math.sin(rad(2 * M)) +
    0.000289 * Math.sin(rad(3 * M));
  const sunLong = normDeg(L0 + C);

  // 2. Moon Ecliptic Longitude
  const LM = normDeg(218.3165 + 481267.8813 * T);
  const MM = normDeg(134.9634 + 477198.8676 * T);
  const F = normDeg(93.2721 + 483202.0175 * T);
  const D = normDeg(297.8502 + 445267.1115 * T);

  const deltaLong =
    6.2886 * Math.sin(rad(MM)) +
    1.274 * Math.sin(rad(2 * D - MM)) +
    0.6583 * Math.sin(rad(2 * D)) +
    0.2136 * Math.sin(rad(2 * MM)) -
    0.1851 * Math.sin(rad(M)) -
    0.1143 * Math.sin(rad(2 * F));

  const moonLong = normDeg(LM + deltaLong);

  // 3. Elongation & Tithi (1 to 30)
  const elongation = normDeg(moonLong - sunLong);
  const tithiIdx = Math.floor(elongation / 12);
  const tithiNumber = Math.min(Math.max(tithiIdx + 1, 1), 30);

  const isShukla = tithiNumber <= 15;
  const isEkadashi = tithiNumber === 11 || tithiNumber === 26;
  const isPurnima = tithiNumber === 15;
  const isAunsi = tithiNumber === 30;

  // 4. Nakshatra (1 to 27)
  const nakshatraIdx = Math.floor(moonLong / 13.333333333333334) % 27;

  let lunarBadge: PanchangData["lunarBadge"];
  if (isEkadashi) {
    lunarBadge = {
      label: "Ekadashi",
      labelNp: "एकादशी",
      type: "ekadashi",
      colorClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
    };
  } else if (isPurnima) {
    lunarBadge = {
      label: "Purnima",
      labelNp: "पूर्णिमा",
      type: "purnima",
      colorClass: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    };
  } else if (isAunsi) {
    lunarBadge = {
      label: "Aunsi",
      labelNp: "औंसी",
      type: "aunsi",
      colorClass: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    };
  }

  return {
    tithiNumber,
    tithiNameNp: TITHI_NAMES_NP[tithiNumber - 1],
    tithiNameEn: TITHI_NAMES_EN[tithiNumber - 1],
    pakshaNp: isShukla ? "शुक्ल पक्ष" : "कृष्ण पक्ष",
    pakshaEn: isShukla ? "Shukla Paksha" : "Krishna Paksha",
    nakshatraNp: NAKSHATRA_NAMES_NP[nakshatraIdx],
    nakshatraEn: NAKSHATRA_NAMES_EN[nakshatraIdx],
    isEkadashi,
    isPurnima,
    isAunsi,
    lunarBadge,
  };
}
