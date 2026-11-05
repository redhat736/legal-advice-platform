import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Search, 
  Star, 
  MessageSquare, 
  Award, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export const PersonalAgents = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuth } = useAuth();

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Criminal Law',
    'Business Law',
    'Family Law',
    'Personal Injury Law',
    'Employment Law',
    'Real Estate Law'
  ];

  const fetchLawyers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await agentApi.listLawyers(params);
      if (res?.lawyers) {
        setLawyers(res.lawyers);
      }
    } catch (err) {
      console.warn('Error fetching lawyers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLawyers();
  };

  const handleChatNow = (lawyer) => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    // Navigate to Chat page passing target lawyer state
    navigate('/chat', { state: { selectedLawyerId: lawyer.id, lawyerName: lawyer.name } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Admitted Counsel Roster
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Specialist Legal Agents</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Retain verified specialist attorneys with established courtroom records, peer review honors, and clear transparent rates.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search attorney or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
          />
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Fetching specialist directory...
        </div>
      ) : lawyers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No attorneys match criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Agent Header / Photo */}
                <div className="p-6 pb-4 flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={lawyer.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
                      alt={lawyer.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white ${lawyer.is_available ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{lawyer.rating || '4.95'}</span>
                      <span className="text-slate-400 font-normal">({lawyer.experience_years || 12} yrs exp)</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                      {lawyer.name}
                    </h3>
                    <div className="text-xs font-semibold text-blue-600 mt-0.5">
                      {lawyer.area_of_expertise}
                    </div>
                  </div>
                </div>

                {/* Achievements & Bio */}
                <div className="px-6 py-2 space-y-2">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {lawyer.bio}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2">
                    <Award className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] font-medium text-slate-700 line-clamp-2">
                      {lawyer.achievements}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">Consultation Rate</div>
                  <div className="text-sm font-extrabold text-slate-900">${lawyer.hourly_rate || 250}/hr</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleChatNow(lawyer)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm hover:shadow transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PersonalAgents;
