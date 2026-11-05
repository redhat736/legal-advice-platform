import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { agentApi } from '../api/client';
import { 
  Settings as SettingsIcon, 
  User, 
  Info, 
  Phone, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  Save, 
  Mail, 
  MapPin, 
  Clock 
} from 'lucide-react';

export const Settings = () => {
  const { user, role, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Lawyer profile edit state
  const [profileForm, setProfileForm] = useState({
    area_of_expertise: user?.profile?.area_of_expertise || 'Business Law',
    experience_years: user?.profile?.experience_years || 10,
    hourly_rate: user?.profile?.hourly_rate || 250,
    bio: user?.profile?.bio || '',
    achievements: user?.profile?.achievements || ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
    try {
      await agentApi.updateProfile(profileForm);
      setUpdateSuccess(true);
      await refreshUser();
      setTimeout(() => setUpdateSuccess(false), 2500);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const navItems = [
    { id: 'profile', label: 'Profile & Security', icon: User },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'contact', label: 'Contact Us', icon: Phone },
    { id: 'privacy', label: 'Privacy & Privilege', icon: ShieldCheck },
    { id: 'help', label: 'Help & FAQ', icon: HelpCircle },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Settings & Governance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure security credentials, inspect firm policies, and access client intake support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Navigation Sidebar */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          
          {/* 1. PROFILE & SECURITY TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Account Credentials & Profile</h3>
                <p className="text-xs text-slate-500 mt-0.5">Verified user registration records.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Full Name</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{user?.name}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Email Address</span>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">{user?.email}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Account Role</span>
                  <div className="font-bold text-blue-700 capitalize mt-0.5">{role} Account</div>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px]">Security Standard</span>
                  <div className="font-semibold text-emerald-700 mt-0.5">HttpOnly + Bcrypt-12 Salted</div>
                </div>
              </div>

              {/* If Lawyer, allow editing professional listing */}
              {role === 'lawyer' && (
                <form onSubmit={handleProfileUpdate} className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Update Public Attorney Dossier</h4>

                  {updateSuccess && (
                    <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Attorney profile updated successfully!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Practice Area</label>
                      <input
                        type="text"
                        value={profileForm.area_of_expertise}
                        onChange={(e) => setProfileForm({ ...profileForm, area_of_expertise: e.target.value })}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        value={profileForm.experience_years}
                        onChange={(e) => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Hourly Rate ($)</label>
                      <input
                        type="number"
                        value={profileForm.hourly_rate}
                        onChange={(e) => setProfileForm({ ...profileForm, hourly_rate: e.target.value })}
                        className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Achievements & Honors</label>
                    <input
                      type="text"
                      value={profileForm.achievements}
                      onChange={(e) => setProfileForm({ ...profileForm, achievements: e.target.value })}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Professional Bio</label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition"
                  >
                    <Save className="w-4 h-4" />
                    {updating ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. ABOUT US TAB */}
          {activeTab === 'about' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h3 className="text-base font-bold text-slate-900">About Legal Advice Platform</h3>
              <p>
                Founded by former bar association directors and enterprise technologists, <strong>Legal Advice</strong> bridges client needs with certified legal practitioners. We believe access to high-caliber legal counsel should be secure, transparent, and direct.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm mb-1">100% Vetted</div>
                  <p className="text-xs text-slate-500">Every attorney on our roster possesses clean state bar standing and proven trial records.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm mb-1">Zero-Trust Vault</div>
                  <p className="text-xs text-slate-500">Privileged discovery materials are isolated with military-grade role-based access control.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm mb-1">Transparent Rates</div>
                  <p className="text-xs text-slate-500">Clear hourly and retainer expectations without hidden statutory fees.</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. CONTACT US TAB */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Direct Intake & Support Channels</h3>
                <p className="text-xs text-slate-500 mt-0.5">Reach our central legal administration team.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">Emergency Legal Intake Hotline</div>
                    <div className="text-slate-500 mt-1">+1 (800) 555-LEGAL (5342)</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Available 24/7 for urgent arraignments</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">Privileged Communications Desk</div>
                    <div className="text-slate-500 mt-1">counsel@legaladvice.com</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">PGP Key available upon request</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">Principal Office & Chambers</div>
                    <div className="text-slate-500 mt-1">450 Lexington Avenue, Suite 2800</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">New York, NY 10017</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-800">Operating Hours</div>
                    <div className="text-slate-500 mt-1">Mon - Fri: 8:00 AM - 7:00 PM EST</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Weekend on-call defense counsel active</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <h3 className="text-base font-bold text-slate-900">Confidentiality & Attorney-Client Privilege</h3>
              <p>
                All electronic communications, case filings, and discovery records deposited inside the Legal Advice infrastructure are treated under strict legal confidentiality standards as defined by the American Bar Association (ABA) Model Rules of Professional Conduct (Rule 1.6).
              </p>
              <h4 className="font-bold text-slate-800 mt-3">Cryptographic Safeguards</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-500">
                <li>Transport Layer Security (TLS 1.3) encrypting all client-server exchanges.</li>
                <li>Database storage with parameterized SQL queries preventing data injection vectors.</li>
                <li>Granular Broken Object Level Authorization (BOLA) preventing unauthorized cross-tenant inspection.</li>
                <li>Zero sale, monetization, or third-party sharing of uploaded briefs or chats.</li>
              </ul>
            </div>
          )}

          {/* 5. HELP & FAQ TAB */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">How does retaining a lawyer through the portal work?</h4>
                  <p className="text-xs text-slate-600">
                    Browse the Personal Agents section, examine attorney achievements, and click "Chat Now". You can open an active case file in one of our 6 practice areas and transmit case discovery documents.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">What document file formats are supported?</h4>
                  <p className="text-xs text-slate-600">
                    You can upload PDF contracts, scanned court summons, and JPG/PNG evidence photos. Each file is restricted to 5MB for storage security.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">How do lawyers manage incoming cases?</h4>
                  <p className="text-xs text-slate-600">
                    Lawyer accounts are equipped with a specialized Lawyer Dashboard where attorneys can review filed cases, inspect client documents, update status between Open, In Review, and Closed, and converse directly in Chat.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Settings;
