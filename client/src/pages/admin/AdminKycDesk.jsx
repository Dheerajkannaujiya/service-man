import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, FileText, ExternalLink, Clock, User } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={26} className="text-brand-600" />
            KYC Document Verification Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted government identity and trade certificates to approve verified partner status.
          </p>
        </div>

        <button
          onClick={loadKycQueue}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
        >
          Refresh Queue
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading KYC queue...</div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
            <p className="font-bold text-slate-700">KYC Queue is Clear!</p>
            <p className="text-slate-400">All submitted documents have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Provider Details</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Document Number</th>
                  <th className="py-3 px-4">File Attachment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.providerId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={doc.providerId?.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{doc.providerId?.name || 'Verified Professional'}</span>
                          <span className="text-[11px] text-slate-400 block">{doc.providerId?.email || doc.providerId?.phone || 'Delhi NCR'} • {doc.providerId?.city || 'NCR'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-semibold uppercase">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-brand-600" />
                        {doc.documentType.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-semibold text-slate-800">
                      {doc.documentNumber}
                    </td>

                    <td className="py-4 px-4">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-brand-600 font-semibold text-[11px] hover:bg-blue-100"
                      >
                        Inspect File <ExternalLink size={12} />
                      </a>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="py-4 px-4 text-right">
                      {doc.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReview(doc._id, 'verified')}
                            disabled={processing}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors"
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            disabled={processing}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Reject {selectedDoc.documentType.toUpperCase()} Document
            </h3>
            <p className="text-xs text-slate-500">
              Please enter the specific reason for rejection. The provider will receive an in-app alert with instructions to re-upload.
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Scanned document is blurry, or expiration date has lapsed..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
            ></textarea>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReview(selectedDoc._id, 'rejected')}
                disabled={!rejectionReason.trim() || processing}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
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
