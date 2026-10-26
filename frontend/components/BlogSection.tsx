"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowUpRight, BookOpen } from "lucide-react";
import { getPublicPosts } from "../lib/api";

interface PostItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  reading_time_minutes: number;
  published_at?: string;
  tags: string[];
}

export default function BlogSection({ initialPosts }: { initialPosts?: PostItem[] }) {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts || []);

  useEffect(() => {
    if (!initialPosts || initialPosts.length === 0) {
      getPublicPosts().then(setPosts).catch(() => {});
    }
  }, [initialPosts]);

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-24 bg-navy-800/40 border-t border-navy-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
              Technical Writing
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineering Insights & Articles
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Deep dives into backend architecture, applied cryptography, web performance, and software security.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-navy-700/80 border border-navy-600/70 hover:border-brand-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 card-glow group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="px-2.5 py-1 rounded-full bg-navy-900/80 border border-navy-600 text-brand-300">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.reading_time_minutes} min read
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {post.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-900 text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-navy-600/50">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 group-hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
