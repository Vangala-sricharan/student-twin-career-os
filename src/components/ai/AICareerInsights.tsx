import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  ArrowRight,
  ShieldAlert,
  Download,
  AlertCircle,
} from 'lucide-react';
import { generateAICareerInsights } from '../../lib/aiCareerEngine';
import { exportAICareerInsightsPDF } from '../../lib/pdfExport';

export const AICareerInsights: React.FC = () => {
  const { profile, skills, projects, achievements, careerGoal, readinessScore } = useStudentTwin();
  const [isExporting, setIsExporting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const insights = generateAICareerInsights(
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
      await exportAICareerInsightsPDF(profile, insights, careerGoal, readinessScore);
    } catch (err) {
      setErrorState('Could not export AI Career Insights PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row with Export PDF */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
            AI Career Diagnostic & Insights Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic intelligence synthesized from active competencies, projects, and target benchmark matrices.
          </p>
        </div>

        <button
          id="export-ai-career-insights-pdf-btn"
          onClick={handleExportPDF}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting PDF...' : 'Download AI Career Insights PDF'}</span>
        </button>
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

      {/* Highest Impact Career Action Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>HIGHEST IMPACT CAREER ACTION</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
              {insights.highestImpactAction}
            </h3>
            <p className="text-xs text-slate-300">
              Directly unlocks recruiter shortlists and increases twin readiness index toward tier-1 threshold.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Forecast</span>
            <span className="text-2xl font-black text-emerald-400">
              {insights.roleReadinessPercentage}%
            </span>
            <span className="text-[11px] text-slate-300 block">Match for {careerGoal.targetRole || 'Target Role'}</span>
          </div>
        </div>
      </div>

      {/* 4-Card Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strong Areas */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Strong Technical Areas
            </h4>
          </div>
          <ul className="space-y-2.5">
            {insights.strongAreas.map((st, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Needs Improvement */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Needs Improvement / Priority Gaps
            </h4>
          </div>
          <ul className="space-y-2.5">
            {insights.needsImprovement.map((gap, idx) => (
              <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Next Step */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Target className="w-5 h-5" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Immediate Recommended Step
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {insights.recommendedNextStep}
          </p>
        </div>

        {/* Career Risk Analysis */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Critical Career Risk to Mitigate
            </h4>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {insights.careerRisk}
          </p>
        </div>
      </div>
    </div>
  );
};
