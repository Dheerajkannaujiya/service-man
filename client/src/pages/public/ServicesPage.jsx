import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Wrench, Zap, Sparkles, Stethoscope, HeartHandshake, GraduationCap, Droplets, Paintbrush, Search, ChevronRight, Check } from 'lucide-react';
import api from '../../services/api';

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/customer/services');
        if (res.data.success) {
          setServices(res.data.services);
        }
      } catch (err) {
        console.warn('Failed to fetch services:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['All', 'Mechanic', 'Electrician', 'Homemaker', 'Doctor', 'Caretaker', 'Tutor', 'Plumber', 'Painter'];

  const filtered = services.filter((s) => {
    const matchCat = category === 'All' || s.category === category;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          On-Demand Services Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Browse verified categories and transparent pricing across Delhi, Noida, Gurugram, and NCR.
        </p>

        {/* Search Input */}
        <div className="relative max-w-md mx-auto pt-2">
          <input
            type="text"
            placeholder="Search any service or problem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
          <Search size={16} className="absolute left-3.5 top-5 text-slate-400" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              category === c
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading verified services...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400">No services found matching your criteria.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800">
                    {s.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">{s.name}</h3>
                    <span className="text-sm font-extrabold text-brand-600">₹{s.basePrice}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>

                  {/* Sub services checklist */}
                  {s.subServices && s.subServices.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block">Includes:</span>
                      {s.subServices.slice(0, 3).map((sub, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                            <Check size={12} className="text-emerald-500 shrink-0" />
                            {sub.name}
                          </span>
                          <span className="font-semibold text-slate-800">₹{sub.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/customer/dashboard?serviceId=${s._id}`}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  Book This Service <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
