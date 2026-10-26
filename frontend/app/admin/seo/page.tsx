"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2, Globe, Shield } from "lucide-react";
import { getAdminSettings, updateAdminSetting } from "../../../lib/api";

export default function AdminSEOSettings() {
  const [seoConfig, setSeoConfig] = useState({
    meta_description: "Official portfolio of Oduor Daivine Oluoch - Founder of Florante Tech Limited, Software Engineer, and Technology Innovator.",
    keywords: "Software Engineer, Kenya, FastAPI, React, Full Stack, Florante Tech, Cybersecurity",
    og_image: "/og-cover.png",
    robots_directive: "index, follow",
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getAdminSettings()
      .then((settings) => {
        const seo = settings.find((s: any) => s.key === "seo");
        if (seo) {
          try {
            setSeoConfig(JSON.parse(seo.value_json));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminSetting("seo", seoConfig);
      setStatus("SEO configuration successfully saved and updated!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          SEO & Search Engine Directives
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage meta descriptions, OpenGraph social cards, canonical rules, and crawler indexing.
        </p>
      </div>

      {status && (
        <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-500/50 flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{status}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Default Meta Description *
          </label>
          <textarea
            required
            rows={3}
            value={seoConfig.meta_description}
            onChange={(e) => setSeoConfig({ ...seoConfig, meta_description: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Keywords & Competencies (CSV)
          </label>
          <input
            type="text"
            value={seoConfig.keywords}
            onChange={(e) => setSeoConfig({ ...seoConfig, keywords: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              OpenGraph Preview Image Path
            </label>
            <input
              type="text"
              value={seoConfig.og_image}
              onChange={(e) => setSeoConfig({ ...seoConfig, og_image: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Robots.txt Directives
            </label>
            <select
              value={seoConfig.robots_directive}
              onChange={(e) => setSeoConfig({ ...seoConfig, robots_directive: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            >
              <option value="index, follow">index, follow (Standard Public)</option>
              <option value="noindex, nofollow">noindex, nofollow (Private / Staging)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save SEO Settings</span>
        </button>
      </form>
    </div>
  );
}
