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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `https://sajilotools.vercel.app/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | SajiloTools`,
      description: post.description,
      url: `https://sajilotools.vercel.app/blog/${post.slug}`,
      siteName: "SajiloTools",
      images: [{ url: "/images/og-default.png", width: 1200, height: 630 }],
      locale: "en_US",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | SajiloTools`,
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
