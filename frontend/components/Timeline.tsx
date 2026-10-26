"use client";

import { GraduationCap, Briefcase, Award, Rocket } from "lucide-react";

export default function Timeline() {
  const items = [
    {
      period: "2024 - Present",
      title: "Founder & Lead Software Engineer",
      organization: "Florante Tech Limited",
      description: "Directing software architecture, client consulting, and full-stack product incubation across AI, SaaS, and cybersecurity.",
      icon: Rocket,
      badge: "Founder",
    },
    {
      period: "2024 - 2028 (Expected)",
      title: "BSc in Software Engineering",
      organization: "Kirinyaga University, Kenya",
      description: "Rigorous academic curriculum covering algorithms, operating systems, distributed architectures, database engineering, and discrete mathematics.",
      icon: GraduationCap,
      badge: "Education",
    },
    {
      period: "2022 - Present",
      title: "Backend & Systems Software Developer",
      organization: "Independent & Open Source",
      description: "Designing REST microservices with FastAPI and PostgreSQL, building data science ML pipelines, and authoring technical documentation.",
      icon: Briefcase,
      badge: "Engineering",
    },
    {
      period: "2023 - Present",
      title: "Cybersecurity & Systems Research",
      organization: "Florante Research",
      description: "Exploring cryptographic verification systems, zero-knowledge proofs, and secure authentication models for low-bandwidth African networks.",
      icon: Award,
      badge: "Research",
    },
  ];

  return (
    <section id="experience" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
            Trajectory
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Experience & Education
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Verified academic milestones, leadership roles, and engineering initiatives.
          </p>
        </div>

        {/* Timeline Line & Items */}
        <div className="max-w-4xl mx-auto relative pl-6 sm:pl-8 border-l border-navy-600 space-y-12">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="relative group">
                {/* Node Bullet */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-navy-900 border-2 border-brand-500 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform shadow-lg shadow-brand-500/20">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Content Card */}
                <div className="bg-navy-700/80 border border-navy-600/70 hover:border-brand-500/40 rounded-2xl p-6 transition-all card-glow">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold text-brand-300">
                      {item.period}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-brand-900/40 text-brand-400 border border-brand-500/30">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-300 mb-2">
                    {item.organization}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
