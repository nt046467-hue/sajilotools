"use client";

import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { BookOpen, ArrowRight, Clock, Tag } from "lucide-react";

export default function BlogPageClient() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#0C0F1E]">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#DC2626]/5 to-transparent dark:from-[#DC2626]/10 border-b border-[#E4E0D8] dark:border-[#1E2338]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <Link
            href="/"
            className="text-[#DC2626] text-sm font-bold hover:underline mb-4 inline-block"
          >
            ← Back to SajiloTools
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DC2626]/10 text-[#DC2626] flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <h1
                className="text-3xl sm:text-4xl font-extrabold text-[#18181B] dark:text-[#F4F4F5]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Guides & Articles
              </h1>
              <p className="text-[#71717A] dark:text-[#A1A1AA] text-sm mt-1">
                Practical guides on Nepal finance, land, dates & more — with free tool links
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] hover:border-[#DC2626]/50 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
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
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#DC2626] transition-colors mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#71717A] dark:text-[#A1A1AA] line-clamp-2">
                    {post.description}
                  </p>

                  {/* Tool CTAs */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {post.toolSlugs.map((t) => (
                      <span
                        key={t.slug}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold"
                      >
                        🔗 {t.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 mt-2">
                  <ArrowRight
                    size={20}
                    className="text-[#71717A] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
