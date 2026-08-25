import { MetadataRoute } from "next";
import { TOOLS, CATEGORIES } from "@/lib/tools-registry";
import { BLOG_POSTS } from "@/lib/blog-data";
import { SITE_URL } from "@/lib/site-config";

// Stable base date representing the latest major platform update (Sprint 4)
const PLATFORM_LASTMOD = new Date("2026-08-24");

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: PLATFORM_LASTMOD, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/tools`, lastModified: PLATFORM_LASTMOD, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: PLATFORM_LASTMOD, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: PLATFORM_LASTMOD, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: PLATFORM_LASTMOD, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: PLATFORM_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: PLATFORM_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/disclaimer`, lastModified: PLATFORM_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${SITE_URL}/tools/${cat.slug}`,
    lastModified: PLATFORM_LASTMOD,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.categorySlug}/${tool.slug}`,
    lastModified: PLATFORM_LASTMOD,
    changeFrequency: "weekly",
    priority: tool.featured ? 0.9 : 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...toolPages, ...blogPages];
}
