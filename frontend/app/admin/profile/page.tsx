"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2, AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  getAdminProfile,
  updateAdminProfile,
  getAdminSocialLinks,
  createAdminSocialLink,
  deleteAdminSocialLink
} from "../../../lib/api";

export default function AdminProfileManager() {
  const [profile, setProfile] = useState<any>({
    display_name: "",
    full_name: "",
    headline: "",
    short_bio: "",
    full_bio: "",
    company_name: "",
    education_summary: "",
    expected_graduation: "",
    location: "",
    availability_status: "",
    public_email: "", 
    years_experience: "",
    projects_completed: "",
    happy_clients: "",
    client_satisfaction: "",

  });

  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [newPlatform, setNewPlatform] = useState("GitHub");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAdminProfile(), getAdminSocialLinks()])
      .then(([prof, links]) => {
        setProfile(prof);
        setSocialLinks(links);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      const updated = await updateAdminProfile(profile);
      setProfile(updated);
      setSaveStatus("Profile successfully updated and published to public site!");
    } catch (err: any) {
      setSaveStatus("Error updating profile: " + err.message);
    }
  };

  const handleAddSocialLink = async () => {
    if (!newUrl) return;
    try {
      const link = await createAdminSocialLink({
        platform: newPlatform,
        label: newPlatform,
        url: newUrl,
        display_order: socialLinks.length + 1,
        is_visible: true,
      });
      setSocialLinks([...socialLinks, link]);
      setNewUrl("");
    } catch (err: any) {
      alert("Failed to add link: " + err.message);
    }
  };

  const handleDeleteSocialLink = async (id: string) => {
    if (!confirm("Are you sure you want to remove this social link?")) return;
    try {
      await deleteAdminSocialLink(id);
      setSocialLinks(socialLinks.filter((l) => l.id !== id));
    } catch (err: any) {
      alert("Failed to delete link: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-slate-400 font-mono text-xs">Loading profile settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Profile & Personal Brand Manager
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your verified professional positioning, biography, education, and social channels.
        </p>
      </div>

      {saveStatus && (
        <div className="p-4 rounded-xl bg-brand-900/40 border border-brand-500/50 flex items-center gap-3 text-xs text-brand-200">
          <CheckCircle2 className="w-5 h-5 text-brand-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSubmit} className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white border-b border-navy-600/60 pb-3">
          1. General Information & Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Professional Headline
          </label>
          <input
            type="text"
            required
            value={profile.headline}
            onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Short Introduction / Hero Bio
          </label>
          <input
            type="text"
            required
            value={profile.short_bio}
            onChange={(e) => setProfile({ ...profile, short_bio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Full Biography (About Section)
          </label>
          <textarea
            required
            rows={4}
            value={profile.full_bio}
            onChange={(e) => setProfile({ ...profile, full_bio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
          />
        </div>

        <h2 className="text-base font-bold text-white border-b border-navy-600/60 pb-3 pt-4">
          2. Company, Education & Location
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Company Association
            </label>
            <input
              type="text"
              value={profile.company_name || ""}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Education Summary
            </label>
            <input
              type="text"
              value={profile.education_summary || ""}
              onChange={(e) => setProfile({ ...profile, education_summary: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Expected Graduation
            </label>
            <input
              type="text"
              value={profile.expected_graduation || ""}
              onChange={(e) => setProfile({ ...profile, expected_graduation: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Geographic Location
            </label>
            <input
              type="text"
              value={profile.location || ""}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Availability Status
            </label>
            <input
              type="text"
              value={profile.availability_status || ""}
              onChange={(e) => setProfile({ ...profile, availability_status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Public Contact Email
            </label>
            <input
              type="email"
              value={profile.public_email || ""}
              onChange={(e) => setProfile({ ...profile, public_email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <h2 className="text-base font-bold text-white border-b border-navy-600/60 pb-3 pt-4">
          3. Metric Highlights (About Section Cards)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Years Experience
            </label>
            <input
              type="text"
              value={profile.years_experience}
              onChange={(e) => setProfile({ ...profile, years_experience: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Projects Completed
            </label>
            <input
              type="text"
              value={profile.projects_completed}
              onChange={(e) => setProfile({ ...profile, projects_completed: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Happy Clients
            </label>
            <input
              type="text"
              value={profile.happy_clients}
              onChange={(e) => setProfile({ ...profile, happy_clients: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Client Satisfaction
            </label>
            <input
              type="text"
              value={profile.client_satisfaction}
              onChange={(e) => setProfile({ ...profile, client_satisfaction: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Changes</span>
        </button>
      </form>

      {/* Social Links Manager */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white border-b border-navy-600/60 pb-3">
          4. Social Links & Profiles
        </h2>

        <div className="space-y-3">
          {socialLinks.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-navy-900/70 border border-navy-600/60 text-xs"
            >
              <div>
                <span className="font-bold text-white">{link.platform}: </span>
                <span className="font-mono text-slate-400">{link.url}</span>
              </div>
              <button
                onClick={() => handleDeleteSocialLink(link.id)}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-navy-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
          >
            <option value="GitHub">GitHub</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Twitter">X / Twitter</option>
            <option value="Email">Email</option>
            <option value="Website">Website</option>
          </select>

          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full flex-1 px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
          />

          <button
            onClick={handleAddSocialLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 border border-navy-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
