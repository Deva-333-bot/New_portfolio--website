"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { fetchApi } from "../../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await fetchApi<{ message: string }>("/auth/password/forgot", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process the request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <section className="max-w-md w-full bg-navy-800/90 border border-navy-600/80 rounded-2xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mx-auto mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white text-center">Reset your password</h1>
        <p className="text-sm text-slate-400 text-center mt-3 mb-6">
          Enter the administrator email address. If the account exists and email delivery is configured, reset instructions will be sent.
        </p>

        {message && <p role="status" className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-900/30 p-3 text-sm text-emerald-200">{message}</p>}
        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/40 bg-rose-900/30 p-3 text-sm text-rose-200">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            Administrator email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full px-3.5 py-3 rounded-xl bg-navy-900 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
              placeholder="admin@example.com"
            />
          </label>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm">
            {loading ? "Submitting..." : "Send reset instructions"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4" />
          <span>Requests use a generic response to protect account privacy.</span>
        </div>
        <Link href="/admin/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-brand-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </section>
    </main>
  );
}
