import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, CheckCircle2, AlertTriangle, Star, Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';

export default function AdminAiReviewsView() {
  const [reviews, setReviews] = useState([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAiReviews();
  }, []);

  const loadAiReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reviews-ai');
      if (res.data.success) {
        setReviews(res.data.reviews);
        setFlaggedCount(res.data.flaggedCount);
      }
    } catch (err) {
      console.warn('Failed to load AI reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles size={22} />
            </div>
            AI Review &amp; NLP Fraud Detection Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time natural language sentiment analysis, abusive keyword auditing, and coordinated spam review detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {flaggedCount > 0 && (
            <span className="px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5 font-mono">
              <ShieldAlert size={14} /> {flaggedCount} Flagged For Fraud / Abuse
            </span>
          )}
          <button
            onClick={loadAiReviews}
            className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Scan Feed
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Auditing natural language review logs...</div>
        ) : reviews.length === 0 ? (
          <p className="py-20 text-center text-xs text-slate-500">No customer reviews evaluated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase font-mono tracking-wider text-slate-400 bg-slate-900/80 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Customer &amp; Rating</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Review Text</th>
                  <th className="py-3 px-4">AI Sentiment</th>
                  <th className="py-3 px-4">Trust Impact</th>
                  <th className="py-3 px-4 text-right">Fraud Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="font-bold text-white block font-display">
                          {r.authorId?.name || 'Customer'}
                        </span>
                        <StarRating rating={r.rating} size={12} showScore />
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-cyan-300 block font-display">
                        {r.providerId?.name || 'Provider'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-300 italic text-[11px] leading-relaxed line-clamp-2">
                        "{r.comment}"
                      </p>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          r.analysis?.sentimentLabel === 'positive'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : r.analysis?.sentimentLabel === 'negative'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {r.analysis?.sentimentLabel || 'Neutral'} ({r.analysis?.sentimentScore || 0})
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold">
                      <span
                        className={
                          (r.analysis?.trustScoreDelta || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {(r.analysis?.trustScoreDelta || 0) > 0 ? `+${r.analysis.trustScoreDelta}` : r.analysis?.trustScoreDelta || 0} pts
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      {r.analysis?.isFlagged ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                          <AlertTriangle size={12} /> Suspicious
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Authentic
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
    </div>
  );
}
