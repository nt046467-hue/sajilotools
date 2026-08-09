"use client";

import Link from "next/link";
import type { BlogPost } from "@/lib/blog-data";
import { ArrowLeft, Clock, Tag, ArrowRight, BookOpen } from "lucide-react";

interface Props {
  post: BlogPost;
}

export default function BlogPostClient({ post }: Props) {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#DC2626]/5 to-transparent dark:from-[#DC2626]/10 border-b border-[#E4E0D8] dark:border-[#1E2338]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-8">
          <div className="flex items-center gap-3 mb-6 text-sm">
            <Link href="/" className="text-[#DC2626] font-bold hover:underline">
              SajiloTools
            </Link>
            <span className="text-[#71717A]">/</span>
            <Link href="/blog" className="text-[#DC2626] font-bold hover:underline">
              Guides
            </Link>
            <span className="text-[#71717A]">/</span>
            <span className="text-[#71717A] truncate max-w-[200px]">{post.title}</span>
          </div>

          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#DC2626]/10 text-[#DC2626] text-[11px] font-bold">
              <Tag size={11} />
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-[#71717A] text-[11px] font-medium">
              <Clock size={11} />
              {post.readingTime}
            </span>
            <span className="text-[#71717A] text-[11px]">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#18181B] dark:text-[#F4F4F5] leading-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {post.title}
          </h1>
          <p className="mt-3 text-[#71717A] dark:text-[#A1A1AA] text-base">
            {post.description}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <article
          className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-extrabold prose-headings:text-[#18181B] dark:prose-headings:text-[#F4F4F5]
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#E4E0D8] dark:prose-h2:border-[#2A2F48] prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-[#3F3F46] dark:prose-p:text-[#D4D4D8] prose-p:leading-relaxed
            prose-li:text-[#3F3F46] dark:prose-li:text-[#D4D4D8]
            prose-strong:text-[#18181B] dark:prose-strong:text-[#F4F4F5]
            prose-table:border-collapse prose-table:w-full
            prose-th:bg-[#FAFAF8] dark:prose-th:bg-[#1E2338] prose-th:text-left prose-th:px-4 prose-th:py-2.5 prose-th:border prose-th:border-[#E4E0D8] dark:prose-th:border-[#2A2F48] prose-th:text-sm prose-th:font-bold prose-th:text-[#18181B] dark:prose-th:text-[#F4F4F5]
            prose-td:px-4 prose-td:py-2.5 prose-td:border prose-td:border-[#E4E0D8] dark:prose-td:border-[#2A2F48] prose-td:text-sm
            prose-a:text-[#DC2626] prose-a:font-semibold hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tool CTA Banners */}
        <div className="mt-12 space-y-4">
          <h3 className="text-lg font-extrabold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-2">
            <BookOpen size={18} className="text-[#DC2626]" />
            Try the Tool
          </h3>
          {post.toolSlugs.map((t) => (
            <Link
              key={t.slug}
              href={`/tools/${t.categorySlug}/${t.slug}`}
              className="group flex items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#DC2626]/50 hover:shadow-lg transition-all"
            >
              <div>
                <div className="text-base font-bold text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#DC2626] transition-colors">
                  {t.label}
                </div>
                <p className="text-sm text-[#71717A] mt-0.5">
                  Open the free calculator →
                </p>
              </div>
              <ArrowRight
                size={20}
                className="text-[#71717A] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all shrink-0"
              />
            </Link>
          ))}
        </div>

        {/* Back Link */}
        <div className="mt-10 pt-6 border-t border-[#E4E0D8] dark:border-[#2A2F48]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#DC2626] font-bold text-sm hover:underline"
          >
            <ArrowLeft size={14} />
            All Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
