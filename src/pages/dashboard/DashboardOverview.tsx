import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { ActiveTab } from '../../types';
import {
  Sparkles,
  Gauge,
  Code2,
  FolderGit2,
  Award,
  Target,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  BookOpen,
  Download,
  Bot,
  Zap,
  Sliders,
} from 'lucide-react';
import { exportStudentTwinPDF } from '../../lib/pdfExport';
import { generateAICareerInsights } from '../../lib/aiCareerEngine';

interface DashboardOverviewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const { profile, skills, projects, achievements, careerGoal, readinessScore } = useStudentTwin();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const studentName = profile?.fullName || user?.user_metadata?.full_name || 'Engineering Student';
  const majorDegree = profile?.major ? `${profile.degree ? profile.degree + ' in ' : ''}${profile.major}` : 'Computer Science & Engineering';
  const institution = profile?.institution || 'Engineering Institute';
  const graduationYear = profile?.graduationYear || '2026';

  const completedMilestones = careerGoal?.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = careerGoal?.milestones?.length || 4;

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
      await exportStudentTwinPDF({
        profile,
        skills,
        projects,
        achievements,
        careerGoal,
        readinessScore,
        aiInsights: {
          strengths: insights.strongAreas,
          weaknesses: insights.needsImprovement,
          careerRisks: [insights.careerRisk],
          highestImpactAction: insights.highestImpactAction,
          nextSteps: [insights.recommendedNextStep],
        },
      });
    } catch (err) {
      setExportError('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculation for circumference of circular gauge (r=70, C = 2 * PI * 70 = 440)
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore.overall / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {studentName.split(' ')[0]}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              TWIN READY
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Targeting <strong>{careerGoal.targetRole || 'Software / AI Engineer'}</strong> • Current Readiness: <strong>{readinessScore.overall}%</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="dashboard-open-ai-hub-btn"
            onClick={() => setActiveTab('ai-hub')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>AI Career Hub</span>
          </button>

          <button
            id="dashboard-download-dossier-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating PDF...' : 'Download Student Twin PDF'}</span>
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

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-5">
        {/* BENTO TILE 1: Profile & Academic Model (col-span-12 lg:col-span-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200/60 dark:border-blue-900/60">
                ACTIVE PROFILE MODEL
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {institution} • Class of {graduationYear}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {majorDegree}
            </h3>

            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
              {profile?.bio ||
                'Your Student Digital Twin models your technical competencies, code repositories, and career velocity toward top-tier tech benchmarks.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800/80 mt-6">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Skills Verified
              </p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {skills.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Projects Tracked
              </p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {projects.length}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Achievements
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {achievements.length}
              </p>
            </div>
          </div>
        </div>

        {/* BENTO TILE 2: Career Readiness Circular Gauge (col-span-12 lg:col-span-4) */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white flex flex-col items-center justify-center shadow-lg relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl pointer-events-none" />

          <span className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-4">
            CAREER READINESS SCORE
          </span>

          {/* SVG Circular Progress Meter */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                className="text-white/20"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-white transition-all duration-1000 ease-out"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                {readinessScore.overall}%
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-1">
                {readinessScore.level}
              </span>
            </div>
          </div>

          <button
            id="bento-improve-score-btn"
            onClick={() => setActiveTab('skills')}
            className="mt-4 bg-white text-blue-700 px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            Enhance Competencies
          </button>
        </div>

        {/* BENTO TILE 3: Career Goal & Trajectory (col-span-12 lg:col-span-7) */}
        <div className="col-span-12 lg:col-span-7 bg-slate-900 dark:bg-slate-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between shadow-md border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                PRIMARY CAREER TRAJECTORY
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Target: {graduationYear} Placements
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-1">
              <h4 className="text-xl sm:text-2xl font-bold">
                {careerGoal?.targetRole || 'Full-Stack Systems Engineer'}
              </h4>
              <span className="text-sm font-bold text-emerald-400">
                {careerGoal?.targetCompensationINR || '₹15,00,000 / yr'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {careerGoal?.targetCompanies && careerGoal.targetCompanies.length > 0 ? (
                careerGoal.targetCompanies.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700"
                  >
                    {c}
                  </span>
                ))
              ) : (
                ['Google', 'Atlassian', 'Razorpay', 'Microsoft'].map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700"
                  >
                    {c}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{completedMilestones} of {totalMilestones} milestones accomplished</span>
            </div>
            <button
              onClick={() => setActiveTab('goals')}
              className="text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Goal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BENTO TILE 4: Quick Action Launchpad (col-span-12 lg:col-span-5) */}
        <div className="col-span-12 lg:col-span-5 bg-blue-50 dark:bg-blue-950/40 rounded-3xl border border-blue-100 dark:border-blue-900/50 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
              QUICK LAUNCHPAD
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Accelerate Your Twin
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Log newly acquired competencies, deployed projects, or hackathon wins.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              id="bento-quick-skill-btn"
              onClick={() => setActiveTab('skills')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Add Skill</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">6 taxonomy types</p>
            </button>

            <button
              id="bento-quick-project-btn"
              onClick={() => setActiveTab('projects')}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <FolderGit2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Add Project</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">GitHub & live URL</p>
            </button>
          </div>
        </div>

        {/* BENTO TILE 5: Next Action Horizon (col-span-12) */}
        <div className="col-span-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 px-6 sm:px-8 py-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
              NEXT STEP
            </span>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
              {skills.length < 5
                ? 'Catalog at least 5 core engineering skills to unlock intermediate readiness modeling.'
                : projects.length < 2
                ? 'Link a production-grade GitHub repository to demonstrate architecture competency.'
                : 'Keep practicing DSA challenges and log upcoming hackathons in Achievements.'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab(skills.length < 5 ? 'skills' : projects.length < 2 ? 'projects' : 'achievements')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <span>Proceed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* BENTO TILE 6: Detailed 4-Pillar Readiness Breakdown Matrix (col-span-12) */}
        <div className="col-span-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Readiness Computation Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluates four core pillars: Technical Skills Coverage, Project Complexity, Goal Alignment, and Verified Credentials.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 w-fit">
              Total Score: {readinessScore.overall}/100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Skills Coverage</span>
                <span className="font-bold text-slate-900 dark:text-white">{readinessScore.breakdown.skillsCoverage}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${readinessScore.breakdown.skillsCoverage}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {skills.length} skills in taxonomy
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Project Portfolio</span>
                <span className="font-bold text-slate-900 dark:text-white">{readinessScore.breakdown.projectPortfolio}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: `${readinessScore.breakdown.projectPortfolio}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {projects.length} repository projects
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Goal Alignment</span>
                <span className="font-bold text-slate-900 dark:text-white">{readinessScore.breakdown.industryAlignment}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${readinessScore.breakdown.industryAlignment}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {careerGoal?.targetRole ? careerGoal.targetRole : 'Target role pending'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">Verifications</span>
                <span className="font-bold text-slate-900 dark:text-white">{readinessScore.breakdown.verifications}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${readinessScore.breakdown.verifications}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {achievements.length} verified credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
