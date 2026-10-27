import React, { useState, useEffect } from 'react';
import { FileText, Shield, Clock, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { MOCK_AUDIT_LOGS } from '../../services/mockData';

export default function AdminAuditLogsView() {
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.warn('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield size={22} />
            </div>
            Platform Security &amp; Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all administrative actions, KYC decisions, user registrations, and disciplinary sanctions.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Audit Trail
        </button>
      </div>

      <div className="glass-panel rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Querying security audit logs...</div>
        ) : logs.length === 0 ? (
          <p className="py-20 text-center text-xs text-slate-500">No audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity Affected</th>
                  <th className="py-3 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-display">
                      {log.actorEmail}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {log.entity} #{log.entityId?.slice(-6)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
