"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Cpu,
  FileText,
  MessageSquare,
  TrendingUp,
  FileDown,
  Globe,
  Github,
  History,
  LogOut,
  ExternalLink,
  Quote,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { getAdminMe, adminLogout } from "../../lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If on login page, render children directly without sidebar
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    getAdminMe()
      .then((user) => {
        setAdminUser(user);
        setLoading(false);
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [pathname, isLoginPage, router]);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch {}
    localStorage.removeItem("portfolio_admin_token");
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-slate-400 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-brand-500 animate-ping" />
          <span>Authenticating administrator session...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
    { label: "Profile", href: "/admin/profile", icon: User },
    { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { label: "Skills", href: "/admin/skills", icon: Cpu },
    { label: "Blog Posts", href: "/admin/blog", icon: FileText },
    { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
    { label: "CV Document", href: "/admin/cv", icon: FileDown },
    { label: "Inquiries", href: "/admin/messages", icon: MessageSquare },
    { label: "Leads Pipeline", href: "/admin/leads", icon: TrendingUp },
    { label: "SEO Settings", href: "/admin/seo", icon: Globe },
    { label: "GitHub Sync", href: "/admin/github", icon: Github },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: History },
  ];

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-navy-800 border-r border-navy-600/70 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Sidebar Header */}
          <div className="h-16 px-6 border-b border-navy-600/60 flex items-center justify-between">
            <Link href="/admin/overview" className="flex items-center gap-2">
              <span className="text-brand-400 font-mono font-bold text-lg">&lt;/&gt;</span>
              <span className="font-bold text-white tracking-tight">Admin CMS</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30"
                      : "text-slate-300 hover:text-white hover:bg-navy-700"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-navy-600/60 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="truncate">{adminUser?.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-navy-700 hover:bg-rose-900/40 text-slate-300 hover:text-rose-200 text-xs font-semibold border border-navy-600 hover:border-rose-500/50 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-navy-800/80 backdrop-blur-md border-b border-navy-600/60 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">FastAPI Live API & PostgreSQL</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 border border-navy-600 text-xs font-medium text-slate-200 hover:text-white transition-all"
            >
              <span>View Public Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
