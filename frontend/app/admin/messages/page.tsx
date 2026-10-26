"use client";

import { useEffect, useState } from "react";
import { Mail, Clock, Trash2, CheckCircle2, MessageSquare, AlertCircle, Building, Calendar } from "lucide-react";
import {
  getAdminMessages,
  updateAdminMessage,
  deleteAdminMessage
} from "../../../lib/api";

export default function AdminMessagesManager() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const [editStatus, setEditStatus] = useState("New");
  const [editNotes, setEditNotes] = useState("");

  const fetchMessages = () => {
    setLoading(true);
    getAdminMessages(statusFilter)
      .then((data) => {
        setMessages(data);
        if (data.length > 0 && !selectedMessage) {
          setSelectedMessage(data[0]);
          setEditStatus(data[0].status);
          setEditNotes(data[0].internal_notes || "");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const selectMessage = (msg: any) => {
    setSelectedMessage(msg);
    setEditStatus(msg.status);
    setEditNotes(msg.internal_notes || "");

    // Automatically mark new messages as Read if New
    if (msg.status === "New") {
      updateAdminMessage(msg.id, { status: "Read" }).then(() => {
        msg.status = "Read";
        setEditStatus("Read");
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedMessage) return;
    try {
      const updated = await updateAdminMessage(selectedMessage.id, {
        status: editStatus,
        internal_notes: editNotes,
      });
      setSelectedMessage(updated);
      fetchMessages();
    } catch (err: any) {
      alert("Error updating message: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      await deleteAdminMessage(id);
      setSelectedMessage(null);
      fetchMessages();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Inquiries & Contact Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review submissions, qualify client requests, and manage follow-ups.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-navy-800 border border-navy-600 rounded-xl p-1 text-xs">
          {["All", "New", "Read", "Qualified", "In progress", "Converted", "Spam"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? "bg-brand-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Messages List Column */}
        <div className="lg:col-span-5 bg-navy-800 border border-navy-600/80 rounded-2xl overflow-hidden divide-y divide-navy-600/40 max-h-[75vh] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No inquiries found in this category.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                onClick={() => selectMessage(m)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedMessage?.id === m.id
                    ? "bg-navy-700/80 border-l-4 border-brand-500"
                    : "hover:bg-navy-700/40"
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white truncate max-w-[150px]">{m.name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs font-semibold text-brand-300 truncate">{m.subject}</p>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{m.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-900 border border-navy-600 text-slate-300">
                    {m.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{m.inquiry_type}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Details & Triage Panel */}
        <div className="lg:col-span-7 bg-navy-800 border border-navy-600/80 rounded-2xl p-6 sm:p-8 space-y-6">
          {selectedMessage ? (
            <>
              {/* Header */}
              <div className="border-b border-navy-600/60 pb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedMessage.subject}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="text-slate-200 font-semibold">{selectedMessage.name}</span>
                    <span>&bull;</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-brand-400 hover:underline">
                      {selectedMessage.email}
                    </a>
                    {selectedMessage.organization && (
                      <>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Building className="w-3 h-3" />
                          {selectedMessage.organization}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  title="Delete inquiry"
                  className="p-2 rounded-lg bg-navy-700 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message Body */}
              <div className="bg-navy-900/70 p-5 rounded-xl border border-navy-600/50 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              {/* Extra Lead Info */}
              {(selectedMessage.budget_range || selectedMessage.timeline) && (
                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-navy-900/40 p-3 rounded-xl border border-navy-600/40">
                  <div>
                    <span className="text-slate-500">Budget Range:</span>{" "}
                    <span className="text-slate-300">{selectedMessage.budget_range || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Target Timeline:</span>{" "}
                    <span className="text-slate-300">{selectedMessage.timeline || "N/A"}</span>
                  </div>
                </div>
              )}

              {/* Triage Status & Internal Notes */}
              <div className="space-y-4 pt-4 border-t border-navy-600/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Triage & Follow-up Notes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Inquiry Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs"
                    >
                      <option value="New">New</option>
                      <option value="Read">Read</option>
                      <option value="Qualified">Qualified</option>
                      <option value="In progress">In progress</option>
                      <option value="Replied">Replied</option>
                      <option value="Converted">Converted to Deal</option>
                      <option value="Closed">Closed</option>
                      <option value="Spam">Spam</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Internal Engineering / Follow-Up Notes
                  </label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Add internal notes about conversations, scope, or next steps..."
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-navy-600 text-white text-xs resize-none"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30"
                >
                  Save Status & Notes
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              Select an inquiry from the left to view details and triage.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
