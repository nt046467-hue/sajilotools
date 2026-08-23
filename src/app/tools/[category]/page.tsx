import type { Metadata } from "next";
import { getCategoryBySlug, getToolsByCategory } from "@/lib/tools-registry";
import CategoryClient from "@/components/CategoryClient";

import { SITE_CONFIG, SITE_URL, getCanonicalUrl } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return {};

  const isNepalCat = cat.slug === "nepal" || cat.name === "Nepal Tools";
  const title = `${cat.name}${cat.name.endsWith("Tools") ? "" : " Tools"} – Free Online Utilities`;
  const description = `${cat.desc} Free, fast, no sign-up required.${isNepalCat ? " Built for Nepal." : ""}`;
  const url = getCanonicalUrl(`/tools/${cat.slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
      locale: SITE_CONFIG.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/images/og-default.png"],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const catSlug = params?.category || "";
  const category = getCategoryBySlug(catSlug);
  const tools = getToolsByCategory(catSlug);

  const jsonLd = category
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CollectionPage",
            "name": `${category.name}${category.name.endsWith("Tools") ? "" : " Tools"}`,
            "description": category.desc,
            "url": getCanonicalUrl(`/tools/${category.slug}`),
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": tools.length,
              "itemListElement": tools.map((t, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "name": t.name,
                "url": getCanonicalUrl(`/tools/${t.categorySlug}/${t.slug}`),
              })),
            },
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": SITE_URL,
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Tools",
                "item": getCanonicalUrl("/tools"),
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": category.name,
                "item": getCanonicalUrl(`/tools/${category.slug}`),
              },
            ],
          },
        ],
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <CategoryClient category={category ?? null} tools={tools} catSlug={catSlug} />
    </>
  );
}
