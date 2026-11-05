import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import { Lock, Mail, User, Briefcase, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, closeAuth, authMode, setAuthMode, login, register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    area_of_expertise: 'Business Law',
    experience_years: 6,
    bio: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test login helpers
  const handleDemoLogin = async (type) => {
    setLoading(true);
    setError('');
    try {
      if (type === 'client') {
        await login('client@example.com', 'LegalPass123!');
      } else if (type === 'lawyer') {
        await login('marcus.vance@legaladvice.com', 'LegalPass123!');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuth}
      title={authMode === 'login' ? 'Sign In to Legal Advice' : 'Create an Account'}
      maxWidth="max-w-md"
    >
      {/* Role / Mode Switcher */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
        <button
          type="button"
          onClick={() => { setAuthMode('login'); setError(''); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
            authMode === 'login'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('register'); setError(''); }}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
            authMode === 'register'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Register New Account
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Demo Quick Logins */}
      <div className="mb-5 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
        <div className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider mb-2 text-center">
          ⚡ One-Click Demo Access
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('client')}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 transition shadow-xs"
          >
            <User className="w-3.5 h-3.5" /> Client Demo
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('lawyer')}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 transition shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5" /> Lawyer Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === 'register' && (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Eleanor Vance"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'client' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition ${
                    formData.role === 'client'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Client (Need Advice)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'lawyer' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition ${
                    formData.role === 'lawyer'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Attorney / Specialist
                </button>
              </div>
            </div>

            {formData.role === 'lawyer' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Primary Area of Practice</label>
                <select
                  name="area_of_expertise"
                  value={formData.area_of_expertise}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Family Law">Family Law</option>
                  <option value="Criminal Law">Criminal Law</option>
                  <option value="Real Estate Law">Real Estate Law</option>
                  <option value="Employment Law">Employment Law</option>
                  <option value="Business Law">Business Law</option>
                  <option value="Personal Injury Law">Personal Injury Law</option>
                </select>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="email"
              name="email"
              required
              placeholder="you@domain.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="password"
              name="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>
          {authMode === 'register' && (
            <p className="text-[11px] text-slate-500 mt-1">Minimum 8 characters with high entropy.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-150 text-sm disabled:opacity-50"
        >
          {loading
            ? 'Processing...'
            : authMode === 'login'
            ? 'Access Secure Account'
            : 'Create Verified Account'}
        </button>
      </form>
    </Modal>
  );
};

export default AuthModal;
