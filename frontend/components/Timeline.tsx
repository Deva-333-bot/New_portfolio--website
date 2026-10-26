"use client";

import { GraduationCap, Briefcase, Award, Rocket } from "lucide-react";

export default function Timeline() {
  const items = [
    {
      period: "Current",
      title: "Founder",
      organization: "Florante Tech Limited",
      description: "Building an AI-focused technology startup and exploring practical software, automation, and digital solutions.",
      icon: Rocket,
      badge: "Entrepreneurship",
    },
    {
      period: "Expected 2028",
      title: "BSc in Software Engineering",
      organization: "Kirinyaga University, Kenya",
      description: "Studying software engineering while developing practical skills in backend development, web applications, and machine learning.",
      icon: GraduationCap,
      badge: "Education",
    },
    {
      period: "May – August 2026",
      title: "Internship",
      organization: "Safaricom",
      description: "Completed an internship at Safaricom during May–August 2026.",
      icon: Briefcase,
      badge: "Internship",
    },
    {
      period: "Project work",
      title: "Software & Machine Learning Projects",
      organization: "Academic and personal development",
      description: "Projects include a portfolio CMS, a hotel-management prototype, and exploratory sales forecasting with Python and TensorFlow.",
      icon: Award,
      badge: "Projects",
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
            Education, internship experience, and project work.
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
