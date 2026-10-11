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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Star size={26} className="text-amber-500 fill-amber-500" /> Reviews &amp; AI Reputation Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Every customer rating is evaluated by our NLP sentiment and fraud analyzer to calculate your Trust Score.
        </p>
      </div>

      {/* Trust Badge & Reputation Hero */}
      <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <span className="text-xs uppercase font-bold text-emerald-400">Reputation Overview</span>
            {reviewsData?.hasTrustBadge && <TrustBadge size="sm" />}
          </div>
          <div className="flex items-baseline gap-3 justify-center md:justify-start">
            <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400">
              {reviewsData?.trustScore || 75}%
            </span>
            <span className="text-slate-400 text-xs">Trust Score Index</span>
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            Maintaining a Trust Score &gt;= 80% with an average rating &gt;= 4.2 grants you the coveted{' '}
            <strong className="text-emerald-300">"Verified &amp; Trusted"</strong> badge in search rankings.
          </p>
        </div>

        {/* Requirements checklist */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2 text-xs w-full md:w-auto">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 size={15} /> KYC Verified Identity
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 size={15} /> Rating Average: {reviewsData?.ratingAverage || 5.0} / 5.0
          </div>
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <CheckCircle2 size={15} /> 0 Active Quality Complaints
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900">
          Customer Feedback ({reviewsData?.count || 0})
        </h3>

        {!reviewsData?.reviews || reviewsData.reviews.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No reviews submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reviewsData.reviews.map((r) => (
              <div
                key={r._id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={r.authorId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                      alt={r.authorId?.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{r.authorId?.name}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={14} showScore />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{r.comment}"
                </p>

                {/* AI Review Analyzer Metadata Tag */}
                {r.analysis && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-semibold text-brand-600">
                        <Sparkles size={12} /> AI Sentiment:
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          r.analysis.sentimentLabel === 'positive'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.analysis.sentimentLabel === 'negative'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.analysis.sentimentLabel} ({r.analysis.sentimentScore})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>Trust Impact:</span>
                      <span
                        className={`font-bold ${
                          r.analysis.trustScoreDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
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
