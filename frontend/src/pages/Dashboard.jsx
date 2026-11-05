import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { caseApi, docApi, agentApi } from '../api/client';
import { 
  Briefcase, 
  FolderLock, 
  MessageSquare, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';

export const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [lawyerProfile, setLawyerProfile] = useState(user?.profile || null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [caseRes, docRes] = await Promise.all([
        caseApi.getCases(),
        docApi.listDocuments()
      ]);
      if (caseRes?.cases) setCases(caseRes.cases);
      if (docRes?.documents) setDocuments(docRes.documents);

      if (role === 'lawyer') {
        const agentRes = await agentApi.getLawyerById(user.id);
        if (agentRes?.lawyer) {
          setLawyerProfile(agentRes.lawyer);
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handle lawyer status update
  const handleUpdateStatus = async (caseId, newStatus) => {
    setStatusUpdating(caseId);
    try {
      await caseApi.updateCaseStatus(caseId, newStatus);
      setCases((prev) =>
        prev.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert(`Error updating case status: ${err.message}`);
    } finally {
      setStatusUpdating(null);
    }
  };

  // Handle lawyer availability toggle
  const handleToggleAvailability = async () => {
    if (!lawyerProfile) return;
    const newAvail = !lawyerProfile.is_available;
    try {
      await agentApi.updateProfile({ is_available: newAvail });
      setLawyerProfile({ ...lawyerProfile, is_available: newAvail });
    } catch (err) {
      alert(`Could not toggle availability: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading secure case records...</p>
      </div>
    );
  }

  // ==========================================================================
  // VIEW A: CLIENT DASHBOARD
  // ==========================================================================
  if (role === 'client') {
    const openCases = cases.filter((c) => c.status === 'Open').length;
    const inReviewCases = cases.filter((c) => c.status === 'In Review').length;
    const closedCases = cases.filter((c) => c.status === 'Closed').length;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-800/60 text-blue-200 text-xs font-semibold mb-2">
                <Shield className="w-3.5 h-3.5" /> Client Legal Hub
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-sm text-blue-200 mt-1 max-w-xl">
                Manage your active legal consultations, track attorney evaluations, and upload discovery documents with privilege protection.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/cases')}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-sm transition"
              >
                + File New Case
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-xs text-white transition"
              >
                Open Chat
              </button>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Cases</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{cases.length}</div>
            <div className="text-xs text-slate-400 mt-1">Across all legal categories</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Under Review</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-2">{inReviewCases}</div>
            <div className="text-xs text-slate-400 mt-1">Active attorney examination</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents Vault</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><FolderLock className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{documents.length}</div>
            <div className="text-xs text-slate-400 mt-1">Encrypted discovery files</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved Cases</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">{closedCases}</div>
            <div className="text-xs text-slate-400 mt-1">Concluded matters</div>
          </div>
        </div>

        {/* Case List Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Your Active Legal Cases</h2>
              <button
                onClick={() => navigate('/cases')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Browse Law Directory <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {cases.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No active cases registered</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Explore our six legal categories and open your initial consultation file.
                </p>
                <button
                  onClick={() => navigate('/cases')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  File Your First Case
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all bg-slate-50/50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            c.status === 'Open'
                              ? 'bg-blue-100 text-blue-800'
                              : c.status === 'In Review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {c.status}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 capitalize">
                            {c.category_slug?.replace('-', ' ')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{c.description}</p>
                      </div>
                      <button
                        onClick={() => navigate('/chat')}
                        className="shrink-0 p-2 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                        title="Open consultation chat"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Vault Teaser */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Quick Legal Actions</h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate('/cases')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">File Legal Case</div>
                      <div className="text-[11px] text-slate-500">Pick from 6 practice domains</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => navigate('/documents')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <FolderLock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Upload Evidence Vault</div>
                      <div className="text-[11px] text-slate-500">PDF, JPG, PNG up to 5MB</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => navigate('/agents')}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Specialist Agents</div>
                      <div className="text-[11px] text-slate-500">Retain certified attorneys</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Document Vault Summary */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FolderLock className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">Vault Health</h3>
              </div>
              <div className="text-sm font-semibold">{documents.length} Encrypted Documents Saved</div>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                All uploaded documents pass through strict MIME-type sanitization and BOLA authorization guards.
              </p>
              <button
                onClick={() => navigate('/documents')}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition"
              >
                Manage My Documents
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // VIEW B: LAWYER / SPECIALIST DASHBOARD
  // ==========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      
      {/* Lawyer Header Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-800 shrink-0 border-2 border-blue-400/40">
              <img
                src={lawyerProfile?.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-blue-700/60 text-blue-200 mb-1">
                <UserCheck className="w-3.5 h-3.5" /> Admitted Attorney
              </div>
              <h1 className="text-2xl font-extrabold">{user?.name}</h1>
              <p className="text-xs text-blue-300">
                Specialty: <strong className="text-white">{lawyerProfile?.area_of_expertise || 'Corporate & Business Law'}</strong> • {lawyerProfile?.experience_years || 15} Years Standing
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div>
              <div className="text-xs font-semibold text-slate-200">Consultation Status</div>
              <div className={`text-[11px] font-bold ${lawyerProfile?.is_available ? 'text-emerald-400' : 'text-slate-400'}`}>
                {lawyerProfile?.is_available ? '● Available for Intake' : '○ Busy / Unavailable'}
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                lawyerProfile?.is_available
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/50'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Toggle
            </button>
          </div>
        </div>
      </div>

      {/* Lawyer Intake Queue & Case Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Intake & Client Cases</h2>
            <p className="text-xs text-slate-500">Update case review statuses or launch client consultation channels directly.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
            {cases.length} Managed Cases
          </span>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">Your review queue is clear</h3>
            <p className="text-xs text-slate-500 mt-1">Incoming client filings will appear here for statutory examination.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Case Title</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Practice Area</th>
                  <th className="py-3 px-4">Status & Status Control</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{c.title}</div>
                      <div className="text-[11px] font-normal text-slate-500 line-clamp-1">{c.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{c.client_name || 'Client'}</td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">{c.category_slug?.replace('-', ' ')}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={c.status}
                        disabled={statusUpdating === c.id}
                        onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg border px-2 py-1 focus:outline-none ${
                          c.status === 'Open'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : c.status === 'In Review'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Review">In Review</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate('/chat')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Chat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Shared Client Evidence Vault */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Shared Client Discovery Vault</h3>
            <p className="text-xs text-slate-500">Access documents uploaded by clients for evidentiary review.</p>
          </div>
          <button
            onClick={() => navigate('/documents')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Open Document Explorer &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.slice(0, 3).map((d) => (
            <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-6 h-6 text-blue-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-800 truncate">{d.original_name}</div>
                  <div className="text-[10px] text-slate-500">{(d.file_size / 1024).toFixed(1)} KB • {d.mime_type}</div>
                </div>
              </div>
              <button
                onClick={() => navigate('/documents')}
                className="text-xs text-blue-600 font-semibold px-2 py-1 rounded hover:bg-blue-100"
              >
                Inspect
              </button>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="col-span-3 text-center py-6 text-xs text-slate-500">
              No shared documents currently in review queue.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
