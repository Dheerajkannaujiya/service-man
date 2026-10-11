import React, { useState, useEffect } from 'react';
import { ShieldCheck, Upload, FileText, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
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
        setMessage('Document successfully uploaded! Admin verification pending.');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck size={26} className="text-brand-600" />
          KYC &amp; Professional Verification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit government identity and professional certifications to activate your account for live customer dispatches.
        </p>
      </div>

      {/* KYC Status Alert Banner */}
      <div
        className={`p-5 rounded-3xl border flex items-start gap-3.5 ${
          kycStatus === 'verified'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : kycStatus === 'rejected'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}
      >
        <div className="mt-0.5">
          {kycStatus === 'verified' ? (
            <CheckCircle size={20} className="text-emerald-600" />
          ) : kycStatus === 'rejected' ? (
            <XCircle size={20} className="text-rose-600" />
          ) : (
            <Clock size={20} className="text-amber-600" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm">
              Current Status:{' '}
              <span className="uppercase">{kycStatus}</span>
            </h3>
            <StatusBadge status={kycStatus} />
          </div>
          <p className="text-xs mt-1 leading-relaxed">
            {kycStatus === 'verified'
              ? 'Congratulations! Your profile has passed background verification. You are fully eligible for AI GPS job dispatch and the "Verified & Trusted" badge.'
              : kycStatus === 'rejected'
              ? `Verification was rejected: "${rejectionReason}". Please re-upload legible documents below.`
              : 'Your submitted documents are currently in queue for review by our operations verification desk.'}
          </p>
        </div>
      </div>

      {/* Upload Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Upload size={18} className="text-brand-600" /> Upload Verification Document
        </h3>

        {message && (
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="aadhaar">Government Aadhaar Card</option>
                <option value="pan">PAN Card</option>
                <option value="trade_license">Trade License / Professional ID</option>
                <option value="degree_certificate">Vocational / Degree Certificate</option>
                <option value="passport">Passport</option>
                <option value="voter_id">Voter ID</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document / Identification Number
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="e.g. XXXX-XXXX-4819 or LIC-2026"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Document File (PDF, PNG, JPG - Max 10MB)
            </label>
            <input
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 text-xs border border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {uploading ? 'Uploading Securely...' : 'Submit Document for Review'}
          </button>
        </form>
      </div>

      {/* Submitted Documents Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">Submitted Documents Vault</h3>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No documents submitted yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Number</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Uploaded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {documents.map((d) => (
                  <tr key={d._id}>
                    <td className="py-3 px-3 font-semibold uppercase flex items-center gap-1.5">
                      <FileText size={14} className="text-brand-600" />
                      {d.documentType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-3 font-mono">{d.documentNumber}</td>
                    <td className="py-3 px-3">
                      <StatusBadge status={d.status} />
                      {d.rejectionReason && (
                        <p className="text-[10px] text-rose-600 mt-1">{d.rejectionReason}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString()}
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
