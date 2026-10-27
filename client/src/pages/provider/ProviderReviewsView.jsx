import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import StarRating from '../../components/StarRating';
import TrustBadge from '../../components/TrustBadge';

export default function ProviderReviewsView() {
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provider/reviews');
      if (res.data.success) {
        setReviewsData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Star size={22} className="fill-amber-400/30" />
          </div>
          Reviews &amp; AI Reputation Engine
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Every customer rating is evaluated by our NLP sentiment and fraud analyzer to calculate your real-time Trust Score.
        </p>
      </div>

      {/* Trust Badge & Reputation Hero */}
      <div className="glass-panel text-white rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left relative z-10">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400 tracking-wider">
              Reputation Radar
            </span>
            {reviewsData?.hasTrustBadge && <TrustBadge size="sm" />}
          </div>
          <div className="flex items-baseline gap-3 justify-center md:justify-start">
            <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
              {reviewsData?.trustScore || 85}%
            </span>
            <span className="text-slate-400 text-xs font-mono">Trust Score Index</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md leading-relaxed">
            Maintaining a Trust Score &gt;= 80% with an average rating &gt;= 4.2 grants you the coveted{' '}
            <strong className="text-emerald-400">"Verified &amp; Trusted"</strong> badge in customer search rankings and instant priority dispatches.
          </p>
        </div>

        {/* Requirements checklist */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 space-y-2.5 text-xs w-full md:w-auto relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 size={15} /> KYC Verified Government ID
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 size={15} /> Rating Average: {reviewsData?.ratingAverage || 5.0} / 5.0
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 size={15} /> 0 Active Quality Complaints
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-sm space-y-5">
        <h3 className="font-bold text-base text-white font-display flex items-center gap-2">
          <Sparkles size={18} className="text-cyan-400" />
          Customer Feedback ({reviewsData?.count || 0})
        </h3>

        {!reviewsData?.reviews || reviewsData.reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-10 text-center">No reviews submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reviewsData.reviews.map((r) => (
              <div
                key={r._id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.authorId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={r.authorId?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white font-display">{r.authorId?.name || 'Verified Customer'}</h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={14} showScore />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{r.comment}"
                </p>

                {/* AI Review Analyzer Metadata Tag */}
                {r.analysis && (
                  <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-semibold text-cyan-400">
                        <Sparkles size={12} /> AI Sentiment:
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] font-mono border ${
                          r.analysis.sentimentLabel === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : r.analysis.sentimentLabel === 'negative'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {r.analysis.sentimentLabel} ({r.analysis.sentimentScore})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Trust Impact:</span>
                      <span
                        className={`font-bold font-mono ${
                          r.analysis.trustScoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {r.analysis.trustScoreDelta > 0 ? `+${r.analysis.trustScoreDelta}` : r.analysis.trustScoreDelta} pts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
