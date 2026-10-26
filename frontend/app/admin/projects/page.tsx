"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Archive, CheckCircle2, X } from "lucide-react";
import {
  getAdminProjects,
  createAdminProject,
  updateAdminProject,
  publishAdminProject,
  unpublishAdminProject,
  archiveAdminProject,
  deleteAdminProject
} from "../../../lib/api";

export default function AdminProjectsManager() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Full Stack",
    summary: "",
    description: "",
    problem_statement: "",
    solution: "",
    architecture: "",
    challenges: "",
    outcomes: "",
    status: "In progress",
    visibility: "Draft",
    featured: false,
    live_url: "",
    repository_url: "",
    cover_image_url: "",
    technologies_csv: "",
  });

  const fetchProjects = () => {
    setLoading(true);
    getAdminProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      title: "",
      slug: "",
      category: "Full Stack",
      summary: "",
      description: "",
      problem_statement: "",
      solution: "",
      architecture: "",
      challenges: "",
      outcomes: "",
      status: "In progress",
      visibility: "Draft",
      featured: false,
      live_url: "",
      repository_url: "",
      cover_image_url: "",
      technologies_csv: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: any) => {
    setEditingProject(p);
    setFormData({
      title: p.title,
      slug: p.slug,
      category: p.category,
      summary: p.summary,
      description: p.description,
      problem_statement: p.problem_statement || "",
      solution: p.solution || "",
      architecture: p.architecture || "",
      challenges: p.challenges || "",
      outcomes: p.outcomes || "",
      status: p.status,
      visibility: p.visibility,
      featured: p.featured,
      live_url: p.live_url || "",
      repository_url: p.repository_url || "",
      cover_image_url: p.cover_image_url || "",
      technologies_csv: p.technologies?.join(", ") || "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateAdminProject(editingProject.id, formData);
      } else {
        await createAdminProject(formData);
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (err: any) {
      alert("Error saving project: " + err.message);
    }
  };

  const handleTogglePublish = async (p: any) => {
    try {
      if (p.visibility === "Published") {
        await unpublishAdminProject(p.id);
      } else {
        await publishAdminProject(p.id);
      }
      fetchProjects();
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAdminProject(id);
      fetchProjects();
    } catch (err: any) {
      alert("Archive failed: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this project?")) return;
    try {
      await deleteAdminProject(id);
      fetchProjects();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Projects Portfolio Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author, edit, publish, and track genuine software engineering case studies.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 font-mono uppercase text-[11px] border-b border-navy-600/60">
              <tr>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Visibility</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/40">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-navy-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm">{p.title}</p>
                    <p className="font-mono text-slate-400 text-[11px] mt-0.5">/{p.slug}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">{p.category}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-navy-900 border border-navy-600 text-brand-300">
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                        p.visibility === "Published"
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/40"
                          : p.visibility === "Archived"
                          ? "bg-slate-800 text-slate-400 border border-slate-600"
                          : "bg-amber-900/40 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {p.visibility}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      title={p.visibility === "Published" ? "Unpublish" : "Publish"}
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-300 hover:text-white"
                    >
                      {p.visibility === "Published" ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      title="Edit"
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-300 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleArchive(p.id)}
                      title="Archive"
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-300 hover:text-white"
                    >
                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-navy-600/60 pb-4">
              <h3 className="text-xl font-bold text-white">
                {editingProject ? "Edit Project Case Study" : "Create New Project"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Slug (Optional, auto-generated)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Implementation Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  >
                    <option value="Concept">Concept</option>
                    <option value="In progress">In progress</option>
                    <option value="Prototype">Prototype</option>
                    <option value="Completed">Completed</option>
                    <option value="Deployed">Deployed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  >
                    <option value="Draft">Draft (Internal)</option>
                    <option value="Published">Published (Public)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Short Summary (Card Preview) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Project Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
              </div>

              {/* Case study fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    rows={2}
                    value={formData.problem_statement}
                    onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Solution
                  </label>
                  <textarea
                    rows={2}
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Architecture & Technical Decisions
                </label>
                <textarea
                  rows={2}
                  value={formData.architecture}
                  onChange={(e) => setFormData({ ...formData, architecture: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Challenges Encountered
                  </label>
                  <textarea
                    rows={2}
                    value={formData.challenges}
                    onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Verified Outcomes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.outcomes}
                    onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Technologies (CSV)
                  </label>
                  <input
                    type="text"
                    value={formData.technologies_csv}
                    onChange={(e) => setFormData({ ...formData, technologies_csv: e.target.value })}
                    placeholder="FastAPI, React, PostgreSQL"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.repository_url}
                    onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-600/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-navy-700 hover:bg-navy-600 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
