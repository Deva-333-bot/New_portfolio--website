const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // send cookies
  });

  if (!res.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errorJson = await res.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      errorDetail = res.statusText;
    }
    throw new Error(errorDetail);
  }

  // Return json or blob depending on content-type
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res as unknown as T;
}

// --- Public API Functions ---
export const getPublicProfile = () => fetchApi("/public/profile");
export const getPublicSkills = () => fetchApi("/public/skills");
export const getPublicProjects = (category?: string) => 
  fetchApi(`/public/projects${category ? `?category=${encodeURIComponent(category)}` : ""}`);
export const getPublicProjectDetail = (slug: string) => fetchApi(`/public/projects/${slug}`);
export const getPublicPosts = () => fetchApi("/public/posts");
export const getPublicPostDetail = (slug: string) => fetchApi(`/public/posts/${slug}`);
export const getPublicTestimonials = () => fetchApi("/public/testimonials");
export const submitContactForm = (data: any) => fetchApi("/public/contact", {
  method: "POST",
  body: JSON.stringify(data),
});
export const trackAnalyticsEvent = (eventData: any) => fetchApi("/public/analytics/events", {
  method: "POST",
  body: JSON.stringify(eventData),
});

// --- Admin Auth ---
export const adminLogin = (creds: any) => fetchApi("/auth/login", {
  method: "POST",
  body: JSON.stringify(creds),
});
export const adminLogout = () => fetchApi("/auth/logout", { method: "POST" });
export const getAdminMe = () => fetchApi("/auth/me");
export const adminChangePassword = (data: any) => fetchApi("/auth/password/change", {
  method: "POST",
  body: JSON.stringify(data),
});

// --- Admin CMS ---
export const getAdminProfile = () => fetchApi("/admin/profile");
export const updateAdminProfile = (data: any) => fetchApi("/admin/profile", {
  method: "PUT",
  body: JSON.stringify(data),
});
export const getAdminSocialLinks = () => fetchApi("/admin/social-links");
export const createAdminSocialLink = (data: any) => fetchApi("/admin/social-links", {
  method: "POST",
  body: JSON.stringify(data),
});
export const updateAdminSocialLink = (id: string, data: any) => fetchApi(`/admin/social-links/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const deleteAdminSocialLink = (id: string) => fetchApi(`/admin/social-links/${id}`, { method: "DELETE" });

export const getAdminProjects = () => fetchApi("/admin/projects");
export const createAdminProject = (data: any) => fetchApi("/admin/projects", {
  method: "POST",
  body: JSON.stringify(data),
});
export const updateAdminProject = (id: string, data: any) => fetchApi(`/admin/projects/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const publishAdminProject = (id: string) => fetchApi(`/admin/projects/${id}/publish`, { method: "POST" });
export const unpublishAdminProject = (id: string) => fetchApi(`/admin/projects/${id}/unpublish`, { method: "POST" });
export const archiveAdminProject = (id: string) => fetchApi(`/admin/projects/${id}/archive`, { method: "POST" });
export const deleteAdminProject = (id: string) => fetchApi(`/admin/projects/${id}`, { method: "DELETE" });

export const getAdminSkills = () => fetchApi("/admin/skills");
export const createAdminSkill = (data: any) => fetchApi("/admin/skills", {
  method: "POST",
  body: JSON.stringify(data),
});
export const updateAdminSkill = (id: string, data: any) => fetchApi(`/admin/skills/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const deleteAdminSkill = (id: string) => fetchApi(`/admin/skills/${id}`, { method: "DELETE" });

export const getAdminPosts = () => fetchApi("/admin/posts");
export const createAdminPost = (data: any) => fetchApi("/admin/posts", {
  method: "POST",
  body: JSON.stringify(data),
});
export const updateAdminPost = (id: string, data: any) => fetchApi(`/admin/posts/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const publishAdminPost = (id: string) => fetchApi(`/admin/posts/${id}/publish`, { method: "POST" });
export const unpublishAdminPost = (id: string) => fetchApi(`/admin/posts/${id}/unpublish`, { method: "POST" });
export const deleteAdminPost = (id: string) => fetchApi(`/admin/posts/${id}`, { method: "DELETE" });

export const getAdminTestimonials = () => fetchApi("/admin/testimonials");
export const createAdminTestimonial = (data: any) => fetchApi("/admin/testimonials", {
  method: "POST",
  body: JSON.stringify(data),
});
export const updateAdminTestimonial = (id: string, data: any) => fetchApi(`/admin/testimonials/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const approveAdminTestimonial = (id: string) => fetchApi(`/admin/testimonials/${id}/approve`, { method: "POST" });
export const deleteAdminTestimonial = (id: string) => fetchApi(`/admin/testimonials/${id}`, { method: "DELETE" });

export const getAdminCV = () => fetchApi("/admin/cv");
export const uploadAdminCV = (formData: FormData) => fetchApi("/admin/cv", {
  method: "POST",
  body: formData,
});
export const publishAdminCV = (id: string) => fetchApi(`/admin/cv/${id}/publish`, { method: "POST" });
export const unpublishAdminCV = (id: string) => fetchApi(`/admin/cv/${id}/unpublish`, { method: "POST" });

export const getAdminMessages = (status?: string) => fetchApi(`/admin/messages${status ? `?status_filter=${status}` : ""}`);
export const updateAdminMessage = (id: string, data: any) => fetchApi(`/admin/messages/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const deleteAdminMessage = (id: string) => fetchApi(`/admin/messages/${id}`, { method: "DELETE" });

export const getAdminLeads = (status?: string) => fetchApi(`/admin/leads${status ? `?status_filter=${status}` : ""}`);
export const createAdminLead = (data: any) => fetchApi("/admin/leads", {
  method: "POST",
  body: JSON.stringify(data),
});
export const updateAdminLead = (id: string, data: any) => fetchApi(`/admin/leads/${id}`, {
  method: "PATCH",
  body: JSON.stringify(data),
});
export const deleteAdminLead = (id: string) => fetchApi(`/admin/leads/${id}`, { method: "DELETE" });

export const getAdminAnalyticsOverview = (days: number = 30) => fetchApi(`/admin/analytics/overview?days=${days}`);
export const getAdminAuditLogs = (limit: number = 50) => fetchApi(`/admin/audit-logs?limit=${limit}`);
export const getAdminSettings = () => fetchApi("/admin/settings");
export const updateAdminSetting = (key: string, value: any) => fetchApi(`/admin/settings/${key}`, {
  method: "PATCH",
  body: JSON.stringify(value),
});
export const getAdminGitHubRepos = () => fetchApi("/admin/integrations/github/repositories");
export const refreshAdminGitHubRepos = () => fetchApi("/admin/integrations/github/refresh", { method: "POST" });
