// ─── SEO TOPIC CLUSTERS ───────────────────────────────────────────────────────
// Maps Google Search Console high-intent query themes to authoritative guides
// and interactive calculator tools for topical authority and internal linking.

export interface SeoTopicCluster {
  id: string;
  name: string;
  primaryToolSlug: string;
  primaryToolCategorySlug: string;
  guideSlug: string;
  intent: "informational" | "transactional" | "mixed";
  queryThemes: string[];
  guideAnchorText: string;
  guideDescription: string;
  toolCtaText: string;
}

export const SEO_TOPIC_CLUSTERS: Record<string, SeoTopicCluster> = {
  "vehicle-tax": {
    id: "vehicle-tax",
    name: "Nepal Vehicle Road Tax & Blue Book Renewal",
    primaryToolSlug: "vehicle-tax-calculator",
    primaryToolCategorySlug: "nepal",
    guideSlug: "vehicle-road-tax-nepal-guide",
    intent: "mixed",
    queryThemes: [
      "tax rate of bike in nepal",
      "bike tax in nepal",
      "motorcycle tax rate nepal",
      "nepal vehicle tax calculator",
      "blue book renewal fine nepal",
      "car road tax bagmati province",
      "scooter tax in nepal",
      "yatayat tax rate nepal",
    ],
    guideAnchorText: "Read the Complete Nepal Vehicle Road Tax & Blue Book Guide",
    guideDescription:
      "Comprehensive breakdown of provincial 2-wheeler & 4-wheeler tax slabs, blue book renewal deadlines, and overdue penalty fine rules.",
    toolCtaText: "Calculate Your Vehicle Tax & Renewal Fines Instantly",
  },
  "salary-tax": {
    id: "salary-tax",
    name: "Nepal Salary Tax & TDS (FY 2083/84)",
    primaryToolSlug: "tax-calculator",
    primaryToolCategorySlug: "finance",
    guideSlug: "nepal-income-tax-slabs-guide",
    intent: "mixed",
    queryThemes: [
      "salary tax calculator nepal",
      "tds calculator nepal",
      "nepal income tax slabs fy 2083 84",
      "income tax calculation in nepal for salary",
      "ssf tax exemption nepal",
      "nepal salary tds rules",
      "individual income tax rate nepal",
    ],
    guideAnchorText: "Read the Complete Nepal Income Tax Slabs & Salary TDS Guide",
    guideDescription:
      "Detailed breakdown of FY 2083/84 unified income tax slabs, 1% SST threshold, SSF tax relief, and step-by-step salary TDS calculations.",
    toolCtaText: "Calculate Your Salary Tax & Monthly TDS Instantly",
  },
  "gold-silver": {
    id: "gold-silver",
    name: "Nepal Gold & Silver Price Calculation",
    primaryToolSlug: "gold-silver-calculator",
    primaryToolCategorySlug: "finance",
    guideSlug: "gold-silver-rate-nepal-guide",
    intent: "mixed",
    queryThemes: [
      "1 aana gold price in nepal",
      "gold price calculator nepal",
      "1 lal gold price in nepal",
      "gold tola to aana conversion nepal",
      "fenegosida live gold rate calculation",
      "jyala jarti calculation nepal",
      "24k fine gold price today nepal",
    ],
    guideAnchorText: "Read How Gold & Silver Prices are Calculated in Nepal",
    guideDescription:
      "Understand how Nepali jewelers calculate tola, aana, and lal weights, along with making charges (jyala) and wastage (jarti).",
    toolCtaText: "Calculate Gold & Silver Price in Tola, Aana & Lal Instantly",
  },
  "land-measurement": {
    id: "land-measurement",
    name: "Nepali Land Unit Measurement & Conversion",
    primaryToolSlug: "land-converter",
    primaryToolCategorySlug: "nepal",
    guideSlug: "nepali-land-measurement-guide",
    intent: "mixed",
    queryThemes: [
      "ropani to aana conversion",
      "bigha to kattha calculator nepal",
      "kattha to sq feet converter",
      "nepal land measurement units",
      "aana to sq feet kathmandu",
      "dhur to sq feet conversion",
      "1 ropani in square feet",
    ],
    guideAnchorText: "Read the Complete Nepali Land Measurement Guide (Ropani, Aana, Bigha, Kattha)",
    guideDescription:
      "Learn how the Hill (Ropani-Aana) and Terai (Bigha-Kattha) land systems work with exact square feet and square meter conversion factors.",
    toolCtaText: "Convert Ropani, Aana, Bigha & Kattha Units Instantly",
  },
};

/**
 * Retrieve topic cluster associated with a tool slug
 */
export function getClusterByToolSlug(slug: string): SeoTopicCluster | undefined {
  return Object.values(SEO_TOPIC_CLUSTERS).find(
    (cluster) => cluster.primaryToolSlug === slug
  );
}

/**
 * Retrieve topic cluster associated with a blog guide slug
 */
export function getClusterByGuideSlug(slug: string): SeoTopicCluster | undefined {
  return Object.values(SEO_TOPIC_CLUSTERS).find(
    (cluster) => cluster.guideSlug === slug
  );
}
