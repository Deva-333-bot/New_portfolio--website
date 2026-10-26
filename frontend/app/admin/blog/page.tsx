"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import {
  getAdminPosts,
  createAdminPost,
  updateAdminPost,
  publishAdminPost,
  unpublishAdminPost,
  deleteAdminPost
} from "../../../lib/api";

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Engineering",
    tags: "FastAPI, Python, Architecture",
    author_name: "Oduor Daivine Oluoch",
    status: "Draft",
  });

  const fetchPosts = () => {
    setLoading(true);
    getAdminPosts()
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "Engineering",
      tags: "FastAPI, Python, Architecture",
      author_name: "Oduor Daivine Oluoch",
      status: "Draft",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tags: post.tags?.join(", ") || "",
      author_name: post.author_name,
      status: post.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await updateAdminPost(editingPost.id, formData);
      } else {
        await createAdminPost(formData);
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      alert("Error saving post: " + err.message);
    }
  };

  const handleTogglePublish = async (post: any) => {
    try {
      if (post.status === "Published") {
        await unpublishAdminPost(post.id);
      } else {
        await publishAdminPost(post.id);
      }
      fetchPosts();
    } catch (err: any) {
      alert("Toggle failed: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    try {
      await deleteAdminPost(id);
      fetchPosts();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Blog & Technical Writing Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Author in-depth articles on architecture, cybersecurity, and applied technology.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Posts Table */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 font-mono uppercase text-[11px] border-b border-navy-600/60">
              <tr>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reading Time</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/40">
              {posts.map((p) => (
                <tr key={p.id} className="hover:bg-navy-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm">{p.title}</p>
                    <p className="font-mono text-slate-400 text-[11px]">/{p.slug}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">{p.category}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                        p.status === "Published"
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-900/40 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400">{p.reading_time_minutes} min</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleTogglePublish(p)}
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-300 hover:text-white"
                    >
                      {p.status === "Published" ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-slate-300 hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
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

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-navy-600/60 pb-4">
              <h3 className="text-xl font-bold text-white">
                {editingPost ? "Edit Publication" : "Write New Publication"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
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
                    Tags (CSV)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Excerpt (Summary) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Article Body (Markdown Supported) *
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs font-mono leading-relaxed"
                />
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
                  Save Publication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
