import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, openAuth } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Verifying security credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
          <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            This module contains privileged legal information protected under confidentiality protocols. Please sign in or create an account to proceed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => openAuth('login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition"
            >
              <LogIn className="w-4 h-4" /> Sign In to Continue
            </button>
            <button
              onClick={() => openAuth('register')}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Register New Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 p-8 text-center shadow-lg">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-4">
            Your current account role (<strong className="capitalize">{user.role}</strong>) does not have clearance for this view.
          </p>
          <p className="text-xs text-slate-400">
            Clearance required: {allowedRoles.join(' or ')}.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
