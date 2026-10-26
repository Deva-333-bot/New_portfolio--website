"use client";

import Link from "next/link";
import { ArrowUpRight, Github, Mail } from "lucide-react";

interface FooterProps {
  displayName?: string;
  publicEmail?: string;
}

export default function Footer({
  displayName = "Oduor Daivine Oluoch",
  publicEmail = "hello@florante.tech"
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 border-t border-navy-600/50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
       {/* Two-column footer: contact and social links */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12 border-b border-navy-600/40">
          
          {/* Column 1: Let's Work Together */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">
              Let&apos;s Work Together
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Have a project in mind?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              I&apos;m always open to discussing new projects, high-impact software architectures, and startup collaborations.
            </p>
            <div className="pt-1">
              <Link
                href="#contact"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                <span>Get In Touch</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          

          {/* Column 3: Follow Me & Contact Links */}
          <div className="space-y-4">
            <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">
              Follow Me
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Deva-333-bot"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 rounded-lg bg-navy-800 hover:bg-navy-700 border border-navy-600 hover:border-brand-500 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>

            <div className="space-y-1.5 pt-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
                <a href={`mailto:${publicEmail}`} className="hover:text-white transition-colors">
                  {publicEmail}
                </a>
              </p>
              <p className="text-slate-500 font-mono">
                Kenya
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar matching reference layout */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {currentYear} {displayName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("open-analytics-preferences"))}
              className="hover:text-slate-300 transition-colors"
            >
              Manage Analytics
            </button>
            <span>&bull;</span>
            <Link href="/admin/login" className="hover:text-slate-300 transition-colors">
              Admin Portal
            </Link>
            <span>&bull;</span>
            <span className="text-slate-400">
              Made with <span className="text-red-500">&#10084;</span> by {displayName.split(" ")[0]}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
