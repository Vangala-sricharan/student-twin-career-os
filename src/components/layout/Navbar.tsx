import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { PublicView } from '../../types';
import {
  Cpu,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  Play,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentView: PublicView;
  setCurrentView: (view: PublicView) => void;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onOpenDashboard }) => {
  const { user, signOut, isConfigured } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <button
          id="nav-brand-logo-btn"
          onClick={() => setCurrentView('landing')}
          className="flex items-center gap-3 text-left group transition-transform active:scale-98"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">
                Student Digital Twin
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                OS v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              AI-Powered Engineering Career Readiness OS
            </p>
          </div>
        </button>

        {/* Center navigation links (on landing view) */}
        {currentView === 'landing' && (
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Core OS
            </a>
            <a href="#architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Architecture
            </a>
            <a href="#benefits" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Pricing
            </a>
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            id="nav-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {user ? (
            /* Authenticated Quick Controls */
            <div className="flex items-center gap-2">
              <button
                id="nav-open-dashboard-btn"
                onClick={() => {
                  if (onOpenDashboard) onOpenDashboard();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Go to Dashboard</span>
              </button>
              <button
                id="nav-logout-btn"
                onClick={() => signOut()}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Public visitor action buttons */
            <div className="flex items-center gap-2">
              <button
                id="nav-try-demo-btn"
                onClick={() => setCurrentView('demo')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentView === 'demo'
                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-indigo-500" />
                <span>Try Demo</span>
              </button>

              <button
                id="nav-login-btn"
                onClick={() => setCurrentView('login')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  currentView === 'login'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>

              <button
                id="nav-signup-btn"
                onClick={() => setCurrentView('signup')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">Build Your Twin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
