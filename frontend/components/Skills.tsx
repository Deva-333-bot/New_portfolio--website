"use client";

import { useEffect, useState } from "react";
import { getPublicSkills } from "../lib/api";

interface SkillItem {
  id: string;
  name: string;
  category: string;
  proficiency_value?: number | null;
  proficiency_label?: string | null;
  icon_name?: string | null;
}

const fallbackSkills: SkillItem[] = [
  { id: "python", name: "Python", category: "Languages" },
  { id: "javascript", name: "JavaScript", category: "Languages" },
  { id: "react", name: "React", category: "Frontend" },
  { id: "fastapi", name: "FastAPI", category: "Backend" },
  { id: "django", name: "Django", category: "Backend" },
  { id: "postgresql", name: "PostgreSQL", category: "Databases" },
  { id: "git", name: "Git & GitHub", category: "Tools" },
  { id: "java", name: "Java", category: "Languages" },
];

export default function Skills({ initialSkills }: { initialSkills?: SkillItem[] }) {
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills || []);

  useEffect(() => {
    if (!initialSkills || initialSkills.length === 0) {
      getPublicSkills().then(setSkills).catch(() => {});
    }
  }, [initialSkills]);

  const displaySkills = skills.length > 0 ? skills : fallbackSkills;

  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
            Technical Skills
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technologies I Work With
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Tools and technologies used across software engineering, web development, and machine-learning projects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displaySkills.map((skill) => (
            <div
              key={skill.id}
              className="bg-navy-700/80 border border-navy-600/70 hover:border-brand-500/40 rounded-2xl p-5 transition-all hover:-translate-y-1 card-glow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-mono text-xs font-bold">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
