"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { fetchApi } from "../../../lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!token) {
      setError("The reset link is missing its token. Request a new link.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const result = await fetchApi<{ message: string }>("/auth/password/reset", {
        method: "POST",
        body: JSON.stringify({ token, new_password: password }),
      });
      setMessage(result.message);
      setPassword("");
      setConfirmation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <section className="max-w-md w-full bg-navy-800/90 border border-navy-600/80 rounded-2xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400 mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white text-center">Choose a new password</h1>
        <p className="text-sm text-slate-400 text-center mt-3 mb-6">
          Use at least 14 characters. The reset link expires after one hour.
        </p>

        {!token && <p role="alert" className="mb-4 rounded-xl border border-rose-500/40 bg-rose-900/30 p-3 text-sm text-rose-200">This reset link is missing its token. Request a new link.</p>}
        {message && <p role="status" className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-900/30 p-3 text-sm text-emerald-200">{message}</p>}
        {error && <p role="alert" className="mb-4 rounded-xl border border-rose-500/40 bg-rose-900/30 p-3 text-sm text-rose-200">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-300">
            New password
            <input
              type="password"
              required
              minLength={14}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full px-3.5 py-3 rounded-xl bg-navy-900 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-300">
            Confirm new password
            <input
              type="password"
              required
              minLength={14}
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-2 w-full px-3.5 py-3 rounded-xl bg-navy-900 border border-navy-600 text-white text-sm focus:outline-none focus:border-brand-500"
            />
          </label>
          <button type="submit" disabled={loading || !token} className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm">
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4" />
          <span>Existing administrator sessions will be revoked.</span>
        </div>
        <Link href="/admin/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-brand-300 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-navy-900 flex items-center justify-center text-slate-300">Loading reset form…</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
