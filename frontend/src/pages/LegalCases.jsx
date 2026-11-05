import React, { useState, useEffect } from 'react';
import { caseApi, agentApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Scale, 
  Users, 
  ShieldAlert, 
  Building, 
  Briefcase, 
  FileText, 
  HeartPulse, 
  Plus, 
  CheckCircle2, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export const LegalCases = () => {
  const { isAuthenticated, openAuth } = useAuth();

  const [categories, setCategories] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // File Case Modal
  const [fileCaseModalOpen, setFileCaseModalOpen] = useState(false);
  const [caseFormData, setCaseFormData] = useState({
    category_slug: 'family-law',
    title: '',
    description: '',
    priority: 'Medium',
    lawyer_id: ''
  });
  const [filingLoading, setFilingLoading] = useState(false);
  const [filingSuccess, setFilingSuccess] = useState(false);
  const [filingError, setFilingError] = useState('');

  // Fetch categories and lawyers
  useEffect(() => {
    const load = async () => {
      try {
        const catRes = await caseApi.getCategories();
        if (catRes?.categories) setCategories(catRes.categories);

        const lawyerRes = await agentApi.listLawyers();
        if (lawyerRes?.lawyers) setLawyers(lawyerRes.lawyers);
      } catch (err) {
        console.warn('Error fetching categories:', err.message);
      }
    };
    load();
  }, []);

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'family-law': return Users;
      case 'criminal-law': return ShieldAlert;
      case 'real-estate-law': return Building;
      case 'employment-law': return Briefcase;
      case 'business-law': return FileText;
      case 'personal-injury-law': return HeartPulse;
      default: return Scale;
    }
  };

  const handleOpenDetail = (cat) => {
    setSelectedCategory(cat);
    setDetailModalOpen(true);
  };

  const handleStartFiling = (catSlug) => {
    if (!isAuthenticated) {
      openAuth('login');
      return;
    }
    setCaseFormData({
      ...caseFormData,
      category_slug: catSlug || 'family-law',
      title: '',
      description: '',
      lawyer_id: ''
    });
    setDetailModalOpen(false);
    setFilingSuccess(false);
    setFilingError('');
    setFileCaseModalOpen(true);
  };

  const handleCaseSubmit = async (e) => {
    e.preventDefault();
    setFilingLoading(true);
    setFilingError('');
    try {
      await caseApi.createCase(caseFormData);
      setFilingSuccess(true);
      setTimeout(() => {
        setFileCaseModalOpen(false);
        setFilingSuccess(false);
      }, 1500);
    } catch (err) {
      setFilingError(err.message || 'Failed to file case.');
    } finally {
      setFilingLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Scale className="w-3.5 h-3.5" /> Practice Domains
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Legal Cases & Practice Areas</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Select an area of law below to inspect legal scopes, evaluate common causes of action, or retain specialized legal counsel.
          </p>
        </div>

        <button
          onClick={() => handleStartFiling('family-law')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4" /> File a Legal Case
        </button>
      </div>

      {/* 6 Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.slug);
          return (
            <div
              key={cat.id || cat.slug}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Jurisdiction Standard
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {cat.short_desc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">Common Proceedings:</div>
                  <div className="text-xs text-slate-700 line-clamp-2">
                    {cat.key_services}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(cat)}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                >
                  View Details &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => handleStartFiling(cat.slug)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition"
                >
                  Open Case
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={selectedCategory?.title || 'Practice Area Details'}
        maxWidth="max-w-2xl"
      >
        {selectedCategory && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">Scope & Overview</h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedCategory.full_desc}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Key Legal Services & Representation</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                {selectedCategory.key_services?.split(',').map((serv, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{serv.trim()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleStartFiling(selectedCategory.slug)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
              >
                File Case in {selectedCategory.title}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Case Filing Modal */}
      <Modal
        isOpen={fileCaseModalOpen}
        onClose={() => setFileCaseModalOpen(false)}
        title="File a New Legal Case"
        maxWidth="max-w-lg"
      >
        {filingSuccess ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Legal Case Initialized!</h3>
            <p className="text-xs text-slate-500 mt-1">Your case intake record has been established and scheduled for evaluation.</p>
          </div>
        ) : (
          <form onSubmit={handleCaseSubmit} className="space-y-4">
            {filingError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{filingError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Law Category</label>
              <select
                value={caseFormData.category_slug}
                onChange={(e) => setCaseFormData({ ...caseFormData, category_slug: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Case Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Commercial Lease Contract Dispute"
                value={caseFormData.title}
                onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Case Narrative</label>
              <textarea
                required
                rows={4}
                placeholder="Describe key timelines, involved entities, and legal relief sought (minimum 15 characters)..."
                value={caseFormData.description}
                onChange={(e) => setCaseFormData({ ...caseFormData, description: e.target.value })}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Case Urgency</label>
                <select
                  value={caseFormData.priority}
                  onChange={(e) => setCaseFormData({ ...caseFormData, priority: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Low">Low - Standard Advice</option>
                  <option value="Medium">Medium - Pending Matter</option>
                  <option value="High">High - Impending Deadline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign Attorney (Optional)</label>
                <select
                  value={caseFormData.lawyer_id}
                  onChange={(e) => setCaseFormData({ ...caseFormData, lawyer_id: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Auto-Assign Best Specialist</option>
                  {lawyers.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.area_of_expertise})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFileCaseModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={filingLoading}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {filingLoading ? 'Submitting File...' : 'Submit Legal Filing'}
              </button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default LegalCases;
