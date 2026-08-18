import React, { useState, useEffect } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { useAuth } from '../../context/AuthContext';
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
  FolderGit2,
  Calendar,
  Layers,
  Star,
  Check,
  TrendingUp,
  Download,
} from 'lucide-react';
import {
  validateGithubUrl,
  fetchRealGithubProfileData,
  calculateGithubReadiness,
} from '../../lib/githubService';
import { GitHubReadinessAnalysis } from '../../types';
import { exportGitHubReadinessPDF } from '../../lib/pdfExport';
import { cloudStore } from '../../lib/cloudStore';

export const GitHubReadinessAnalyzer: React.FC = () => {
  const { profile } = useStudentTwin();
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [githubUrlInput, setGithubUrlInput] = useState(
    profile.githubUrl || 'https://github.com/torvalds'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string>('Analyzing GitHub profile...');
  const [result, setResult] = useState<GitHubReadinessAnalysis | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);

  // Load latest persistent analysis from Supabase / cloudStore on mount
  useEffect(() => {
    let isMounted = true;
    async function loadSavedAnalysis() {
      if (userId && userId !== 'guest_user') {
        try {
          const saved = await cloudStore.getLatestGithubAnalysis(userId);
          if (isMounted && saved) {
            setResult(saved);
            if (saved.profileUrl) {
              setGithubUrlInput(saved.profileUrl);
            }
          }
        } catch (err) {
          console.warn('Could not load saved GitHub analysis:', err);
        }
      }
      if (isMounted) setIsLoadingSaved(false);
    }
    loadSavedAnalysis();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportGitHubReadinessPDF(profile, result, result.profileUrl || githubUrlInput.trim());
    } catch (err) {
      setErrorState('Could not export GitHub Readiness PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRunAudit = async () => {
    const rawUrl = githubUrlInput.trim();
    setErrorState(null);

    // 1. STEP 1: Strict URL Validation
    const validation = validateGithubUrl(rawUrl);
    if (!validation.valid || !validation.username) {
      setResult(null);
      setErrorState(validation.error || 'Invalid GitHub profile URL');
      return;
    }

    const username = validation.username;

    // Reset previous result before starting fresh audit for new URL
    setResult(null);
    setIsAuditing(true);
    setAuditStep('Analyzing GitHub profile...');

    try {
      // 2. Fetch real public profile evidence from GitHub REST API
      const evidence = await fetchRealGithubProfileData(username, (step) => {
        setAuditStep(step);
      });

      setAuditStep('Generating readiness score...');
      await new Promise((r) => setTimeout(r, 400));

      // 3. Compute real evidence-based readiness score
      const analysis = calculateGithubReadiness(evidence, userId);

      setResult(analysis);
      setIsAuditing(false);

      // 4. Persist to Supabase
      if (userId && userId !== 'guest_user') {
        await cloudStore.saveLatestGithubAnalysis(userId, analysis);
      }
    } catch (err: any) {
      setIsAuditing(false);
      setResult(null);
      const errMsg = err?.message || 'GitHub profile could not be verified.';
      setErrorState(errMsg);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Real GitHub & Repository Readiness Analyzer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              EVIDENCE-BASED AUDIT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time public GitHub API verification evaluating repository quality, commit recency, documentation, and tech stacks.
          </p>
        </div>

        {result && (
          <button
            id="export-github-readiness-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting PDF...' : 'Download GitHub Readiness PDF'}</span>
          </button>
        )}
      </div>

      {/* Protocol Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0 text-blue-500" />
        <span>
          <strong>Live Verification Protocol:</strong> Checks public GitHub REST API endpoints for user profile metadata, active repositories, language distributions, and commit timestamps.
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isAuditing) handleRunAudit();
            }}
            placeholder="https://github.com/username"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
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
              <span>{auditStep}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Audit GitHub Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {errorState && (
        <div
          id="github-audit-error-banner"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleRunAudit} className="font-bold underline cursor-pointer hover:text-rose-800">
            Retry
          </button>
        </div>
      )}

      {/* Auditing In-Progress Banner */}
      {isAuditing && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 py-10">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-center">
            <p className="font-bold text-sm text-slate-900 dark:text-white">{auditStep}</p>
            <p className="text-xs text-slate-500 mt-1">Collecting public commits, repositories, and documentation signals...</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !isAuditing && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Verified Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {result.evidence.avatarUrl ? (
                <img
                  src={result.evidence.avatarUrl}
                  alt={result.username}
                  className="w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">
                  {result.username.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {result.evidence.name || `@${result.username}`}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Public Profile
                  </span>
                </div>
                <a
                  href={result.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>{result.profileUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong>{result.evidence.publicReposCount}</strong> Public Repos
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <strong>{result.evidence.totalStars}</strong> Stars
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                Last Activity:{' '}
                <strong>
                  {result.evidence.lastActivityDate
                    ? new Date(result.evidence.lastActivityDate).toLocaleDateString()
                    : 'N/A'}
                </strong>
              </span>
            </div>
          </div>

          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Overall Score */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                OVERALL READINESS
              </span>
              <div className="my-2">
                <span className="text-3xl font-black text-blue-400">{result.overallScore}%</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold">{result.profileStrength}</span>
            </div>

            {/* Profile Quality /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PROFILE QUALITY
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.profileQuality}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Bio & README setup</span>
            </div>

            {/* Project Quality /25 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                PROJECT QUALITY
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.projectQuality}
                  <span className="text-xs font-normal text-slate-400">/25</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Original repos & depth</span>
            </div>

            {/* README Documentation /20 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                DOCUMENTATION
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.documentation}
                  <span className="text-xs font-normal text-slate-400">/20</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Descriptions & guides</span>
            </div>

            {/* Repo Organization /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ORGANIZATION
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.organization}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Naming & topic tags</span>
            </div>

            {/* Activity & Consistency /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ACTIVITY
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.activity}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Push recency & cadence</span>
            </div>
          </div>

          {/* Languages Footprint */}
          {result.evidence.topLanguages.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                DETECTED PROGRAMMING LANGUAGES & STACK FOOTPRINT
              </span>
              <div className="flex flex-wrap gap-2">
                {result.evidence.topLanguages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <Code2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{lang.language}</span>
                    <span className="text-slate-400 font-normal">({lang.percentage}%)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses (Evidence-Based) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                Evidence-Based Strengths
              </span>
              <ul className="space-y-2">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Needed Improvements */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                Areas for Improvement
              </span>
              <ul className="space-y-2">
                {result.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Checklist and Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Screening Checklist */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Recruiter Screening Checklist
              </span>
              <div className="space-y-2">
                {result.checklist.map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{chk.item}</span>
                      {chk.note && <span className="text-[11px] text-slate-400 block">{chk.note}</span>}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ml-2 ${
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

            {/* High Impact Polish Recommendations */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                High-Impact Recommendations
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
