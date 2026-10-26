"use client";

import { useEffect, useState } from "react";
import { Download, Plus, DollarSign, TrendingUp, Filter, Trash2, Edit } from "lucide-react";
import {
  getAdminLeads,
  createAdminLead,
  updateAdminLead,
  deleteAdminLead
} from "../../../lib/api";

export default function AdminLeadsManager() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    organization: "",
    source: "Direct",
    inquiry_type: "Consulting",
    pipeline_status: "Lead",
    estimated_value: 5000,
    currency: "USD",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeads = () => {
    setLoading(true);
    getAdminLeads(statusFilter)
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdminLead(newLead);
      setIsModalOpen(false);
      fetchLeads();
    } catch (err: any) {
      alert("Error adding lead: " + err.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAdminLead(id, { pipeline_status: newStatus });
      fetchLeads();
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead record?")) return;
    try {
      await deleteAdminLead(id);
      fetchLeads();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleExportCsv = () => {
    const token = localStorage.getItem("portfolio_admin_token");
    const exportUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"}/admin/leads-export/csv`;
    
    // Trigger download
    fetch(exportUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads_export_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert("Export failed: " + err.message));
  };

  const totalPipeline = leads.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Client & Deal Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track business opportunities, consulting engagements, and pipeline values.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-6 card-glow">
        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-400">Total Filtered Opportunities</span>
          <p className="text-2xl font-extrabold text-white">{leads.length} Leads</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono text-slate-400">Total Pipeline Value</span>
          <p className="text-2xl font-extrabold text-emerald-400">
            ${totalPipeline.toLocaleString()} USD
          </p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 font-mono uppercase text-[11px] border-b border-navy-600/60">
              <tr>
                <th className="px-6 py-4">Lead Contact</th>
                <th className="px-6 py-4">Organization</th>
                <th className="px-6 py-4">Inquiry Type</th>
                <th className="px-6 py-4">Est. Value</th>
                <th className="px-6 py-4">Pipeline Stage</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/40">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-navy-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm">{l.name}</p>
                    <p className="font-mono text-slate-400 text-[11px]">{l.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{l.organization || "Independent"}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{l.inquiry_type}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                    {l.estimated_value ? `$${l.estimated_value.toLocaleString()}` : "Unset"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={l.pipeline_status}
                      onChange={(e) => handleStatusChange(l.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-navy-900 border border-navy-600 text-xs font-semibold text-brand-300"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Qualified">Qualified</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Converted">Won / Converted</option>
                      <option value="Closed">Closed / Lost</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="p-1.5 rounded-lg bg-navy-700 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-navy-800 border border-navy-600 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Lead</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newLead.email}
                  onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Organization</label>
                <input
                  type="text"
                  value={newLead.organization}
                  onChange={(e) => setNewLead({ ...newLead, organization: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    value={newLead.estimated_value}
                    onChange={(e) => setNewLead({ ...newLead, estimated_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                  <select
                    value={newLead.pipeline_status}
                    onChange={(e) => setNewLead({ ...newLead, pipeline_status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Qualified">Qualified</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Proposal">Proposal</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-700 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
