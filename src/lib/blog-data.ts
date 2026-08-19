// ── Blog / Guides Data ──────────────────────────────────────────────────────
// Structured dataset for SEO-driven content articles and authoritative AdSense depth.
// Each article targets high-intent Nepali search queries and links directly to existing tools.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date string
  readingTime: string;
  category: string;
  toolSlugs: { slug: string; categorySlug: string; label: string }[];
  content: string; // Markdown-like HTML content
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "english-to-nepali-translation-guide",
    title: "English to Nepali Translation: Complete Guide, Common Phrases & Grammar Rules",
    description:
      "Master English to Nepali translation with essential conversational phrases, sentence structure (SOV vs SVO), honorific rules (Hajur, Tapai, Timi), and pronunciation tips.",
    date: "2026-08-16",
    readingTime: "8 min read",
    category: "Translation",
    toolSlugs: [
      { slug: "nepali-translator", categorySlug: "nepal", label: "English ↔ Nepali Translator" },
      { slug: "nepali-unicode", categorySlug: "nepal", label: "Nepali Unicode Typing Tool" },
    ],
    content: `
<div style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); padding: 16px 20px; border-radius: 14px; margin-bottom: 24px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; color: #DC2626;">🌐 Need Instant Translation?</h3>
  <p style="margin-bottom: 12px; font-size: 0.9rem; color: #52525B;">Translate full sentences between English and Nepali Devanagari with audio text-to-speech pronunciation on SajiloTools.</p>
  <a href="/tools/nepal/nepali-translator" style="display: inline-block; background-color: #DC2626; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Open English to Nepali Translator →</a>
  <a href="/tools/nepal/nepali-unicode" style="display: inline-block; margin-left: 12px; background-color: #FAFAF8; border: 1px solid #E4E0D8; color: #18181B; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Open Nepali Unicode Typing →</a>
</div>

<h2>Why English to Nepali Translation Matters</h2>
<p>Nepali (नेपाली) is the official language of Nepal, spoken by over 30 million people across Nepal, parts of India (Sikkim, Darjeeling, Assam), Bhutan, and the global diaspora. Whether you are a student, government job applicant, traveler, or professional preparing bilingual reports, accurate English-to-Nepali translation is vital.</p>

<h2>Sentence Structure: English (SVO) vs Nepali (SOV)</h2>
<p>The biggest hurdle in English to Nepali translation is word order:</p>
<ul>
  <li><strong>English uses Subject-Verb-Object (SVO):</strong> <em>I (Subject) eat (Verb) rice (Object).</em></li>
  <li><strong>Nepali uses Subject-Object-Verb (SOV):</strong> <em>म (Subject) भात (Object) खान्छु (Verb).</em></li>
</ul>
<p>In Nepali, verbs always appear at the end of the sentence. Adjectives and possessives precede the nouns they qualify (e.g. <em>मेरो नयाँ किताब</em> — "My new book").</p>

<h2>Nepali Levels of Politeness (Honorifics)</h2>
<p>English uses "You" for everyone, but Nepali has four distinct levels of respect:</p>
<table>
  <thead><tr><th>Pronoun</th><th>Devanagari</th><th>Politeness Level</th><th>When to Use</th></tr></thead>
  <tbody>
    <tr><td><strong>Hajur (हजुर)</strong></td><td>हजुर / यहाँ</td><td>High Honorific (Royal/Formal)</td><td>Elders, teachers, respected officials, guests</td></tr>
    <tr><td><strong>Tapai (तपाईं)</strong></td><td>तपाईं</td><td>Formal / Polite</td><td>Colleagues, strangers, parents, seniors</td></tr>
    <tr><td><strong>Timi (तिमी)</strong></td><td>तिमी</td><td>Informal / Friendly</td><td>Friends, younger siblings, close peers</td></tr>
    <tr><td><strong>Ta (तँ)</strong></td><td>तँ</td><td>Very Casual / Intimate</td><td>Very close childhood friends or pets</td></tr>
  </tbody>
</table>

<h2>Essential Everyday Phrases (English to Nepali Dictionary)</h2>
<table>
  <thead><tr><th>English Phrase</th><th>Nepali (Devanagari)</th><th>Pronunciation (Roman)</th></tr></thead>
  <tbody>
    <tr><td>Hello / Greetings</td><td>नमस्ते / नमस्कार</td><td>Namaste / Namaskar</td></tr>
    <tr><td>How are you?</td><td>तपाईंलाई कस्तो छ?</td><td>Tapailai kasto cha?</td></tr>
    <tr><td>I am fine.</td><td>मलाई सन्चै छ।</td><td>Malai sanchai cha.</td></tr>
    <tr><td>Thank you very much.</td><td>धेरै धेरै धन्यवाद।</td><td>Dherai dherai dhanyabad.</td></tr>
    <tr><td>What is your name?</td><td>तपाईंको नाम के हो?</td><td>Tapai ko naam ke ho?</td></tr>
    <tr><td>My name is Nabin.</td><td>मेरो नाम नविन हो।</td><td>Mero naam Nabin ho.</td></tr>
    <tr><td>Where is the bus station?</td><td>बस स्टेशन कहाँ छ?</td><td>Bus station kaha cha?</td></tr>
    <tr><td>How much does this cost?</td><td>यसको कति पर्छ?</td><td>Yesko kati parcha?</td></tr>
    <tr><td>Goodbye / See you again.</td><td>फेरि भेटौँला।</td><td>Pheri bhetaula.</td></tr>
  </tbody>
</table>

<h2>Translation vs Unicode Transliteration</h2>
<p>Many users confuse <strong>translation</strong> with <strong>Unicode typing (transliteration)</strong>:</p>
<ul>
  <li><strong>Translation:</strong> Converting meaning (e.g. typing "Good morning" → outputting "शुभ प्रभात"). Use our <a href="/tools/nepal/nepali-translator">English ↔ Nepali Translator</a>.</li>
  <li><strong>Transliteration (Unicode):</strong> Converting English letters into Nepali script phonetically (e.g. typing "dhanyabad" → outputting "धन्यवाद"). Use our <a href="/tools/nepal/nepali-unicode">Nepali Unicode Tool</a>.</li>
</ul>
    `,
  },
  {
    slug: "nepali-unicode-typing-guide",
    title: "Nepali Unicode Typing: Fast Devanagari Typing on Mobile & PC (Romanized vs Traditional)",
    description:
      "Learn how to type in Nepali Devanagari smoothly using Romanized Nepali Unicode. Complete character mapping chart, key shortcuts, and troubleshooting tips.",
    date: "2026-08-14",
    readingTime: "7 min read",
    category: "Nepal",
    toolSlugs: [
      { slug: "nepali-unicode", categorySlug: "nepal", label: "Nepali Unicode Typing Tool" },
      { slug: "preeti-to-unicode", categorySlug: "nepal", label: "Preeti to Unicode Converter" },
    ],
    content: `
<div style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); padding: 16px 20px; border-radius: 14px; margin-bottom: 24px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; color: #DC2626;">⌨️ Type Nepali Instantly in Your Browser</h3>
  <p style="margin-bottom: 12px; font-size: 0.9rem; color: #52525B;">Type phonetic English letters (e.g. 'nepal') to produce clean Nepali Devanagari ('नेपाल') without installing complex software.</p>
  <a href="/tools/nepal/nepali-unicode" style="display: inline-block; background-color: #DC2626; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Launch Nepali Unicode Tool →</a>
</div>

<h2>What is Nepali Unicode?</h2>
<p>Nepali Unicode is the international standard encoding system (UTF-8) for writing Devanagari script digitally. Unlike legacy fonts (like Preeti or Kantipur) that require specialized fonts installed on your computer, <strong>Unicode text renders universally</strong> across all modern smartphones, Facebook, websites, government portals, and search engines.</p>

<h2>Romanized vs Traditional Unicode Layouts</h2>
<ul>
  <li><strong>Romanized Unicode:</strong> Types phonetically according to English sounds (e.g., "k" for क, "kh" for ख, "g" for ग). Perfect for everyday users, chat, social media, and bloggers.</li>
  <li><strong>Traditional Unicode:</strong> Mirrors the mechanical typewriter/Preeti keyboard layout. Preferred by professional typists in government offices and legal courts.</li>
</ul>

<h2>Phonetic Romanized Character Mapping</h2>
<table>
  <thead><tr><th>Roman Key</th><th>Nepali Letter</th><th>Example Word</th></tr></thead>
  <tbody>
    <tr><td>a / aa</td><td>अ / आ</td><td>aama → आमा</td></tr>
    <tr><td>i / ee</td><td>इ / ई</td><td>ishwor → ईश्वर</td></tr>
    <tr><td>u / oo</td><td>उ / ऊ</td><td>ujyalo → उज्यालो</td></tr>
    <tr><td>k / kh</td><td>क / ख</td><td>khabar → खबर</td></tr>
    <tr><td>g / gh</td><td>ग / घ</td><td>ghar → घर</td></tr>
    <tr><td>ch / chh</td><td>च / छ</td><td>chithi → चिठी</td></tr>
    <tr><td>j / jh</td><td>ज / झ</td><td>jhanda → झण्डा</td></tr>
    <tr><td>t / th</td><td>त / थ</td><td>thali → थाली</td></tr>
    <tr><td>T / Th (Capital)</td><td>ट / ठ</td><td>Topi → टोपी</td></tr>
    <tr><td>d / dh</td><td>द / ध</td><td>dharti → धर्ती</td></tr>
    <tr><td>D / Dh (Capital)</td><td>ड / ढ</td><td>Dulo → दुलो</td></tr>
    <tr><td>n / N</td><td>न / ण</td><td>namaste → नमस्ते</td></tr>
    <tr><td>p / ph (f)</td><td>प / फ</td><td>phool → फूल</td></tr>
    <tr><td>b / bh</td><td>ब / भ</td><td>bhat → भात</td></tr>
    <tr><td>m / y / r / l / w / s / h</td><td>म / य / र / ल / व / स / ह</td><td>maya → माया</td></tr>
  </tbody>
</table>

<h2>Conjuncts & Half Letters (हलन्त / अद्धा अक्षर)</h2>
<p>To type conjunct consonants (such as <em>क्र</em>, <em>प्र</em>, <em>स्ट</em>, or <em>न्ध</em>), Romanized Unicode handles them by typing consecutive consonants without vowels:</p>
<ul>
  <li><strong>namaste</strong> → न + म + स् + ते = <strong>नमस्ते</strong></li>
  <li><strong>kranti</strong> → क् + रा + न् + ति = <strong>क्रान्ति</strong></li>
  <li><strong>shanti</strong> → शा + न् + ति = <strong>शान्ति</strong></li>
</ul>
    `,
  },
  {
    slug: "preeti-to-unicode-font-guide",
    title: "Preeti to Unicode & Unicode to Preeti: Complete Font Conversion Guide",
    description:
      "Convert old legacy Nepali font text (Preeti, Kantipur) to standard Unicode and vice-versa. Fix garbled font errors in Word documents and government forms.",
    date: "2026-08-12",
    readingTime: "6 min read",
    category: "Nepal",
    toolSlugs: [
      { slug: "preeti-to-unicode", categorySlug: "nepal", label: "Preeti to Unicode Converter" },
      { slug: "unicode-to-preeti", categorySlug: "nepal", label: "Unicode to Preeti Converter" },
    ],
    content: `
<div style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); padding: 16px 20px; border-radius: 14px; margin-bottom: 24px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; color: #DC2626;">🔄 Convert Preeti to Unicode in 1-Click</h3>
  <p style="margin-bottom: 12px; font-size: 0.9rem; color: #52525B;">Paste your legacy Preeti or Kantipur text to convert it into web-standard Nepali Unicode instantly.</p>
  <a href="/tools/nepal/preeti-to-unicode" style="display: inline-block; background-color: #DC2626; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Convert Preeti to Unicode →</a>
  <a href="/tools/nepal/unicode-to-preeti" style="display: inline-block; margin-left: 12px; background-color: #FAFAF8; border: 1px solid #E4E0D8; color: #18181B; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Convert Unicode to Preeti →</a>
</div>

<h2>Why Preeti Font Text Breaks on the Web</h2>
<p>Preeti and Kantipur are ASCII-based legacy fonts created in the early 1990s. They work by hijacking standard Latin character codes and displaying Nepali glyphs. If a device does not have the Preeti TTF font installed, the text appears as random garbled characters like <em>"g]kfn"</em> instead of <em>"नेपाल"</em>.</p>

<h2>Why Modern Systems Require Unicode</h2>
<ul>
  <li><strong>Searchable:</strong> Google, Bing, and internal databases cannot index ASCII font glyphs. Unicode is fully searchable.</li>
  <li><strong>Universal Compatibility:</strong> Displays correctly on iPhones, Android phones, Mac, Linux, and Windows without installing any font.</li>
  <li><strong>Government Standards:</strong> Public Service Commission (Lok Sewa Aayog), Passport Department, and Nagarik App require Unicode Devanagari input.</li>
</ul>

<h2>Common Font Mapping Pairs</h2>
<table>
  <thead><tr><th>Preeti Input</th><th>Converted Unicode</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td>g]kfn</td><td>नेपाल</td><td>Nepal</td></tr>
    <tr><td>s7df8f}+</td><td>काठमाडौँ</td><td>Kathmandu</td></tr>
    <tr><td>;lhnf]</td><td>सजिलो</td><td>Easy (Sajilo)</td></tr>
    <tr><td>wGojfb</td><td>धन्यवाद</td><td>Thank you</td></tr>
    <tr><td>gd:t]</td><td>नमस्ते</td><td>Namaste</td></tr>
  </tbody>
</table>
    `,
  },
  {
    slug: "nepal-income-tax-slabs-guide",
    title: "Nepal Income Tax Slabs & Salary TDS Guide (FY 2083/84 & 2082/83)",
    description:
      "Complete breakdown of Nepal's updated FY 2083/84 unified income tax slabs, historical FY 2082/83 comparison, Social Security Fund (SSF) rules, and step-by-step salary TDS calculations.",
    date: "2026-08-02",
    readingTime: "9 min read",
    category: "Finance",
    toolSlugs: [
      { slug: "tax-calculator", categorySlug: "finance", label: "Income Tax Calculator" },
      { slug: "pf-calculator", categorySlug: "finance", label: "Provident Fund (SSF/EPF) Calculator" },
    ],
    content: `
<div style="background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); padding: 14px 18px; border-radius: 12px; margin-bottom: 24px;">
  <p style="margin: 0; font-size: 0.95rem;">
    <strong>🔔 Updated Fiscal Year 2083/84:</strong> Reflects the personal income tax overhaul delivered in the Budget Speech on 15 Jestha 2083, effective 1 Shrawan 2083 onward.
  </p>
</div>

<div style="background-color: rgba(31, 37, 68, 0.05); border: 1px solid rgba(31, 37, 68, 0.15); padding: 16px 20px; border-radius: 14px; margin-bottom: 28px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; color: #1F2544;">🧮 Calculate Your Exact Tax & Take-Home Pay Instantly</h3>
  <p style="margin-bottom: 12px; font-size: 0.9rem; color: #52525B;">Use our free, instant <strong>Nepal Income Tax & Salary TDS Calculator</strong> to calculate your exact monthly TDS, deductions (EPF/CIT/SSF), and net take-home salary.</p>
  <a href="/tools/finance/tax-calculator" style="display: inline-block; background-color: #1F2544; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Open Nepal Tax Calculator →</a>
  <a href="/tools/finance/emi-calculator" style="display: inline-block; margin-left: 12px; background-color: #FAFAF8; border: 1px solid #E4E0D8; color: #18181B; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Open EMI Calculator →</a>
</div>

<h2>What Changed in FY 2083/84 Income Tax Rates?</h2>
<p>Nepal's fiscal year rolled over to <strong>2083/84</strong> on 1 Shrawan 2083. The government introduced three major structural changes to personal income tax (TDS):</p>
<ul>
  <li><strong>Unification of Slabs:</strong> The longstanding split between married and unmarried filers has been <strong>completely unified</strong> for all resident individual taxpayers.</li>
  <li><strong>Doubled 1% SST Threshold:</strong> The initial 1% Social Security Tax (SST) threshold doubled from NPR 5,00,000 to <strong>NPR 10,00,000</strong>.</li>
  <li><strong>Lower Top Marginal Rate:</strong> The highest tax bracket has been reduced from 39% down to <strong>29%</strong> for annual incomes above NPR 40,00,000.</li>
</ul>

<h2>Current Income Tax Slabs — FY 2083/84 (2026/27)</h2>
<table>
<thead><tr><th>Income Slab (NPR)</th><th>Tax Rate</th><th>Key Notes</th></tr></thead>
<tbody>
<tr><td>First 10,00,000 (0 – 10L)</td><td>1%</td><td>Waived (0%) for registered Social Security Fund (SSF) contributors</td></tr>
<tr><td>Next 5,00,000 (10L – 15L)</td><td>10%</td><td>Applied on taxable income between 10 Lakhs and 15 Lakhs</td></tr>
<tr><td>Next 10,00,000 (15L – 25L)</td><td>20%</td><td>Applied on taxable income between 15 Lakhs and 25 Lakhs</td></tr>
<tr><td>Next 15,00,000 (25L – 40L)</td><td>27%</td><td>Applied on taxable income between 25 Lakhs and 40 Lakhs</td></tr>
<tr><td>Above 40,00,000 (> 40L)</td><td>29%</td><td>Top marginal tax rate</td></tr>
</tbody>
</table>

<h2>Social Security Fund (SSF) Tax Relief</h2>
<p>If your employer is registered with SSF, the employee's 11% contribution is tax-deductible before slab application, and the 1% Social Security Tax on the first NPR 10,00,000 slab is <strong>fully exempt (0%)</strong>.</p>
    `,
  },
  {
    slug: "nepali-land-measurement-guide",
    title: "Ropani, Aana, Bigha, Kattha — Complete Nepali Land Measurement Guide",
    description:
      "Understand Nepal's two land measurement systems (Ropani/Aana for hills, Bigha/Kattha for Terai), exact conversion factors, and how they map to square feet and square meters.",
    date: "2025-07-27",
    readingTime: "6 min read",
    category: "Nepal",
    toolSlugs: [
      { slug: "land-converter", categorySlug: "nepal", label: "Land Unit Converter" },
    ],
    content: `
<h2>Two Systems, One Country</h2>
<p>Nepal uses <strong>two completely different land measurement systems</strong> depending on geography:</p>
<ul>
<li><strong>Ropani-Aana-Paisa-Dam</strong> — used in the hills and mountains (Kathmandu, Pokhara, etc.)</li>
<li><strong>Bigha-Kattha-Dhur</strong> — used in the Terai/plains (Birgunj, Janakpur, Biratnagar, Chitwan, etc.)</li>
</ul>

<h2>Hill System: Ropani-Aana-Paisa-Dam</h2>
<table>
<thead><tr><th>Unit</th><th>Subdivision</th><th>Sq. Feet</th><th>Sq. Meters</th></tr></thead>
<tbody>
<tr><td>1 Ropani</td><td>= 16 Aana</td><td>5,476</td><td>508.74</td></tr>
<tr><td>1 Aana</td><td>= 4 Paisa</td><td>342.25</td><td>31.80</td></tr>
<tr><td>1 Paisa</td><td>= 4 Dam</td><td>85.56</td><td>7.95</td></tr>
<tr><td>1 Dam</td><td>—</td><td>21.39</td><td>1.99</td></tr>
</tbody>
</table>

<h2>Terai System: Bigha-Kattha-Dhur</h2>
<table>
<thead><tr><th>Unit</th><th>Subdivision</th><th>Sq. Feet</th><th>Sq. Meters</th></tr></thead>
<tbody>
<tr><td>1 Bigha</td><td>= 20 Kattha</td><td>72,900</td><td>6,772.63</td></tr>
<tr><td>1 Kattha</td><td>= 20 Dhur</td><td>3,645</td><td>338.63</td></tr>
<tr><td>1 Dhur</td><td>—</td><td>182.25</td><td>16.93</td></tr>
</tbody>
</table>

<h2>Cross-System Conversion</h2>
<p>1 Bigha = 72,900 sq ft ÷ 5,476 sq ft/ropani ≈ <strong>13.31 Ropani</strong></p>
<p>Conversely, 1 Ropani ≈ <strong>0.0751 Bigha</strong> (1.5 Kattha approx.)</p>
    `,
  },
  {
    slug: "bikram-sambat-calendar-guide",
    title: "Bikram Sambat (BS) vs AD — How Nepali Dates & Calendar Work",
    description:
      "Everything you need to know about Nepal's official Bikram Sambat calendar: why it's ~57 years ahead of AD, how months and days differ, and how to convert between BS and AD dates.",
    date: "2025-07-26",
    readingTime: "5 min read",
    category: "Nepal",
    toolSlugs: [
      { slug: "nepali-date-converter", categorySlug: "nepal", label: "Nepali Date Converter" },
      { slug: "nepali-calendar", categorySlug: "nepal", label: "Nepali Calendar (BS)" },
    ],
    content: `
<h2>What is Bikram Sambat?</h2>
<p>Nepal uses the <strong>Bikram Sambat (B.S. / वि.सं.)</strong> calendar as its official civil calendar — a solar sidereal calendar approximately <strong>56 years and 8.5 months ahead</strong> of the Gregorian calendar (AD).</p>

<h2>The 12 Nepali Months</h2>
<ol>
<li><strong>Baisakh</strong> (वैशाख) — mid-Apr to mid-May</li>
<li><strong>Jestha</strong> (जेठ) — mid-May to mid-Jun</li>
<li><strong>Ashadh</strong> (असार) — mid-Jun to mid-Jul</li>
<li><strong>Shrawan</strong> (साउन) — mid-Jul to mid-Aug</li>
<li><strong>Bhadra</strong> (भदौ) — mid-Aug to mid-Sep</li>
<li><strong>Ashwin</strong> (असोज) — mid-Sep to mid-Oct</li>
<li><strong>Kartik</strong> (कात्तिक) — mid-Oct to mid-Nov</li>
<li><strong>Mangsir</strong> (मंसिर) — mid-Nov to mid-Dec</li>
<li><strong>Poush</strong> (पुस) — mid-Dec to mid-Jan</li>
<li><strong>Magh</strong> (माघ) — mid-Jan to mid-Feb</li>
<li><strong>Falgun</strong> (फागुन) — mid-Feb to mid-Mar</li>
<li><strong>Chaitra</strong> (चैत) — mid-Mar to mid-Apr</li>
</ol>

<h2>Why Can't You Just Add 57?</h2>
<p>A common misconception is that converting BS to AD is simply "subtract 57." This gives you a rough year, but the <strong>month and day will be wrong</strong> because BS months vary between 29 and 32 days each year based on astronomical solar transitions.</p>
    `,
  },
  {
    slug: "gold-silver-rate-nepal-guide",
    title: "How Gold & Silver Prices are Calculated in Nepal: Tola, Lal, Gram, Jarti & Jyala Guide",
    description:
      "Learn how jewellery stores in Nepal calculate gold price per tola, making charges (jyala), wastage (jarti), and how 24K and 22K hallmarked rates work.",
    date: "2026-08-10",
    readingTime: "6 min read",
    category: "Finance",
    toolSlugs: [
      { slug: "gold-silver-calculator", categorySlug: "finance", label: "Gold & Silver Calculator" },
    ],
    content: `
<div style="background-color: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.25); padding: 16px 20px; border-radius: 14px; margin-bottom: 24px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; color: #22C55E;">👑 Calculate Real Gold & Silver Prices</h3>
  <p style="margin-bottom: 12px; font-size: 0.9rem; color: #52525B;">Calculate total jewellery cost including Tola weight, Lal, Jarti (wastage), and Jyala (making charge) instantly.</p>
  <a href="/tools/finance/gold-silver-calculator" style="display: inline-block; background-color: #22C55E; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Open Gold & Silver Calculator →</a>
</div>

<h2>Understanding Nepali Gold Weight Units</h2>
<ul>
  <li><strong>1 Tola (तोला) = 11.6638 grams</strong> = 100 Lal (लाल)</li>
  <li><strong>1 Lal (लाल) = 0.1166 gram</strong> (1/100th of a tola)</li>
  <li><strong>1 Aana (Gold) = 6.25 Lal</strong> = 0.729 gram</li>
  <li><strong>10 Grams = 0.857 Tola</strong></li>
</ul>

<h2>The 4 Components of Jewellery Billing</h2>
<ol>
  <li><strong>Base Gold Value:</strong> Weight (in Tola or Grams) × Today's FENEGOSIDA Hallmark 24K / Tejabi 22K rate.</li>
  <li><strong>Jarti (Wastage / जर्ती):</strong> Gold lost during melting and soldering (typically 3% to 12% depending on intricacy).</li>
  <li><strong>Jyala (Making Charge / ज्याला):</strong> Artisan labour fee per piece or per tola.</li>
  <li><strong>Stone / Gem Weight:</strong> Must always be weighed separately and deducted from net gold weight.</li>
</ol>
    `,
  },
  {
    slug: "nepali-number-to-words-cheque-guide",
    title: "How to Convert Numbers to Nepali Words (Lakh & Crore) for Bank Cheques & Legal Vouchers",
    description:
      "Guide on writing numbers in words in Nepali (Lakh, Crore, Arab) and English for bank cheques, tax invoices, and legal contracts without formatting errors.",
    date: "2026-08-08",
    readingTime: "5 min read",
    category: "Finance",
    toolSlugs: [
      { slug: "nepali-number-words", categorySlug: "nepal", label: "Nepali Number to Words" },
    ],
    content: `
<div style="background-color: rgba(220, 38, 38, 0.08); border: 1px solid rgba(220, 38, 38, 0.25); padding: 16px 20px; border-radius: 14px; margin-bottom: 24px;">
  <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 1.1rem; color: #DC2626;">✍️ Convert Number to Cheque Words Instantly</h3>
  <p style="margin-bottom: 12px; font-size: 0.9rem; color: #52525B;">Enter numeric amounts (e.g. 15,25,000) to get official Nepali Devanagari and English words for cheque writing.</p>
  <a href="/tools/nepal/nepali-number-words" style="display: inline-block; background-color: #DC2626; color: #ffffff; padding: 8px 16px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 0.85rem;">Open Number to Words Converter →</a>
</div>

<h2>South Asian Numbering System vs Western System</h2>
<p>Unlike the Western numbering system which groups numbers in triplets (Thousands, Millions, Billions), Nepal uses the Vedic system:</p>
<table>
  <thead><tr><th>Number</th><th>Nepali Term</th><th>Western Term</th></tr></thead>
  <tbody>
    <tr><td>1,000</td><td>हजार (One Thousand)</td><td>1 Thousand</td></tr>
    <tr><td>1,00,000</td><td>लाख (One Lakh)</td><td>100 Thousand</td></tr>
    <tr><td>1,00,00,000</td><td>करोड (One Crore)</td><td>10 Million</td></tr>
    <tr><td>1,00,00,00,000</td><td>अर्ब (One Arab)</td><td>1 Billion</td></tr>
    <tr><td>1,00,00,00,00,000</td><td>खर्ब (One Kharab)</td><td>100 Billion</td></tr>
  </tbody>
</table>

<h2>Cheque Writing Best Practices</h2>
<ul>
  <li>Always add <strong>"Only"</strong> (मात्र) at the end of the written amount to prevent fraudulent additions.</li>
  <li>Ensure commas match the 2-2-3 grouping: e.g. <em>NPR 25,50,000/-</em>.</li>
</ul>
    `,
  },
  {
    slug: "vehicle-road-tax-nepal-guide",
    title: "Nepal Vehicle Road Tax Guide: 2-Wheeler & 4-Wheeler Provincial Rates, Renewal & Fines",
    description:
      "Complete guide to annual vehicle road tax (sawari kar) rates across Bagmati and other provinces for motorbikes, scooters, cars, and EVs with late renewal penalty calculations.",
    date: "2026-08-05",
    readingTime: "7 min read",
    category: "Finance",
    toolSlugs: [
      { slug: "vehicle-tax-calculator", categorySlug: "finance", label: "Vehicle Road Tax Calculator" },
    ],
    content: `
<h2>Understanding Vehicle Tax in Nepal</h2>
<p>Vehicle road tax in Nepal is determined at the provincial level by the Ministry of Physical Infrastructure and Transport (Yatayat Bebastha Karyalaya). Taxes vary based on engine displacement (CC) or electric motor kilowatt (kW) ratings.</p>

<h2>Bagmati Province 2-Wheeler Tax Slabs</h2>
<table>
  <thead><tr><th>Engine Capacity (CC)</th><th>Annual Road Tax (NPR)</th></tr></thead>
  <tbody>
    <tr><td>Up to 125 CC</td><td>NPR 3,000</td></tr>
    <tr><td>126 CC to 160 CC</td><td>NPR 4,500</td></tr>
    <tr><td>161 CC to 250 CC</td><td>NPR 6,000</td></tr>
    <tr><td>251 CC to 400 CC</td><td>NPR 11,500</td></tr>
    <tr><td>401 CC and above</td><td>NPR 22,000</td></tr>
  </tbody>
</table>

<h2>Renewal Deadlines & Fines</h2>
<p>Bluebook road taxes must be renewed within the fiscal year or within 90 days of expiration. Late renewals incur escalating fines: 5% in first 30 days, 10% in next 45 days, 20% by end of fiscal year, and up to 100% compound penalties for multi-year overdue renewals.</p>
    `,
  },
  {
    slug: "nepal-vat-pan-billing-guide",
    title: "Nepal 13% VAT & PAN Billing Guide: Invoicing Rules, Tax Calculations & Exemptions",
    description:
      "Everything businesses and freelancers need to know about Nepal's 13% Value Added Tax (VAT), tax invoices, VAT-inclusive vs exclusive price math, and PAN registration rules.",
    date: "2026-08-01",
    readingTime: "6 min read",
    category: "Finance",
    toolSlugs: [
      { slug: "vat-calculator", categorySlug: "finance", label: "Nepal VAT Calculator" },
    ],
    content: `
<h2>What is Nepal Value Added Tax (VAT)?</h2>
<p>Value Added Tax (VAT) in Nepal is a multi-stage consumption tax levied at a flat statutory rate of <strong>13%</strong> on taxable goods and services, administered by the Inland Revenue Department (IRD).</p>

<h2>VAT Mathematics: Adding vs Removing 13%</h2>
<ul>
  <li><strong>Adding 13% VAT to Net Price:</strong> Gross = Net × 1.13</li>
  <li><strong>Extracting 13% VAT from Gross Price:</strong> Net = Gross ÷ 1.13, VAT Amount = Gross − Net</li>
</ul>

<h2>PAN vs VAT Registration Thresholds</h2>
<p>Any business engaging in commercial activities must obtain a Permanent Account Number (PAN). Businesses dealing in taxable goods must register for VAT if annual turnover exceeds NPR 50 Lakhs (Goods) or NPR 20 Lakhs (Services & Consultancies).</p>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
