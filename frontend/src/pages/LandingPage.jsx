import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Users, 
  Briefcase, 
  FileCheck, 
  Award, 
  MessageSquare, 
  CheckCircle,
  FolderLock
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, openAuth } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      openAuth('register');
    }
  };

  const categories = [
    { name: 'Business Law', desc: 'Corporate structuring, contracts, M&A, and dispute resolution.', slug: 'business-law' },
    { name: 'Criminal Defense', desc: 'Aggressive constitutional defense for felonies, misdemeanors & appeals.', slug: 'criminal-law' },
    { name: 'Family Law', desc: 'Divorce, custody disputes, prenuptials, and matrimonial mediation.', slug: 'family-law' },
    { name: 'Employment Law', desc: 'Wrongful termination, discrimination, wage disputes, and severance.', slug: 'employment-law' },
    { name: 'Real Estate Law', desc: 'Commercial escrows, residential closings, zoning, and title disputes.', slug: 'real-estate-law' },
    { name: 'Personal Injury', desc: 'Accident injury recovery, medical malpractice, and insurer litigation.', slug: 'personal-injury-law' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-15"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          
          {/* Prominent Logo & Brand Header */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-blue-300 text-xs font-semibold tracking-wide uppercase mb-8 shadow-inner">
            <Scale className="h-4 w-4 text-blue-400" />
            Institutional Legal Advocacy & Advisory
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Guarding Your Legal Rights With <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">Absolute Precision</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-normal">
            Connect with board-certified specialist attorneys across six foundational practice disciplines. Manage encrypted case discovery documents and consult in real time within a hardened, compliant environment.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all text-sm group"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/cases')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-sm"
            >
              Browse 6 Practice Areas
            </button>
          </div>

          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-12 border-t border-white/10 text-left">
            <div className="p-3">
              <div className="text-2xl font-extrabold text-blue-400">98.4%</div>
              <div className="text-xs text-slate-400 mt-1">Resolution Success Rate</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-extrabold text-white">500+</div>
              <div className="text-xs text-slate-400 mt-1">Verified Legal Counsel</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-extrabold text-blue-400">256-bit</div>
              <div className="text-xs text-slate-400 mt-1">Encrypted Evidence Vault</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-extrabold text-white">24 / 7</div>
              <div className="text-xs text-slate-400 mt-1">Direct Case Consultation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Practice Pillars Overview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Practice Excellence</h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Six Core Areas of Legal Representation</p>
          <p className="text-sm text-slate-500 mt-3">From high-stakes enterprise transactions to sensitive family disputes, our attorneys bring deep courtroom and arbitration experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c, idx) => (
            <div
              key={idx}
              onClick={() => navigate('/cases')}
              className="cursor-pointer group rounded-2xl bg-white p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-200"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                0{idx + 1}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                {c.name}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {c.desc}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                Explore Category <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Walkthrough Grid */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Platform Capabilities</h2>
            <p className="text-2xl font-bold text-slate-900">An Integrated Operating System For Legal Needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <FolderLock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Encrypted Document Vault</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Store contracts, summons, titles, and medical records in a 5MB-capped vault strictly guarded against Broken Object Level Authorization (BOLA).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Personal Specialist Agents</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review verified attorney dossiers detailing bar admission, win records, courtroom milestones, and availability before retaining.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">Live Counsel Chat</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct encrypted chat sessions with your assigned counsel. Maintain an auditable timestamped record of discussions and case milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="rounded-3xl bg-blue-900 p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
              Need Prompt Legal Direction Today?
            </h3>
            <p className="text-sm text-blue-200 max-w-xl mx-auto mb-8 leading-relaxed">
              Open an active case file, consult a dedicated attorney, or upload your contractual documents for compliance review.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-900 font-bold hover:bg-blue-50 shadow-lg text-sm transition"
            >
              Enter Dashboard Now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
