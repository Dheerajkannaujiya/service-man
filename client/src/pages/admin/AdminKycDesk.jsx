import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink, Clock, User, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminKycDesk() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadKycQueue();
  }, []);

  const loadKycQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/pending');
      if (res.data.success) {
        setDocuments(res.data.documents);
      }
    } catch (err) {
      console.warn('Failed to load KYC queue');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (documentId, status) => {
    setProcessing(true);
    try {
      const res = await api.put(`/kyc/review/${documentId}`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : ''
      });

      if (res.data.success) {
        setSelectedDoc(null);
        setRejectionReason('');
        loadKycQueue();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review document');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck size={22} />
            </div>
            KYC Document Verification Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review submitted government identity and trade certificates to approve verified partner status.
          </p>
        </div>

        <button
          onClick={loadKycQueue}
          className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Queue
        </button>
      </div>

      {/* Documents Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading KYC queue...</div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
            <p className="font-bold text-white font-display text-base">KYC Queue is Clear!</p>
            <p className="text-slate-400 text-xs">All submitted documents have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Provider Details</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Document Number</th>
                  <th className="py-3 px-4">File Attachment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.providerId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={doc.providerId?.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white block font-display">{doc.providerId?.name || 'Verified Professional'}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{doc.providerId?.email || doc.providerId?.phone || 'Delhi NCR'} • {doc.providerId?.city || 'NCR'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold uppercase">
                      <span className="flex items-center gap-1.5 text-cyan-300">
                        <FileText size={14} className="text-cyan-400" />
                        {doc.documentType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-semibold text-slate-200">
                      {doc.documentNumber}
                    </td>

                    <td className="py-4 px-4">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold"
                      >
                        <ExternalLink size={14} /> Open Document
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleReview(doc._id, 'verified')}
                          disabled={processing}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          disabled={processing}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
              <XCircle size={18} className="text-rose-400" /> Reject Document
            </h3>
            <p className="text-xs text-slate-400">
              Provide a clear reason for rejecting the document submitted by {selectedDoc.providerId?.name || 'Provider'}.
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Document image is blurry or expired. Please upload a clear color scan."
              className="w-full p-3 text-xs rounded-xl glass-input placeholder:text-slate-500"
            ></textarea>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedDoc._id, 'rejected')}
                disabled={!rejectionReason.trim() || processing}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
