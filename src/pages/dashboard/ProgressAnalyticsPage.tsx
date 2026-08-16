import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { ActiveTab, SkillCategory } from '../../types';
import {
  TrendingUp,
  Award,
  Code2,
  FolderGit2,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  IndianRupee,
  Sparkles,
  Download,
  AlertCircle,
} from 'lucide-react';
import { exportStudentStatisticsPDF } from '../../lib/pdfExport';
import { generateAICareerInsights } from '../../lib/aiCareerEngine';

interface ProgressAnalyticsPageProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const ALL_CATEGORIES: SkillCategory[] = [
  'Programming',
  'DSA',
  'AI/ML',
  'Web Development',
  'Databases',
  'Tools',
  'Cloud',
  'Soft Skills',
];

export const ProgressAnalyticsPage: React.FC<ProgressAnalyticsPageProps> = ({ setActiveTab }) => {
  const { profile, skills, projects, achievements, careerGoal, readinessScore, profileCompletion } = useStudentTwin();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Compute category distributions
  const categoryStats = ALL_CATEGORIES.map((cat) => {
    const matched = skills.filter((s) => s.category === cat);
    const count = matched.length;
    const avgScore = count > 0 ? Math.round(matched.reduce((acc, s) => acc + (s.score ?? 75), 0) / count) : 0;
    return { category: cat, count, avgScore };
  });

  // Projects stats
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;
  const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
  const plannedProjects = projects.filter((p) => p.status === 'Planned').length;

  const difficultyStats = {
    Production: projects.filter((p) => p.difficulty === 'Production').length,
    Advanced: projects.filter((p) => p.difficulty === 'Advanced').length,
    Intermediate: projects.filter((p) => p.difficulty === 'Intermediate').length,
    Basic: projects.filter((p) => p.difficulty === 'Basic').length,
  };

  // Milestone stats
  const totalMilestones = careerGoal?.milestones?.length || 0;
  const completedMilestones = careerGoal?.milestones?.filter((m) => m.completed).length || 0;
  const milestonePercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

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
    setExportError(null);
    try {
      await exportStudentStatisticsPDF({
        profile,
        skills,
        projects,
        achievements,
        careerGoal,
        readinessScore,
        profileCompletion,
        aiInsights: {
          strengths: insights.strongAreas,
          weaknesses: insights.needsImprovement,
          careerRisks: [insights.careerRisk],
          highestImpactAction: insights.highestImpactAction,
          nextSteps: [insights.recommendedNextStep],
        },
      });
    } catch (err) {
      setExportError('Failed to generate Statistics PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Recommendations & Areas for Improvement (Calculated dynamically)
  const recommendations: string[] = [];
  if (skills.length < 6) {
    recommendations.push('Catalog at least 6 technical skills across Core CS and AI/ML to strengthen your coverage index.');
  }
  if (projects.length < 2) {
    recommendations.push('Add at least 2 production or advanced engineering projects with active GitHub source links.');
  }
  if (achievements.length < 2) {
    recommendations.push('Add contest rankings (LeetCode/Codeforces) or cloud credentials in the Achievements log.');
  }
  if (milestonePercent < 50) {
    recommendations.push('Complete upcoming milestones in your Career Trajectory roadmap to accelerate placement readiness.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Outstanding profile modeling! Continue refining system architecture challenges and contributing to open source.');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Progress Analytics & Career Readiness
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-dimensional assessment of technical depth, project complexity, and milestone completion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="analytics-open-ai-hub-btn"
            onClick={() => setActiveTab('ai-hub')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>AI Career Hub</span>
          </button>

          <button
            id="analytics-download-statistics-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Statistics PDF'}</span>
          </button>
        </div>
      </div>

      {exportError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{exportError}</span>
          </div>
          <button onClick={handleExportPDF} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Overall Readiness
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {readinessScore.overall}%
            </p>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {readinessScore.level}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${readinessScore.overall}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Profile Completeness
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {profileCompletion}%
            </p>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Identity Synced
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${profileCompletion}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Roadmap Milestones
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900 dark:text-white">
              {completedMilestones}/{totalMilestones}
            </p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {milestonePercent}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${milestonePercent}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Target Compensation
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {careerGoal?.targetCompensationINR || '₹18,00,000'}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
            Role: {careerGoal?.targetRole || 'AI/ML Engineer'}
          </p>
        </div>
      </div>

      {/* Grid: Skills Breakdown & Projects Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Skills Taxonomy Distribution
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Coverage across {skills.length} tracked engineering competencies
              </p>
            </div>
            <button
              onClick={() => setActiveTab('skills')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {categoryStats.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {item.count > 0 ? `${item.count} skills (Avg: ${item.avgScore})` : '0 skills'}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.count > 0 ? 'bg-blue-600' : 'bg-transparent'
                    }`}
                    style={{ width: `${Math.min(100, item.count * 25)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Breakdown by Status & Difficulty */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Engineering Projects Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {projects.length} repositories cataloged in portfolio
              </p>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Status Breakdown */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Deployment & Execution Status
            </span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60">
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{completedProjects}</p>
                <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase mt-0.5">Completed</p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{inProgressProjects}</p>
                <p className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase mt-0.5">In Progress</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60">
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{plannedProjects}</p>
                <p className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase mt-0.5">Planned</p>
              </div>
            </div>
          </div>

          {/* Difficulty & Scale Breakdown */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Complexity & Architecture Scale
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{difficultyStats.Production}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Production</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{difficultyStats.Advanced}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Advanced</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-lg font-extrabold text-sky-600 dark:text-sky-400">{difficultyStats.Intermediate}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Intermediate</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-lg font-extrabold text-slate-600 dark:text-slate-400">{difficultyStats.Basic}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Basic</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Areas for Improvement & Strategic Next Steps */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Areas for Improvement & Recommended Next Steps
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic advisory synthesized from your current Digital Twin metrics.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
            >
              <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {rec}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
