"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  FileDown,
  MessageSquare,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Compass
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { getAdminAnalyticsOverview } from "../../../lib/api";

export default function AdminOverviewPage() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = () => {
    setLoading(true);
    getAdminAnalyticsOverview(days)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics fetch failed:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, [days]);

  return (
    <div className="space-y-8">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Business Intelligence & Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real visitor interactions, lead conversions, and project engagement metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-navy-800 border border-navy-600 rounded-xl p-1 text-xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  days === d
                    ? "bg-brand-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>

          <button
            onClick={fetchOverview}
            className="p-2.5 rounded-xl bg-navy-800 border border-navy-600 hover:border-brand-500 text-slate-300 hover:text-white transition-all"
            aria-label="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-2 card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Page Views</span>
            <Eye className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {data?.total_page_views?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400">Recorded across public pages</p>
        </div>

        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-2 card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Unique Visitors</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {data?.unique_visitors?.toLocaleString() || 0}
          </div>
          <p className="text-[11px] text-slate-400">Salted daily session references</p>
        </div>

        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-2 card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">CV Downloads</span>
            <FileDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {data?.cv_downloads || 0}
          </div>
          <p className="text-[11px] text-slate-400">Recruiter document downloads</p>
        </div>

        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-2 card-glow">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Conversion Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {data?.conversion_rate_percent || 0}%
          </div>
          <p className="text-[11px] text-slate-400">Visitor → Inquiry conversion</p>
        </div>
      </div>

      {/* Secondary Metrics: Pipeline & Inquiries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Contact Inquiries</span>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>{data?.contact_inquiries || 0}</span>
          </div>
        </div>

        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Qualified Pipeline Leads</span>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>{data?.qualified_leads || 0}</span>
          </div>
        </div>

        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Pipeline Value</span>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>${(data?.pipeline_total_value || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visitors & Views Timeline */}
        <div className="lg:col-span-8 bg-navy-800 border border-navy-600/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Traffic Activity Over Time
            </h3>
            <span className="text-xs font-mono text-slate-400">Daily Views</span>
          </div>

          <div className="h-72 w-full pt-4">
            {data?.views_by_date && data.views_by_date.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.views_by_date}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0B1226", borderColor: "#252B43", borderRadius: "12px", color: "#F8FAFC" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#7857FF"
                    strokeWidth={3}
                    dot={{ fill: "#7857FF", r: 4 }}
                    activeDot={{ r: 6, fill: "#A78BFA" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No recorded traffic activity in this window.
              </div>
            )}
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div className="lg:col-span-4 bg-navy-800 border border-navy-600/80 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-400" />
              Traffic Acquisition
            </h3>
            <span className="text-xs font-mono text-slate-400">Referrers</span>
          </div>

          <div className="h-72 w-full pt-4">
            {data?.traffic_sources && data.traffic_sources.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.traffic_sources} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis dataKey="source" type="category" stroke="#64748B" fontSize={11} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0B1226", borderColor: "#252B43", borderRadius: "12px", color: "#F8FAFC" }}
                  />
                  <Bar dataKey="visitors" fill="#7857FF" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No referrer data.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Performance & Funnel Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Most Viewed Pages */}
        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Top Visited Pages
          </h3>
          <div className="space-y-2">
            {data?.top_pages?.map((p: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-navy-600/50 text-xs"
              >
                <span className="font-mono text-slate-300">{p.path}</span>
                <span className="font-bold text-brand-400">{p.views} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Engaged Projects */}
        <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Most Viewed Projects
          </h3>
          <div className="space-y-2">
            {data?.top_projects?.map((pr: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-navy-900/60 border border-navy-600/50 text-xs"
              >
                <span className="font-mono text-slate-300">{pr.slug}</span>
                <span className="font-bold text-indigo-400">{pr.views} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
