"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Github, ExternalLink, X, CheckCircle, ShieldAlert, Cpu } from "lucide-react";
import { getPublicProjects } from "../lib/api";
import { logEvent } from "../lib/analytics";

interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  status: string;
  featured: boolean;
  cover_image_url?: string;
  live_url?: string;
  repository_url?: string;
  technologies: string[];
}

export default function Projects({ initialProjects }: { initialProjects?: ProjectItem[] }) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects || []);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeModalProject, setActiveModalProject] = useState<any | null>(null);

  useEffect(() => {
    if (!initialProjects || initialProjects.length === 0) {
      getPublicProjects().then(setProjects).catch(() => {});
    }
  }, [initialProjects]);

  const categories = ["All", "Full Stack", "Backend", "AI / Machine Learning", "Cybersecurity & Systems"];

  const filtered = selectedCategory === "All"
    ? projects
    : projects.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()) || p.category === selectedCategory);

  const openProjectModal = (p: ProjectItem) => {
    logEvent("project_view", { contentType: "project", contentId: p.slug });
    setActiveModalProject(p);
  };

  return (
    <section id="projects" className="py-24 bg-navy-800/40 border-t border-navy-600/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
            Featured Projects
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Some of My Recent Work
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            A selection of projects exploring web development, backend systems, and machine learning.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                    : "bg-navy-700/60 text-slate-300 hover:text-white hover:bg-navy-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Card Grid matching reference visual */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((p, idx) => {
            const indexNumber = String(idx + 1).padStart(2, "0");
            return (
              <div
                key={p.id}
                className="bg-navy-700/90 border border-navy-600/70 hover:border-brand-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 card-glow group"
              >
                {/* Cover Image & Index Badge */}
                <div className="relative aspect-[16/10] bg-navy-900 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-navy-900/80 backdrop-blur-md border border-navy-600/60 text-xs font-mono font-bold text-slate-300">
                    {indexNumber}
                  </div>

                  {p.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cover_image_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-800 to-navy-900 text-slate-500 font-mono text-sm">
                      {p.category}
                    </div>
                  )}

                  {/* Status Pill */}
                  <div className="absolute bottom-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-navy-900/90 backdrop-blur-md border border-brand-500/30 text-[11px] font-mono text-brand-300">
                    {p.status}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.technologies?.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-900/80 border border-navy-600/60 text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer with View Project Link */}
                  <div className="pt-4 border-t border-navy-600/50 flex items-center justify-between">
                    <button
                      onClick={() => openProjectModal(p)}
                      className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 group-hover:underline"
                    >
                      <span>View Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2">
                      {p.repository_url && (
                        <a
                          href={p.repository_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="GitHub Repository"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-600/50"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {p.live_url && (
                        <a
                          href={p.live_url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Live Demo"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-600/50"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel / Dots Indicator matching reference layout */}
        <div className="flex items-center justify-center gap-2 mt-10">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
          <span className="w-2 h-2 rounded-full bg-navy-600" />
          <span className="w-2 h-2 rounded-full bg-navy-600" />
        </div>

      </div>

      {/* Deep-Dive Case Study Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8">
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-navy-700 hover:bg-navy-600 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-900/50 border border-brand-500/40 text-brand-300 text-xs font-mono mb-2">
                  {activeModalProject.category} &bull; {activeModalProject.status}
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {activeModalProject.title}
                </h3>
                <p className="text-sm text-slate-300 mt-2">
                  {activeModalProject.description}
                </p>
              </div>

              {/* Problem & Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-navy-700/60 p-4 rounded-xl border border-navy-600/50">
                  <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Problem Statement
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModalProject.problem_statement || "Addressing operational complexity and technical scalability bottlenecks."}
                  </p>
                </div>

                <div className="bg-navy-700/60 p-4 rounded-xl border border-navy-600/50">
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Solution Architecture
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModalProject.solution || "Engineered modular software architecture with type-safe APIs and optimized data flow."}
                  </p>
                </div>
              </div>

              {/* Implementation & Challenges */}
              {activeModalProject.architecture && (
                <div className="bg-navy-900/70 p-4 rounded-xl border border-navy-600/50">
                  <h4 className="text-xs font-mono text-brand-300 uppercase tracking-wider mb-1">
                    System Architecture & Design Decisions
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {activeModalProject.architecture}
                  </p>
                </div>
              )}

              {/* Outcomes & Metrics */}
              {activeModalProject.outcomes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                    Verified Outcomes
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeModalProject.outcomes}
                  </p>
                </div>
              )}

              {/* Links */}
              <div className="pt-4 border-t border-navy-600/60 flex flex-wrap items-center gap-3">
                {activeModalProject.live_url && (
                  <a
                    href={activeModalProject.live_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs"
                  >
                    <span>View Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {activeModalProject.repository_url && (
                  <a
                    href={activeModalProject.repository_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-700 hover:bg-navy-600 border border-navy-600 text-white font-semibold text-xs"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Source Code</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
