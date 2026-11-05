import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/AuthModal';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LegalCases from './pages/LegalCases';
import MyDocuments from './pages/MyDocuments';
import PersonalAgents from './pages/PersonalAgents';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* 1️⃣ Landing / Hero Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Role-Based Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* 2️⃣ Legal Cases (6 Categories + Detail Modals) */}
              <Route path="/cases" element={<LegalCases />} />

              {/* 3️⃣ My Documents (Vault) */}
              <Route
                path="/documents"
                element={
                  <ProtectedRoute>
                    <MyDocuments />
                  </ProtectedRoute>
                }
              />

              {/* 4️⃣ Personal Agents (Lawyer Directory) */}
              <Route path="/agents" element={<PersonalAgents />} />

              {/* 5️⃣ Chat Section (Real-Time Messaging) */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />

              {/* 6️⃣ Settings (About, Contact, Privacy, Help) */}
              <Route path="/settings" element={<Settings />} />

              {/* Fallback */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>

          <Footer />
          <AuthModal />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
