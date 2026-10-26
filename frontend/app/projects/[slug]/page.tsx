import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

async function getProject(slug: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
  try {
    const res = await fetch(`${apiBase}/public/projects/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProject(params.slug);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="max-w-2xl mx-auto text-center py-32 px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Project Not Found</h1>
          <p className="text-slate-400 mb-8">The requested project case study could not be located or is unpublished.</p>
          <Link href="/#projects" className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold">
            Return to Projects
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 space-y-12">
        
        {/* Back Link */}
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>

        {/* Title & Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/40 text-brand-300 text-xs font-mono">
              {project.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-navy-800 border border-navy-600 text-slate-300 text-xs font-mono">
              Status: {project.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            {project.title}
          </h1>

          <p className="text-lg text-slate-300 leading-relaxed">
            {project.summary}
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/30"
              >
                <span>Live Deployment</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {project.repository_url && (
              <a
                href={project.repository_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 border border-navy-600 text-white font-semibold text-sm"
              >
                <Github className="w-4 h-4" />
                <span>Source Repository</span>
              </a>
            )}
          </div>
        </div>

        {/* Technologies Grid */}
        <div className="bg-navy-800/80 border border-navy-600/70 rounded-2xl p-6">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3">
            Technology Stack & Tools
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies?.map((tech: string) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-lg text-xs font-mono bg-navy-900 border border-navy-600 text-brand-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Case Study Sections */}
        <div className="space-y-8 text-slate-300 text-sm sm:text-base leading-relaxed">
          {project.problem_statement && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Problem Statement & Requirements
              </h2>
              <p className="bg-navy-800/50 p-5 rounded-xl border border-navy-600/50">
                {project.problem_statement}
              </p>
            </div>
          )}

          {project.solution && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Architectural Solution
              </h2>
              <p className="bg-navy-800/50 p-5 rounded-xl border border-navy-600/50">
                {project.solution}
              </p>
            </div>
          )}

          {project.architecture && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                System Design & Technical Decisions
              </h2>
              <div className="bg-navy-900 p-5 rounded-xl border border-navy-600/60 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto whitespace-pre-wrap">
                {project.architecture}
              </div>
            </div>
          )}

          {project.outcomes && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white">
                Verified Outcomes & Metrics
              </h2>
              <p className="bg-navy-800/50 p-5 rounded-xl border border-navy-600/50">
                {project.outcomes}
              </p>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
}
