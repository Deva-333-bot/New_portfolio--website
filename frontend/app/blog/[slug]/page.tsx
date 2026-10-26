import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Tag } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

async function getPost(slug: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${apiBase}/public/posts/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-32 px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-slate-400 mb-8">The requested publication could not be found or has not yet been published.</p>
          <Link href="/#blog" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">
            Back to Articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-10">
        
        {/* Back Link */}
        <Link href="/#blog" className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-4 border-b border-navy-600/60 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/40 text-brand-300">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.reading_time_minutes} min read
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {post.author_name}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed italic border-l-2 border-brand-500 pl-4 py-1">
            {post.excerpt}
          </p>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert max-w-none text-slate-300 space-y-6 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* Tags */}
        <div className="pt-8 border-t border-navy-600/60 flex flex-wrap gap-2 items-center">
          <Tag className="w-4 h-4 text-slate-400" />
          {post.tags?.map((tag: string) => (
            <span key={tag} className="px-2.5 py-1 rounded-md text-xs font-mono bg-navy-800 text-slate-300 border border-navy-600">
              #{tag}
            </span>
          ))}
        </div>

      </main>
      <Footer />
    </div>
  );
}
