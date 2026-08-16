import React from 'react';
import { Cpu, ShieldCheck, Database, GitBranch, ArrowUpRight } from 'lucide-react';
import { PublicView } from '../../types';

interface FooterProps {
  setCurrentView?: (view: PublicView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">
                Student Digital Twin
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              AI-Powered Engineering Career Readiness OS. Designed to model, quantify, and accelerate engineering students' industry readiness through persistent skill tracking, repository benchmarking, and career roadmap simulations.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <Database className="w-3.5 h-3.5 text-emerald-500" /> Supabase Ready
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <GitBranch className="w-3.5 h-3.5 text-blue-500" /> Serverless Architecture
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> User-Isolated State
              </span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Core Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentView && setCurrentView('signup')}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  Digital Twin Modeler
                </button>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Readiness Score Engine
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Skill Taxonomy
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Engineering Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & Pricing */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Pricing in INR
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-slate-700 dark:text-slate-300 font-medium">
                Student Starter: <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹0</span>
              </li>
              <li className="text-slate-700 dark:text-slate-300 font-medium">
                Career Pro Twin: <span className="font-semibold text-blue-600 dark:text-blue-400">₹499/mo</span>
              </li>
              <li className="text-slate-700 dark:text-slate-300 font-medium">
                Campus Enterprise: <span className="font-semibold text-indigo-600 dark:text-indigo-400">₹14,999/yr</span>
              </li>
              <li className="pt-2">
                <button
                  id="footer-try-demo-btn"
                  onClick={() => setCurrentView && setCurrentView('demo')}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Try Demo <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Student Digital Twin. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Engineering Career Readiness OS</span>
            <span>•</span>
            <span>Vercel / Supabase Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
