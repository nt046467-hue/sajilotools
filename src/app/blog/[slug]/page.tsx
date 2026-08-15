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

import { SITE_CONFIG, getCanonicalUrl } from "@/lib/site-config";

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

  return <BlogPostClient post={post} />;
}
