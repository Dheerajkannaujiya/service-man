import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, CheckCircle, AlertTriangle, Star, Search } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles size={26} className="text-purple-600" />
            AI Review &amp; NLP Fraud Detection Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time natural language sentiment analysis, abusive keyword auditing, and coordinated spam review detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {flaggedCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 flex items-center gap-1.5">
              <ShieldAlert size={14} /> {flaggedCount} Flagged for Fraud / Abuse
            </span>
          )}
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Auditing reviews feed...</div>
        ) : reviews.length === 0 ? (
          <p className="py-20 text-center text-xs text-slate-400">No reviews evaluated yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Author &amp; Target</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 max-w-sm">Customer Feedback</th>
                  <th className="py-3 px-4">NLP Sentiment</th>
                  <th className="py-3 px-4">Fraud Score</th>
                  <th className="py-3 px-4">Trust Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reviews.map((r) => {
                  const analysis = r.analysis;
                  const isFlagged = r.isFlagged || analysis?.fraudScore >= 40;

                  return (
                    <tr
                      key={r._id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isFlagged ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900 block">{r.authorId?.name}</span>
                        <span className="text-[11px] text-slate-400 block">
                          → {r.recipientId?.name} ({r.recipientId?.role})
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <StarRating rating={r.rating} size={13} showScore />
                      </td>

                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-slate-800 leading-relaxed italic">"{r.comment}"</p>
                        {analysis?.abusiveLanguageDetected && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            <AlertTriangle size={11} /> Abusive Words Detected
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            analysis?.sentimentLabel === 'positive'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : analysis?.sentimentLabel === 'negative'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {analysis?.sentimentLabel || 'neutral'} ({analysis?.sentimentScore || 0})
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-black ${
                              analysis?.fraudScore >= 40 ? 'text-rose-600' : 'text-slate-700'
                            }`}
                          >
                            {analysis?.fraudScore || 0}%
                          </span>
                          {analysis?.fraudScore >= 40 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-bold">
                        <span
                          className={
                            analysis?.trustScoreDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }
                        >
                          {analysis?.trustScoreDelta > 0 ? `+${analysis?.trustScoreDelta}` : analysis?.trustScoreDelta || 0} pts
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
