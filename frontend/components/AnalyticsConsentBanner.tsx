"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, X } from "lucide-react";
import { logEvent } from "../lib/analytics";

const CONSENT_KEY = "portfolio_analytics_consent";

export default function AnalyticsConsentBanner() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    try {
      setChoice(window.localStorage.getItem(CONSENT_KEY));
    } catch {
      setChoice("declined");
    }
    const reopenPreferences = () => setChoice(null);
    window.addEventListener("open-analytics-preferences", reopenPreferences);
    return () => window.removeEventListener("open-analytics-preferences", reopenPreferences);
  }, []);

  if (pathname?.startsWith("/admin") || choice === "accepted" || choice === "declined") {
    return null;
  }

  const choose = (value: "accepted" | "declined") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // If preferences cannot be stored, analytics remains disabled.
      setChoice("declined");
      return;
    }
    setChoice(value);
    if (value === "accepted") {
      logEvent("page_view", { path: window.location.pathname });
    }
  };

  return (
    <aside
      role="dialog"
      aria-label="Analytics preferences"
      className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-3xl rounded-2xl border border-navy-600 bg-navy-800 p-4 shadow-2xl sm:inset-x-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-white">Help improve this portfolio?</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            Optional analytics measure page views and project interactions using a daily pseudonymous reference. You can decline and still use the site.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("declined")}
            className="inline-flex items-center gap-1 rounded-lg border border-navy-500 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-navy-700"
          >
            <X className="h-3.5 w-3.5" /> Decline
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-500"
          >
            <Check className="h-3.5 w-3.5" /> Accept analytics
          </button>
        </div>
      </div>
    </aside>
  );
}
