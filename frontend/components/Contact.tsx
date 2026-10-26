"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Mail, MapPin, Building } from "lucide-react";
import { submitContactForm } from "../lib/api";
import { logEvent } from "../lib/analytics";

export default function Contact({ publicEmail, location }: { publicEmail?: string; location?: string }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    inquiry_type: "Employment opportunity",
    subject: "",
    message: "",
    budget_range: "",
    timeline: "",
    consent: true,
    honeypot: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const inquiryTypes = [
    "Employment opportunity",
    "Freelance or consulting project",
    "Technical partnership",
    "Startup or investment discussion",
    "Speaking or collaboration",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const res = await submitContactForm(formData);
      setStatus({
        type: "success",
        message: res.message || "Thank you! Your message has been sent successfully. I will get back to you shortly.",
      });
      setFormData({
        name: "",
        email: "",
        organization: "",
        inquiry_type: "Employment opportunity",
        subject: "",
        message: "",
        budget_range: "",
        timeline: "",
        consent: true,
        honeypot: "",
      });
      logEvent("contact_form_submit", { contentType: "inquiry" });
    } catch (err: any) {
      setStatus({
        type: "error",
        message: err.message || "Failed to submit message. Please try again or reach out directly by email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/40 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wider uppercase">
            Let&apos;s Work Together
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Have a Project in Mind?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Reach out for employment opportunities, technical consulting, or software partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          
          {/* Left Column: Direct Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-navy-700/80 border border-navy-600/70 rounded-2xl p-6 sm:p-8 space-y-6">
              <h3 className="text-xl font-bold text-white">
                Contact Details
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whether you have an inquiry about building an intelligent backend, launching a product, or exploring full-time roles, I respond to all professional messages promptly.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono">Email</p>
                    <a href={`mailto:${publicEmail || "hello@florante.tech"}`} className="text-sm font-semibold text-white hover:text-brand-300">
                      {publicEmail || "hello@florante.tech"}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono">Company</p>
                    <p className="text-sm font-semibold text-white">Florante Tech Limited</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-slate-300">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-mono">Location</p>
                    <p className="text-sm font-semibold text-white">{location || "Nairobi / Kirinyaga, Kenya"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-navy-700/80 border border-navy-600/70 rounded-2xl p-6 sm:p-8 card-glow">
            {status.type && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-start gap-3 text-sm ${
                  status.type === "success"
                    ? "bg-emerald-900/40 border border-emerald-500/50 text-emerald-200"
                    : "bg-rose-900/40 border border-rose-500/50 text-rose-200"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Anti-spam Honeypot field (hidden from humans) */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Ndung'u"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Organization / Company
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiry_type}
                    onChange={(e) => setFormData({ ...formData, inquiry_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    {inquiryTypes.map((t) => (
                      <option key={t} value={t} className="bg-navy-800">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. FastAPI Microservice Architecture Consultation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your project, timelines, or opportunity..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Budget Range (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                    placeholder="e.g. $5,000 - $15,000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Timeline (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    placeholder="e.g. 1 - 2 months"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/80 border border-navy-600 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={formData.consent}
                  onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                  className="rounded bg-navy-900 border-navy-600 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="consent" className="text-xs text-slate-400">
                  I agree that my submitted information may be used to respond to this inquiry.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {loading ? (
                  <span>Sending inquiry...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
