import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { AgentDashboard } from './pages/agent/AgentDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const MainLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  // If returning from Google OAuth (?token= or ?error= in URL), mount AuthPage so it can process the callback
  const hasOAuthCallback = (() => {
    const p = new URLSearchParams(window.location.search);
    return p.has('token') || p.has('error');
  })();
  const [currentView, setCurrentView] = useState<'home' | 'auth' | 'dashboard'>(
    hasOAuthCallback ? 'auth' : 'home'
  );

  // Auto-redirect authenticated users to dashboard (from both auth and home views)
  useEffect(() => {
    if (isAuthenticated && user && (currentView === 'auth' || currentView === 'home')) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, user, currentView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Initializing SwiftRoute Logistics Platform...</p>
        </div>
      </div>
    );
  }

  // Choose the appropriate dashboard component by role
  const renderDashboard = () => {
    if (!isAuthenticated || !user) {
      return (
        <AuthPage
          onAuthSuccess={() => setCurrentView('dashboard')}
          onBackToHome={() => setCurrentView('home')}
        />
      );
    }

    if (user.role === 'admin') {
      return <AdminDashboard />;
    }
    if (user.role === 'agent') {
      return <AgentDashboard />;
    }
    return <CustomerDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      <Navbar
        onNavigateHome={() => setCurrentView('home')}
        onNavigateDashboard={() => setCurrentView('dashboard')}
        onNavigateAuth={() => setCurrentView('auth')}
        currentView={currentView}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage
            onNavigateToAuth={() => setCurrentView('auth')}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'auth' && !isAuthenticated && (
          <AuthPage
            onAuthSuccess={() => setCurrentView('dashboard')}
            onBackToHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'dashboard' && renderDashboard()}
      </main>

      {currentView === 'home' && (
        <footer className="bg-slate-900 dark:bg-[#050810] border-t border-slate-800 text-slate-400 text-xs py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">SwiftRoute</span>
              <span>• Enterprise Courier & Parcel Management Logistics</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>256-Bit Encrypted Data Access</span>
              <span>•</span>
              <span>Real-time GPS Telemetry</span>
              <span>•</span>
              <span>ISO 9001 Compliant</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
