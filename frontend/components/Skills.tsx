"use client";

import { useEffect, useState } from "react";
import { getPublicSkills } from "../lib/api";
import { Terminal, Code2, Database, Shield, Cpu, Layers } from "lucide-react";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency_value?: number;
  proficiency_label?: string;
  icon_name?: string;
}

export default function Skills({ initialSkills }: { initialSkills?: SkillItem[] }) {
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills || []);

  useEffect(() => {
    if (!initialSkills || initialSkills.length === 0) {
      getPublicSkills().then(setSkills).catch(() => {});
    }
  }, [initialSkills]);

  // Fallback verified skills matching reference layout
  const displaySkills = skills.length > 0 ? skills : [
    { id: "1", name: "HTML5", category: "Frontend", proficiency_value: 95 },
    { id: "2", name: "CSS3", category: "Frontend", proficiency_value: 90 },
    { id: "3", name: "JavaScript", category: "Languages", proficiency_value: 90 },
    { id: "4", name: "React.js", category: "Frontend", proficiency_value: 85 },
    { id: "5", name: "Next.js", category: "Frontend", proficiency_value: 80 },
    { id: "6", name: "TypeScript", category: "Languages", proficiency_value: 85 },
    { id: "7", name: "Python & FastAPI", category: "Backend", proficiency_value: 92 },
    { id: "8", name: "Tailwind CSS", category: "Frontend", proficiency_value: 90 },
    { id: "9", name: "Git & GitHub", category: "Tools", proficiency_value: 85 },
  ];

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
            My Skills
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technologies I Master
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered through continuous hands-on architecture, production deployment, and deliberate practice.
          </p>
        </div>

        {/* 3-Column Skills Grid matching reference layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySkills.map((skill) => {
            const pct = skill.proficiency_value || 85;
            return (
              <div
                key={skill.id}
                className="bg-navy-700/80 border border-navy-600/70 hover:border-brand-500/40 rounded-2xl p-5 transition-all hover:-translate-y-1 card-glow"
              >
                {/* Tech Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-mono text-xs font-bold">
                      {skill.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">
                        {skill.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {skill.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {pct}%
                  </span>
                </div>

                {/* Violet Progress Bar directly matching reference image */}
                <div className="w-full bg-navy-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-navy-600/40">
                  <div
                    className="bg-gradient-to-r from-brand-600 to-brand-400 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
