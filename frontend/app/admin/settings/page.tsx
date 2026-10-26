"use client";

import { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import { getAdminSettings, updateAdminSetting } from "../../../lib/api";

export default function AdminSettingsManager() {
  const [generalSettings, setGeneralSettings] = useState({
    site_title: "Oduor Daivine Oluoch | Software Engineering Student & Founder",
    tagline: "Building Secure, Intelligent Software for Real-World Problems",
    default_theme: "dark",
  });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getAdminSettings()
      .then((settings) => {
        const gen = settings.find((s: any) => s.key === "general");
        if (gen) {
          try {
            setGeneralSettings(JSON.parse(gen.value_json));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminSetting("general", generalSettings);
      setStatus("General site settings successfully updated!");
    } catch (err: any) {
      alert("Save failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-brand-400" />
          Site Preferences & Operational Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure site-wide title, tagline, and theme preferences.
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
            Default Browser Tab Title
          </label>
          <input
            type="text"
            required
            value={generalSettings.site_title}
            onChange={(e) => setGeneralSettings({ ...generalSettings, site_title: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Site Tagline / Headline
          </label>
          <input
            type="text"
            required
            value={generalSettings.tagline}
            onChange={(e) => setGeneralSettings({ ...generalSettings, tagline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default Visitor Theme
            </label>
            <select
              value={generalSettings.default_theme}
              onChange={(e) => setGeneralSettings({ ...generalSettings, default_theme: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
            >
              <option value="dark">Dark Developer Theme (#050816)</option>
              <option value="light">Light Theme</option>
            </select>
          </div>


        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
}
