import { trackAnalyticsEvent } from "./api";

export function logEvent(
  eventName: string,
  extra: { contentType?: string; contentId?: string; path?: string } = {}
) {
  if (typeof window === "undefined") return;

  // Analytics is opt-in. Do not send events until the visitor has accepted.
  if (window.location.pathname.startsWith("/admin")) return;
  try {
    if (window.localStorage.getItem("portfolio_analytics_consent") !== "accepted") return;
  } catch {
    return;
  }

  const pagePath = extra.path || window.location.pathname;

  trackAnalyticsEvent({
    event_name: eventName,
    page_path: pagePath,
    content_type: extra.contentType,
    content_id: extra.contentId,
    referrer_domain: document.referrer ? new URL(document.referrer).hostname : "direct",
    consent_state: "granted",
  }).catch(() => {
    // Non-blocking telemetry
  });
}
