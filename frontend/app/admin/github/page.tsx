"use client";

import { useEffect, useState } from "react";
import { Github, RefreshCw, Star, GitFork, ExternalLink, Pin } from "lucide-react";
import { getAdminGitHubRepos, refreshAdminGitHubRepos } from "../../../lib/api";

export default function AdminGitHubManager() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRepos = () => {
    setLoading(true);
    getAdminGitHubRepos()
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRepos();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshed = await refreshAdminGitHubRepos();
      setRepos(refreshed);
    } catch (err: any) {
      alert("GitHub Refresh failed: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Github className="w-7 h-7 text-white" />
            GitHub Integration & Repositories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-side repository synchronization with automatic rate-limit caching.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>{refreshing ? "Syncing..." : "Refresh from GitHub"}</span>
        </button>
      </div>

      {/* Repositories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => (
          <div
            key={repo.name}
            className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 card-glow"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm tracking-tight">{repo.name}</span>
                {repo.is_pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {repo.description || "Public repository and architectural components."}
              </p>
            </div>

            <div className="pt-4 border-t border-navy-600/50 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5 text-slate-400" />
                  {repo.forks_count}
                </span>
                <span className="text-brand-300">{repo.language}</span>
              </div>

              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="p-1 rounded text-slate-400 hover:text-white"
                title="View on GitHub"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
