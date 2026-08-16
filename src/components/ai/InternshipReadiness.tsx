import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  Target,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';
import { calculateInternshipReadiness } from '../../lib/aiCareerEngine';
import { exportInternshipReadinessPDF } from '../../lib/pdfExport';

export const InternshipReadiness: React.FC = () => {
  const { profile, skills, projects, achievements, careerGoal, readinessScore } = useStudentTwin();
  const [isExporting, setIsExporting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const data = calculateInternshipReadiness(
    profile,
    skills,
    projects,
    achievements,
    careerGoal,
    readinessScore
  );

  const handleExportPDF = async () => {
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportInternshipReadinessPDF(profile, data);
    } catch (err) {
      setErrorState('Could not export Internship Readiness PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Internship Readiness & Role Matching
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              HIRING RADAR
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time screening readiness for campus recruitment, technical internships, and product roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 text-center">
            Status: <span className="text-blue-600 dark:text-blue-400">{data.statusTier}</span>
          </div>

          <button
            id="export-internship-readiness-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Download Internship Readiness PDF'}</span>
          </button>
        </div>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleExportPDF} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Main Readiness Gauge and Role Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Readiness Gauge Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-between shadow-md">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
              OVERALL INTERNSHIP READINESS
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl sm:text-5xl font-black text-blue-400">
                {data.readinessPercentage}%
              </span>
              <span className="text-xs text-slate-400">benchmark index</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on active {skills.length} skills and {projects.length} repository projects evaluated against hiring bars.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Target Role:</span>
              <strong className="text-white">{data.targetRole}</strong>
            </div>
            <div className="flex justify-between">
              <span>Target CTC:</span>
              <strong className="text-emerald-400">{careerGoal.targetCompensationINR || '₹18,00,000 / yr'}</strong>
            </div>
          </div>
        </div>

        {/* Role Match Breakdown */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3.5 flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
            Role Compatibility Match Rates
          </span>

          <div className="space-y-3">
            {data.roleMatches.map((rm, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{rm.role}</span>
                  <span className="text-blue-600 dark:text-blue-400">{rm.matchPercent}% Match</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${rm.matchPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths and Blockers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Competitive Strengths</span>
          </div>
          <ul className="space-y-2">
            {data.strengths.map((s, idx) => (
              <li key={idx} className="text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Screening Blockers</span>
          </div>
          <ul className="space-y-2">
            {data.blockers.map((b, idx) => (
              <li key={idx} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recommended Priority Actions */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Priority Action Checklist for Next 30 Days
        </span>
        <div className="space-y-2.5">
          {data.recommendedActions.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                    rec.priority === 'P0'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : rec.priority === 'P1'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {rec.priority}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{rec.action}</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                {rec.timeEstimate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
