"use client";

import { useEffect, useState } from "react";
import { Plus, Check, Trash2, Eye, EyeOff } from "lucide-react";
import {
  getAdminTestimonials,
  createAdminTestimonial,
  approveAdminTestimonial,
  deleteAdminTestimonial
} from "../../../lib/api";

export default function AdminTestimonialsManager() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTestimonial, setNewTestimonial] = useState({
    author_name: "",
    author_role: "",
    organization: "",
    content: "",
    permission_confirmed: true,
    approved: true,
    is_visible: true,
  });

  const fetchTestimonials = () => {
    setLoading(true);
    getAdminTestimonials()
      .then((data) => {
        setTestimonials(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminTestimonial(newTestimonial);
      setNewTestimonial({
        author_name: "",
        author_role: "",
        organization: "",
        content: "",
        permission_confirmed: true,
        approved: true,
        is_visible: true,
      });
      fetchTestimonials();
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAdminTestimonial(id);
      fetchTestimonials();
    } catch (err: any) {
      alert("Approval failed: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteAdminTestimonial(id);
      fetchTestimonials();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Testimonials & Endorsements
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review, verify permission, approve, and manage peer & client testimonials.
        </p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-navy-600/60 pb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-400" /> Add Verified Testimonial
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Author Name *
            </label>
            <input
              type="text"
              required
              value={newTestimonial.author_name}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, author_name: e.target.value })}
              placeholder="Client name"
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={newTestimonial.author_role}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, author_role: e.target.value })}
              placeholder="e.g. CEO / Lead Architect"
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Organization
            </label>
            <input
              type="text"
              value={newTestimonial.organization}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, organization: e.target.value })}
              placeholder="Organization (optional)"
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Testimonial Text *
          </label>
          <textarea
            required
            rows={3}
            value={newTestimonial.content}
            onChange={(e) => setNewTestimonial({ ...newTestimonial, content: e.target.value })}
            placeholder="Review quote text..."
            className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
        >
          Add Testimonial
        </button>
      </form>

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{t.author_name}</span>
                <span className="text-xs text-slate-400">
                  {t.author_role} {t.organization ? `at ${t.organization}` : ""}
                </span>
                {t.approved && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-900/40 border border-emerald-500/40 text-emerald-300">
                    Approved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 italic">
                &ldquo;{t.content}&rdquo;
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!t.approved && (
                <button
                  onClick={() => handleApprove(t.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Publish</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 rounded-lg bg-navy-700 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
