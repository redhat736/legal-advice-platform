import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ShieldCheck, Lock, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & mission */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Scale className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Legal Advice</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md mb-4">
              Providing verified, institutional-grade legal counsel, end-to-end encrypted document management, and real-time consultation across 6 core practice categories.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-blue-400" /> State Bar Compliant
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-blue-400" /> 256-bit Document Vault
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-400" /> Verified Specialists
              </div>
            </div>
          </div>

          {/* Practice Areas */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Practice Areas
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/cases" className="hover:text-blue-400 transition">Corporate & Business Law</Link></li>
              <li><Link to="/cases" className="hover:text-blue-400 transition">Criminal Defense</Link></li>
              <li><Link to="/cases" className="hover:text-blue-400 transition">Family & Matrimonial Law</Link></li>
              <li><Link to="/cases" className="hover:text-blue-400 transition">Employment & Labor</Link></li>
              <li><Link to="/cases" className="hover:text-blue-400 transition">Real Estate Transactions</Link></li>
              <li><Link to="/cases" className="hover:text-blue-400 transition">Personal Injury Litigation</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Governance & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/settings" className="hover:text-blue-400 transition">About Our Firm</Link></li>
              <li><Link to="/settings" className="hover:text-blue-400 transition">Attorney Directory</Link></li>
              <li><Link to="/settings" className="hover:text-blue-400 transition">Privacy & Data Security</Link></li>
              <li><Link to="/settings" className="hover:text-blue-400 transition">Client Support Hotline</Link></li>
              <li><Link to="/settings" className="hover:text-blue-400 transition">Terms of Representation</Link></li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Bar Notice */}
        <div className="pt-8 border-t border-slate-800 text-[11px] text-slate-500 space-y-2 leading-relaxed">
          <p>
            <strong>Disclaimer:</strong> Communication of information through this website does not constitute an attorney-client relationship until a formal retainer agreement is executed. Information presented is for informational purposes and should not be construed as specific legal counsel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2">
            <div>&copy; {new Date().getFullYear()} Legal Advice Platform Inc. All rights reserved.</div>
            <div className="mt-2 sm:mt-0 text-slate-400">Enterprise Full-Stack Architecture • React & Node.js SQL</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
