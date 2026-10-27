import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Clock, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function KycUploadView() {
  const [documents, setDocuments] = useState([]);
  const [kycStatus, setKycStatus] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Form
  const [docType, setDocType] = useState('aadhaar');
  const [docNumber, setDocNumber] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadKycData();
  }, []);

  const loadKycData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kyc/my-documents');
      if (res.data.success) {
        setDocuments(res.data.documents);
        setKycStatus(res.data.kycStatus);
        setRejectionReason(res.data.rejectionReason);
      }
    } catch (err) {
      console.warn('Failed to load KYC documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!docNumber.trim() || !file) {
      alert('Please provide document number and select a file to upload.');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('documentType', docType);
    formData.append('documentNumber', docNumber);
    formData.append('documentFile', file);

    try {
      const res = await api.post('/kyc/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setMessage('Document successfully uploaded! Operations team review pending.');
        setDocNumber('');
        setFile(null);
        loadKycData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck size={22} />
          </div>
          KYC &amp; Professional Verification Desk
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submit government identity and professional trade certifications to activate your account for live customer dispatches.
        </p>
      </div>

      {/* KYC Status Alert Banner */}
      <div
        className={`p-5 rounded-3xl border flex items-start gap-3.5 backdrop-blur-md ${
          kycStatus === 'verified'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : kycStatus === 'rejected'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        }`}
      >
        <div className="mt-0.5">
          {kycStatus === 'verified' ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : kycStatus === 'rejected' ? (
            <XCircle size={20} className="text-rose-400" />
          ) : (
            <Clock size={20} className="text-amber-400" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-white font-display">
              Audit Status: <span className="uppercase font-mono">{kycStatus}</span>
            </h3>
            <StatusBadge status={kycStatus} />
          </div>
          <p className="text-xs mt-1 leading-relaxed text-slate-300">
            {kycStatus === 'verified'
              ? 'Congratulations! Your profile has passed background verification. You are fully eligible for AI GPS job dispatch and the "Verified & Trusted" partner badge.'
              : kycStatus === 'rejected'
              ? `Verification was rejected: "${rejectionReason}". Please re-upload legible documents below.`
              : 'Your submitted documents are currently in queue for review by our operations verification desk.'}
          </p>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.08] shadow-2xl space-y-4">
        <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
          <Upload size={18} className="text-cyan-400" /> Upload Verification Document
        </h3>
        <p className="text-xs text-slate-400">
          Accepted types: Government Aadhaar Card, Driving License, or Certified Trade Diploma (PDF, JPG, PNG up to 10MB).
        </p>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input bg-slate-900"
              >
                <option value="aadhaar" className="bg-slate-900 text-white">Aadhaar Card (UIDAI)</option>
                <option value="driving_license" className="bg-slate-900 text-white">Driving License</option>
                <option value="trade_certificate" className="bg-slate-900 text-white">Trade / Skill Certificate</option>
                <option value="police_verification" className="bg-slate-900 text-white">Police Clearance Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Document / Identification Number
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. 5432-8765-1234"
                className="w-full px-3 py-2 text-xs rounded-xl glass-input placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Document File (JPG, PNG, or PDF)
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 border border-slate-800 rounded-xl p-2 bg-slate-900/40"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Upload size={14} />
            {uploading ? 'Uploading...' : 'Submit Document for Audit'}
          </button>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="glass-card rounded-3xl p-6 border border-white/[0.08] shadow-sm space-y-4">
        <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
          <FileText size={18} className="text-cyan-400" /> Submitted Identity Records
        </h3>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Checking document status...</div>
        ) : documents.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            No verification documents uploaded yet. Submit your Aadhaar card or license above to get verified.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase font-display">
                      {doc.documentType.replace(/_/g, ' ')}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">ID: {doc.documentNumber}</p>
                    <span className="text-[10px] text-slate-500">
                      Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <StatusBadge status={doc.status} />
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="View Document"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
