"use client";

import { useEffect, useState } from "react";
import { History, Shield, Clock } from "lucide-react";
import { getAdminAuditLogs } from "../../../lib/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminAuditLogs(50)
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <History className="w-7 h-7 text-brand-400" />
          Administrative Security Audit Log
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cryptographically recorded actions, publications, and administrative session events.
        </p>
      </div>

      <div className="bg-navy-800 border border-navy-600/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-900/80 text-slate-400 font-mono uppercase text-[11px] border-b border-navy-600/60">
              <tr>
                <th className="px-6 py-4">Timestamp (UTC)</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Entity Type</th>
                <th className="px-6 py-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/40">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-700/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    <span className="px-2 py-0.5 rounded bg-navy-900 border border-navy-600 font-mono text-brand-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {log.entity_type || "Authentication"}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-400 text-[11px] truncate max-w-xs">
                    {log.metadata_json || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
