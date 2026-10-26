"use client";

import Link from "next/link";
import { Calendar, Code, Smile, Trophy, User } from "lucide-react";

interface AboutProps {
  profile?: {
    full_name: string;
    full_bio: string;
    company_name?: string;
    education_summary?: string;
    location?: string;
    years_experience?: string;
    projects_completed?: string;
    happy_clients?: string;
    client_satisfaction?: string;
  };
}

export default function About({ profile }: AboutProps) {
     const stats = [
    {
      icon: Calendar,
      value: profile?.years_experience?.trim(),
      label: "Years Experience",
    },
    {
      icon: Code,
      value: profile?.projects_completed?.trim(),
      label: "Projects Completed",
    },
    {
      icon: Smile,
      value: profile?.happy_clients?.trim(),
      label: "Happy Clients / Partners",
    },
    {
      icon: Trophy,
      value: profile?.client_satisfaction?.trim(),
      label: "Client Satisfaction",
    },
  ].filter((stat) => Boolean(stat.value));

  return (
    <section id="about" className="py-20 bg-navy-800/50 border-t border-navy-600/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Bio & Learn More */}
          <div className={`space-y-6 ${stats.length > 0 ? "lg:col-span-6" : "lg:col-span-12"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
              About Me
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              I&apos;m passionate about creating digital solutions
            </h2>

            <p className="text-slate-300 leading-relaxed text-base">
              {profile?.full_bio || (
                "I am a software engineering student at Kirinyaga University (expected graduation 2028), an AI and machine-learning enthusiast, and founder of Florante Tech Limited. I am developing practical skills in Python backend development, modern web applications, and applied AI."
              )}
            </p>

            <div className="pt-2">
              <Link
                href="#experience"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-700 hover:bg-navy-600 border border-navy-600 hover:border-brand-500 text-white text-sm font-semibold transition-all"
              >
                <span>Learn More About Me</span>
                <User className="w-4 h-4 text-brand-400" />
              </Link>
            </div>
          </div>

          {/* Right Column: 2x2 Stats Grid directly matching reference visual */}
          {stats.length > 0 && (
  <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
    {stats.map((s, idx) => {
      const Icon = s.icon;
      return (
        <div
          key={idx}
          className="bg-navy-700/80 border border-navy-600/70 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/50 hover:bg-navy-700 transition-all card-glow"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mb-4">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {s.value}
            </span>
            <p className="text-sm font-medium text-slate-400 mt-1">
              {s.label}
            </p>
          </div>
        </div>
      );
    })}
  </div>
)}

        </div>
      </div>
    </section>
  );
}
