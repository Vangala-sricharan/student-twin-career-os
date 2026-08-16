import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Settings,
  Sun,
  Moon,
  Database,
  ShieldCheck,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  User,
  X,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, signOut, isConfigured, resetPassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const { clearAllUserData } = useStudentTwin();

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [pwdResetStatus, setPwdResetStatus] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) {
      setPwdResetStatus('Demo Mode: Password reset is disabled for isolated sandbox accounts.');
      return;
    }
    setPwdLoading(true);
    setPwdResetStatus(null);
    try {
      const { error } = await resetPassword(user.email);
      if (error) {
        setPwdResetStatus('Failed to send reset link: ' + error.message);
      } else {
        setPwdResetStatus('Password reset link sent to ' + user.email);
      }
    } catch {
      setPwdResetStatus('An unexpected error occurred.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleConfirmResetData = async () => {
    await clearAllUserData();
    setResetSuccess(true);
    setResetModalOpen(false);
    setTimeout(() => setResetSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage system preferences, authentication backend, theme mode, and data reset.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Your Digital Twin data has been cleared and reset to a clean baseline state.</span>
        </div>
      )}

      {/* 1. Account Identity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          1. Authenticated User Identity
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Supabase User ID:</span>
            <span className="font-mono text-slate-900 dark:text-white font-semibold break-all">
              {user?.id || 'demo_vangala_sricharan (Demo)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Registered Email:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.email || 'vangalasricharan7@gmail.com (Demo Profile)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-1">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Auth Provider:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user
                ? isConfigured
                  ? 'Supabase Cloud Auth'
                  : 'Client-First Auth Engine (Supabase-Ready)'
                : 'Isolated Demo Sandbox (No Supabase Sync)'}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            id="settings-send-password-reset-btn"
            onClick={handlePasswordReset}
            disabled={pwdLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Send Password Reset Email</span>
          </button>

          {pwdResetStatus && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              {pwdResetStatus}
            </span>
          )}
        </div>
      </div>

      {/* 2. Theme Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
          2. Theme & Visual Mode
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Switch between Light and Dark themes. Your choice is automatically persisted locally.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            id="settings-theme-light-card"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white text-blue-600 shadow-sm border border-slate-200">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Light Theme</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Crisp white & light blue surfaces</p>
              </div>
            </div>
            {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </div>

          <div
            id="settings-theme-dark-card"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              theme === 'dark'
                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950 text-amber-300 shadow-sm border border-slate-800">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Dark Theme</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Deep navy & sleek cyber accents</p>
              </div>
            </div>
            {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
          </div>
        </div>
      </div>

      {/* 3. Supabase Integration Monitor */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>3. Supabase Backend Status</span>
        </h2>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Supabase Configuration Status
            </span>
            <span
              className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                isConfigured
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
              }`}
            >
              {isConfigured ? 'Connected to Live Supabase' : 'Supabase-Ready (Local Fallback)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The application is wired with <code>@supabase/supabase-js</code>. To connect to your dedicated Supabase project, supply <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your environment settings.
          </p>
        </div>
      </div>

      {/* 4. Session & Danger Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/60 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>4. Session & Reset Controls</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Sign Out Session</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Terminate the active Supabase session and return to the public landing page.
            </p>
          </div>
          <button
            id="settings-logout-btn"
            onClick={() => signOut()}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-red-600 dark:text-red-400">
              Clear My Digital Twin Data
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently delete all skills, projects, achievements, and goals associated with your user ID.
            </p>
          </div>
          <button
            id="settings-reset-data-btn"
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-300 dark:border-red-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset My Twin</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-red-200 dark:border-red-900 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Reset Digital Twin Data?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to reset your Digital Twin? All skills, projects, and achievements saved for your user ID will be cleared.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                id="modal-confirm-reset-btn"
                type="button"
                onClick={handleConfirmResetData}
                className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm cursor-pointer"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
