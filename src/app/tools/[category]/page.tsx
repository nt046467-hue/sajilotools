import type { Metadata } from "next";
import { getCategoryBySlug, getToolsByCategory } from "@/lib/tools-registry";
import CategoryClient from "@/components/CategoryClient";

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cat = getCategoryBySlug(params.category);
  if (!cat) return {};

  const title = `${cat.name} Tools | SajiloTools — Free Online Tools`;
  const description = `${cat.desc} Free, fast, no sign-up required. Built for Nepal.`;
  const url = `https://sajilotools.vercel.app/tools/${cat.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "SajiloTools",
      images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
      locale: "en_US",
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
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://sajilotools.vercel.app",
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Tools",
                "item": "https://sajilotools.vercel.app/tools",
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": category.name,
                "item": `https://sajilotools.vercel.app/tools/${category.slug}`,
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
