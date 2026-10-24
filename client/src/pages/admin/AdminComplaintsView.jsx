import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, Clock, User, Filter } from 'lucide-react';
import api from '../../services/api';

export default function AdminComplaintsView() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionTaken, setActionTaken] = useState('warning_issued');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.warn('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    setProcessing(true);

    try {
      const res = await api.put(`/admin/complaints/${selectedComplaint._id}/resolve`, {
        actionTaken,
        adminNotes,
        severity: selectedComplaint.severity
      });

      if (res.data.success) {
        alert(`Complaint resolved with action: ${actionTaken.replace(/_/g, ' ')}`);
        setSelectedComplaint(null);
        setAdminNotes('');
        loadComplaints();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Resolution failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <AlertOctagon size={26} className="text-rose-600" />
            Complaints &amp; Quality Control Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Investigate customer reports of misconduct, overcharging, or late arrivals and trigger official quality escalations.
          </p>
        </div>

        <button onClick={loadComplaints} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
          Refresh Desk
        </button>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <p className="font-bold text-slate-700">Zero Open Complaints!</p>
            <p className="text-slate-400">Quality control reports are completely resolved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Complainant</th>
                  <th className="py-3 px-4">Reported Party</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">
                      {c.complainantId?.name || 'Customer'} ({c.complainantRole || c.complainantId?.role || 'customer'})
                    </td>
                    <td className="py-4 px-4 font-semibold text-rose-700">
                      {c.respondentId?.name || c.reportedUserId?.name || 'Technician'} ({c.respondentId?.role || c.reportedUserId?.role || 'provider'})
                    </td>
                    <td className="py-4 px-4 uppercase font-medium">
                      {c.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.severity === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.severity === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {c.status === 'open' || c.status === 'investigating' ? (
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                        >
                          Investigate &amp; Resolve
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Resolved ({c.actionTaken?.replace(/_/g, ' ')})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">Resolve Complaint Report</h3>
            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <p><strong>Complainant:</strong> {selectedComplaint.complainantId?.name}</p>
              <p><strong>Reported Provider:</strong> {selectedComplaint.respondentId?.name}</p>
              <p><strong>Description:</strong> "{selectedComplaint.description}"</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Decision</label>
              <select
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              >
                <option value="warning_issued">Issue 1st Official Quality Warning</option>
                <option value="suspended">Apply 30-Day Temporary Account Suspension</option>
                <option value="permanently_banned">Apply Permanent Ban &amp; ID Blacklist</option>
                <option value="dismissed">Dismiss Complaint (No Violation Found)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Investigation Notes</label>
              <textarea
                rows={3}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Detail customer verification findings or resolution agreement..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500"
              ></textarea>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={processing}
                className="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs disabled:opacity-50"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
