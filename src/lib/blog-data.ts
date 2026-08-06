// ── Blog / Guides Data ──────────────────────────────────────────────────────
// Structured dataset for SEO-driven content articles.
// Each article targets high-intent Nepali search queries and links to existing tools.

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
    <strong>🔔 Updated 2 August 2026:</strong> Reflects the major personal income tax overhaul for <strong>Fiscal Year 2083/84 (2026/27)</strong> delivered in the Budget Speech on 15 Jestha 2083 (29 May 2026) by Finance Minister Dr. Swarnim Wagle, effective 1 Shrawan 2083 (16 July 2026) onward.
  </p>
</div>

<h2>What Changed in FY 2083/84 Income Tax Rates?</h2>
<p>Nepal's fiscal year rolled over to <strong>2083/84</strong> on 1 Shrawan 2083. The government introduced three major structural changes to personal income tax (TDS):</p>
<ul>
  <li><strong>Unification of Slabs:</strong> The longstanding split between married and unmarried filers has been <strong>completely removed</strong>. One unified slab table now applies to all individual resident taxpayers.</li>
  <li><strong>Doubled 1% SST Threshold:</strong> The initial 1% Social Security Tax (SST) threshold doubled from NPR 5,00,000 to <strong>NPR 10,00,000</strong>.</li>
  <li><strong>Lower Top Marginal Rate:</strong> The highest tax bracket has been reduced from 39% down to <strong>29%</strong> for annual incomes above NPR 40,00,000.</li>
</ul>

<h2>Current Income Tax Slabs — FY 2083/84 (2026/27)</h2>
<p>Applicable to all resident individuals (salaried & sole proprietors) from 1 Shrawan 2083 onward:</p>
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

<h2>Side-by-Side Comparison: FY 2082/83 vs FY 2083/84</h2>
<table>
<thead><tr><th>Parameter</th><th>FY 2082/83 (Historical)</th><th>FY 2083/84 (Current)</th></tr></thead>
<tbody>
<tr><td><strong>Marital Split</strong></td><td>Separate tables for Single vs Married</td><td><strong>Unified for all individuals</strong></td></tr>
<tr><td><strong>1% SST Threshold</strong></td><td>NPR 5,00,000 (Single) / NPR 6,00,000 (Married)</td><td><strong>NPR 10,00,000</strong></td></tr>
<tr><td><strong>Middle Slabs</strong></td><td>10%, 20%, 30%, 36%</td><td><strong>10%, 20%, 27%</strong></td></tr>
<tr><td><strong>Top Marginal Rate</strong></td><td>39% (Above 50 Lakhs)</td><td><strong>29% (Above 40 Lakhs)</strong></td></tr>
</tbody>
</table>

<h2>Archived FY 2082/83 Slabs (For Reference & Assessment up to 31 Ashadh 2083)</h2>
<p>Income earned during FY 2082/83 (ending 15 July 2026) remains subject to the historical slab structure:</p>
<h3>Unmarried Individuals (FY 2082/83)</h3>
<table>
<thead><tr><th>Income Slab (NPR)</th><th>Tax Rate</th></tr></thead>
<tbody>
<tr><td>First 5,00,000</td><td>1%</td></tr>
<tr><td>Next 2,00,000 (5L–7L)</td><td>10%</td></tr>
<tr><td>Next 3,00,000 (7L–10L)</td><td>20%</td></tr>
<tr><td>Next 10,00,000 (10L–20L)</td><td>30%</td></tr>
<tr><td>Next 30,00,000 (20L–50L)</td><td>36%</td></tr>
<tr><td>Above 50,00,000</td><td>39%</td></tr>
</tbody>
</table>

<h3>Married Individuals (FY 2082/83)</h3>
<table>
<thead><tr><th>Income Slab (NPR)</th><th>Tax Rate</th></tr></thead>
<tbody>
<tr><td>First 6,00,000</td><td>1%</td></tr>
<tr><td>Next 2,00,000 (6L–8L)</td><td>10%</td></tr>
<tr><td>Next 3,00,000 (8L–11L)</td><td>20%</td></tr>
<tr><td>Next 9,00,000 (11L–20L)</td><td>30%</td></tr>
<tr><td>Next 30,00,000 (20L–50L)</td><td>36%</td></tr>
<tr><td>Above 50,00,000</td><td>39%</td></tr>
</tbody>
</table>

<h2>Social Security Fund (SSF) Tax Relief</h2>
<p>If your employer is registered with SSF, the employee's 11% contribution is tax-deductible before slab application, and the 1% Social Security Tax on the first NPR 10,00,000 slab is <strong>fully exempt (0%)</strong>.</p>

<h2>Example Calculation (FY 2083/84 Rates)</h2>
<p>Assume an individual earns <strong>NPR 1,20,000/month</strong> (NPR 14,40,000/year) and contributes 11% to SSF:</p>
<ol>
  <li><strong>Annual Gross Salary:</strong> NPR 14,40,000</li>
  <li><strong>SSF Deduction (11%):</strong> NPR 1,58,400</li>
  <li><strong>Taxable Base Income:</strong> NPR 12,81,600</li>
  <li><strong>Tax on first 10L (0 – 10,00,000):</strong> 0% (SSF Exempt) = NPR 0</li>
  <li><strong>Tax on remaining 2,81,600 (10L – 12.816L):</strong> 10% = NPR 28,160</li>
  <li><strong>Total Annual Tax Payable:</strong> NPR 28,160</li>
  <li><strong>Monthly Salary TDS:</strong> ~NPR 2,347/month</li>
</ol>

<h2>Sources & Legal Reference</h2>
<ul>
  <li><strong>Authoritative Source:</strong> Budget Speech of FY 2083/84 presented on 15 Jestha 2083 (29 May 2026) by Finance Minister Dr. Swarnim Wagle.</li>
  <li><strong>Legal Statute:</strong> Finance Act 2083 (Inland Revenue Department - IRD Nepal).</li>
  <li><strong>Verification Date:</strong> Last verified on 2 August 2026.</li>
</ul>
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
      { slug: "land-unit-converter", categorySlug: "nepal", label: "Land Unit Converter" },
    ],
    content: `
<h2>Two Systems, One Country</h2>
<p>Nepal uses <strong>two completely different land measurement systems</strong> depending on geography:</p>
<ul>
<li><strong>Ropani-Aana-Paisa-Dam</strong> — used in the hills and mountains (Kathmandu, Pokhara, etc.)</li>
<li><strong>Bigha-Kattha-Dhur</strong> — used in the Terai/plains (Birgunj, Janakpur, Biratnagar, etc.)</li>
</ul>
<p>This dual system is a historical artifact, and while there's talk of standardizing to metric, both remain the <strong>legal units</strong> used in land registration (lalpurja) today.</p>

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
<p>The most common question: <strong>"How many Ropani in a Bigha?"</strong></p>
<p>1 Bigha = 72,900 sq ft ÷ 5,476 sq ft/ropani ≈ <strong>13.31 Ropani</strong></p>
<p>Conversely, 1 Ropani ≈ <strong>0.0751 Bigha</strong></p>

<h2>Metric Equivalents</h2>
<ul>
<li>1 Ropani = <strong>508.74 sq meters</strong> = <strong>0.0509 hectares</strong></li>
<li>1 Bigha = <strong>6,772.63 sq meters</strong> = <strong>0.6773 hectares</strong></li>
<li>1 Hectare = <strong>1.966 Ropani</strong> or <strong>1.476 Bigha</strong></li>
</ul>

<h2>Tips for Buyers</h2>
<ul>
<li>Always verify the measurement system used in your <strong>lalpurja</strong> (land ownership certificate)</li>
<li>If buying land in a border area between hill and Terai, confirm which system the local Land Revenue Office uses</li>
<li>Online calculators simplify quick conversions — but always double-check against official survey documents</li>
</ul>
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
<p>Nepal is one of the few countries that does <strong>not</strong> use the Gregorian (AD) calendar as its official civil calendar. Instead, Nepal uses the <strong>Bikram Sambat (B.S. / वि.सं.)</strong> calendar — a solar sidereal calendar that is approximately <strong>56 years and 8.5 months ahead</strong> of the Gregorian calendar.</p>
<p>So when it's January 2025 AD in the rest of the world, it's roughly <strong>Magh 2081 BS</strong> in Nepal.</p>

<h2>Key Differences from the Gregorian Calendar</h2>
<table>
<thead><tr><th>Feature</th><th>Bikram Sambat</th><th>Gregorian (AD)</th></tr></thead>
<tbody>
<tr><td>New Year</td><td>1 Baisakh (mid-April)</td><td>1 January</td></tr>
<tr><td>Year offset</td><td>~56-57 years ahead</td><td>—</td></tr>
<tr><td>Month count</td><td>12</td><td>12</td></tr>
<tr><td>Days/month</td><td>29–32 (variable)</td><td>28–31 (fixed pattern)</td></tr>
<tr><td>Weekly holiday</td><td>Saturday</td><td>Sunday (most countries)</td></tr>
<tr><td>Leap year rule</td><td>No simple formula</td><td>Every 4 years (+exceptions)</td></tr>
</tbody>
</table>

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
<p>A common misconception is that converting BS to AD is simply "subtract 57." This gives you a rough year, but the <strong>month and day will be wrong</strong> because:</p>
<ul>
<li>BS months have variable lengths (29–32 days) that change year to year</li>
<li>BS New Year falls in mid-April, not January</li>
<li>There's no simple leap year formula — month lengths are published annually by the Nepal government</li>
</ul>
<p>Accurate conversion requires a <strong>lookup table of month lengths</strong> for every BS year — which is exactly what our converter tool uses.</p>

<h2>Common Conversion Scenarios</h2>
<ul>
<li><strong>Birth date for passport:</strong> Your lalpurja or citizenship certificate uses BS — you need AD for your passport/visa</li>
<li><strong>School/university deadlines:</strong> Government academic calendars use BS</li>
<li><strong>Tax filing:</strong> Nepal's fiscal year runs Shrawan 1 to Ashadh end (BS)</li>
<li><strong>Festival dates:</strong> Dashain, Tihar, Holi, Teej — all follow the BS calendar</li>
</ul>
    `,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
