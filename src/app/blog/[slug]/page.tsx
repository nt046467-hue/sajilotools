import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-data";
import BlogPostClient from "./BlogPostClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

import { SITE_CONFIG, SITE_URL, getCanonicalUrl } from "@/lib/site-config";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: getCanonicalUrl(`/blog/${post.slug}`) },
    openGraph: {
      title: post.title,
      description: post.description,
      url: getCanonicalUrl(`/blog/${post.slug}`),
      siteName: SITE_CONFIG.name,
      images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
      locale: SITE_CONFIG.locale,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/images/og-default.png"],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const articleUrl = getCanonicalUrl(`/blog/${post.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
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
            "name": "Guides",
            "item": getCanonicalUrl("/blog"),
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": articleUrl,
          },
        ],
      },
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          "name": SITE_CONFIG.name,
          "url": `${SITE_URL}/`,
        },
        "headline": post.title,
        "description": post.description,
        "url": articleUrl,
        "datePublished": post.date,
        "dateModified": post.date,
        "inLanguage": "en",
        "author": {
          "@type": "Organization",
          "name": SITE_CONFIG.name,
          "url": SITE_URL,
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_CONFIG.name,
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/android-chrome-512x512.png`,
            "width": 512,
            "height": 512,
          },
        },
        "image": `${SITE_URL}/images/og-default.png`,
        "mainEntityOfPage": articleUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient post={post} />
    </>
  );
}
