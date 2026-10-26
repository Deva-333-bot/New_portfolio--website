"use client";

import Link from "next/link";
import { ArrowUpRight, Terminal } from "lucide-react";
import { logEvent } from "../lib/analytics";

interface HeroProps {
  profile?: {
    display_name: string;
    headline: string;
    short_bio: string;
    company_name?: string;
  };
}

export default function Hero({ profile }: HeroProps) {
  const name = profile?.display_name || "Oduor Daivine";
  const headline = profile?.headline || "Software Engineering Student | AI & ML Enthusiast | Founder";
  const bio = profile?.short_bio || "I build secure, intelligent software and digital systems for real-world impact with modern technologies.";

  const techBadges = [
    { label: "Python", bg: "bg-blue-600/20 text-yellow-300 border-blue-500/30" },
    { label: "JavaScript", bg: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30" },
    { label: "React", bg: "bg-cyan-600/20 text-cyan-400 border-cyan-500/30" },
    { label: "FastAPI", bg: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30" },
    { label: "Django", bg: "bg-green-600/20 text-green-400 border-green-500/30" },
    { label: "PostgreSQL", bg: "bg-sky-600/20 text-sky-400 border-sky-500/30" },
    { label: "Git & GitHub", bg: "bg-red-600/20 text-red-400 border-red-500/30" },
    { label: "Java", bg: "bg-orange-600/20 text-orange-400 border-orange-500/30" },
  ];
  return (
    <section id="home" className="relative pt-12 pb-24 md:py-24 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 hero-glow rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Greeting, Headline, Description, CTAs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-900/40 border border-brand-500/40 text-brand-300 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{headline}</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Hi, I&apos;m{" "}
                <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-indigo-400 bg-clip-text text-transparent">
                  {name}
                </span>
                <br />
                <span className="text-slate-100">I build things for the web.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                {bio}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="#projects"
                onClick={() => logEvent("cta_click", { contentId: "view_my_work" })}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>View My Work</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>


            </div>

            {/* Technologies Badges */}
            <div className="pt-6 border-t border-navy-600/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Technologies I Work With
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                {techBadges.map((t) => (
                  <span
                    key={t.label}
                    className={`px-3 py-1 text-xs font-mono font-medium rounded-md border ${t.bg} transition-transform hover:-translate-y-0.5`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Violet Glow Circle & Code Card */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            {/* Violet Circular Glow Backdrop */}
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-800 p-1 flex items-center justify-center shadow-2xl shadow-brand-600/30">
              {/* Inner Circle with Developer Visual */}
              <div className="w-full h-full rounded-full bg-navy-900 overflow-hidden flex flex-col items-center justify-center relative p-6">
                <div className="absolute inset-0 bg-dot-pattern opacity-30" />
                
                {/* Developer Avatar Silhouette / Icon */}
                <div className="relative z-10 w-44 h-44 rounded-full bg-gradient-to-b from-brand-500/30 to-brand-900/60 border border-brand-500/40 flex items-center justify-center shadow-inner">
                  <Terminal className="w-20 h-20 text-brand-300" />
                </div>
                <div className="relative z-10 mt-3 text-center">
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-brand-300">Florante Tech Limited</p>
                </div>
              </div>
            </div>

            {/* Floating Code Snippet Card directly matching reference image */}
            <div className="w-full max-w-sm code-card rounded-xl p-4 mt-6 lg:-mt-12 lg:-mr-12 relative z-20 transition-all hover:scale-[1.02]">
              {/* macOS Window Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-navy-600/50 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-slate-400">&lt;/&gt; Code</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>

              {/* Code content */}
              <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-purple-400">const</span>{" "}
                  <span className="text-blue-400">developer</span> = &#123;
                  {"\n"}  <span className="text-slate-400">name:</span>{" "}
                  <span className="text-emerald-400">&quot;{name}&quot;</span>,
                  {"\n"}  <span className="text-slate-400">role:</span>{" "}
                  <span className="text-emerald-400">&quot;Software Engineering Student &amp; Founder&quot;</span>,
                  {"\n"}  <span className="text-slate-400">skills:</span> [
                  <span className="text-amber-300">&quot;Python&quot;</span>,{" "}
                  <span className="text-amber-300">&quot;FastAPI&quot;</span>,{" "}
                  <span className="text-amber-300">&quot;React&quot;</span>],
                  {"\n"}  <span className="text-slate-400">passion:</span>{" "}
                  <span className="text-emerald-400">&quot;Building things for the web&quot;</span>
                  {"\n"}&#125;;
                </code>
              </pre>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
