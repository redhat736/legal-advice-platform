import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Scale, 
  LayoutDashboard, 
  Briefcase, 
  FolderLock, 
  Users, 
  MessageSquare, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  UserCheck 
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout, openAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Home', path: '/', icon: Scale },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Legal Cases', path: '/cases', icon: Briefcase },
    { label: 'My Documents', path: '/documents', icon: FolderLock },
    { label: 'Personal Agents', path: '/agents', icon: Users },
    { label: 'Chat', path: '/chat', icon: MessageSquare },
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-xs group-hover:scale-105 transition-transform">
              <Scale className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-700 transition">
                Legal Advice
              </div>
              <div className="text-[10px] font-medium tracking-wider uppercase text-blue-600">
                Enterprise Advocacy
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                    <UserCheck className="w-2.5 h-2.5" />
                    {role === 'lawyer' ? 'Attorney' : 'Client'}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow transition"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-1 animate-fade-in shadow-xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-2">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
                  <div className="text-xs text-blue-600 font-medium capitalize">{role} Account</div>
                </div>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 p-2 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2 pt-2">
                <button
                  onClick={() => { openAuth('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-center text-xs font-semibold border border-slate-300 rounded-lg text-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { openAuth('register'); setMobileMenuOpen(false); }}
                  className="w-full py-2 text-center text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
