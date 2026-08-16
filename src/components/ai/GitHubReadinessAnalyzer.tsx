import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Github,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Code2,
  GitBranch,
  FileCode,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { analyzeGitHubReadiness, GitHubReadinessResult } from '../../lib/aiCareerEngine';
import { exportGitHubReadinessPDF } from '../../lib/pdfExport';

export const GitHubReadinessAnalyzer: React.FC = () => {
  const { profile, projects, skills } = useStudentTwin();
  const [githubUrlInput, setGithubUrlInput] = useState(
    profile.githubUrl || 'https://github.com/vangala-sricharan'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<GitHubReadinessResult | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportGitHubReadinessPDF(profile, result, githubUrlInput.trim());
    } catch (err) {
      setErrorState('Could not export GitHub Readiness PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRunAudit = () => {
    setIsAuditing(true);
    setErrorState(null);

    setTimeout(() => {
      try {
        const audit = analyzeGitHubReadiness(githubUrlInput.trim(), projects, skills);
        setResult(audit);
        setIsAuditing(false);
      } catch (err) {
        setIsAuditing(false);
        setErrorState('GitHub audit failed. Please check repository link.');
      }
    }, 700);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI GitHub & Repository Readiness Analyzer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ENGINEERING REPUTATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit public GitHub profile, README quality, directory modularity, commit frequency, and documentation depth.
          </p>
        </div>

        {result && (
          <button
            id="export-github-readiness-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Github className="w-4 h-4" />
            <span>{isExporting ? 'Exporting PDF...' : 'Download GitHub Readiness PDF'}</span>
          </button>
        )}
      </div>

      {/* Explicit Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
        <span>
          <strong>Recruiter Audit Protocol:</strong> Evaluates public repository metadata and best-practice engineering criteria; no private repo access without explicit authorization.
        </span>
      </div>

      {/* Input Field */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            id="github-url-audit-input"
            type="text"
            value={githubUrlInput}
            onChange={(e) => setGithubUrlInput(e.target.value)}
            placeholder="https://github.com/username"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          id="run-github-audit-btn"
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isAuditing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auditing GitHub Profile...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Audit GitHub Profile</span>
            </>
          )}
        </button>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleRunAudit} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OVERALL AUDIT
              </span>
              <div className="my-1">
                <span className="text-3xl font-black text-blue-400">{result.overallScore}%</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">{result.profileStrength}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PROJECT QUALITY
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.projectQuality}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Stack & architecture</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                README DEPTH
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.readmeQuality}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Diagrams & demo GIF</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ORGANIZATION
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.repoOrganization}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Clean directory trees</span>
            </div>
          </div>

          {/* Checklist and Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Recruiter Screening Checklist
              </span>
              <div className="space-y-2">
                {result.checklist.map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300">{chk.item}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        chk.passed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {chk.passed ? '✓ Passed' : 'Action Needed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                High-Yield GitHub Polish Suggestions
              </span>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
