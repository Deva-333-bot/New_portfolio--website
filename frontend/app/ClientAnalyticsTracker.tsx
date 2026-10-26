"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "../lib/analytics";

export default function ClientAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith("/admin")) {
      logEvent("page_view", { path: pathname });
    }
  }, [pathname]);

  return null;
}
