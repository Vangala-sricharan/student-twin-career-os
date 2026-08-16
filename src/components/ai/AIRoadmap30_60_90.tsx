import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Clock,
  Download,
  AlertCircle,
} from 'lucide-react';
import { generate306090Roadmap, Roadmap306090Result } from '../../lib/aiCareerEngine';
import { exportCareerRoadmapPDF } from '../../lib/pdfExport';

export const AIRoadmap30_60_90: React.FC = () => {
  const { profile, skills, projects, achievements, careerGoal, readinessScore } = useStudentTwin();
  const [activeSprint, setActiveSprint] = useState<'30' | '60' | '90'>('30');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({
    d30_1: false,
    d30_2: true,
    d30_3: true,
    d60_1: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  const roadmap: Roadmap306090Result = generate306090Roadmap(
    profile,
    skills,
    projects,
    achievements,
    careerGoal
  );

  const toggleMilestone = (id: string) => {
    setCompletedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExportRoadmap = async () => {
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportCareerRoadmapPDF(profile, careerGoal, roadmap);
    } catch (err) {
      setErrorState('Could not export Career Roadmap PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentSprintData =
    activeSprint === '30' ? roadmap.day30 : activeSprint === '60' ? roadmap.day60 : roadmap.day90;

  const totalSprintMilestones = currentSprintData.milestones.length;
  const completedCount = currentSprintData.milestones.filter(
    (m) => completedItems[m.id] !== undefined ? completedItems[m.id] : m.completed
  ).length;
  const sprintProgress = Math.round((completedCount / Math.max(1, totalSprintMilestones)) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI 30 / 60 / 90-Day Placement Roadmap
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              MILESTONE OS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Structured quarterly sprint plan tailored for {careerGoal.targetRole || 'Engineering'} recruitment.
          </p>
        </div>

        <button
          id="export-roadmap-pdf-btn"
          onClick={handleExportRoadmap}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting PDF...' : 'Download Career Roadmap PDF'}</span>
        </button>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleExportRoadmap} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* 3-Tab Sprint Switcher */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSprint('30')}
          className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSprint === '30'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>30-Day Sprint</span>
          <span className="text-[10px] font-medium opacity-70">Core Gaps & DSA</span>
        </button>

        <button
          onClick={() => setActiveSprint('60')}
          className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSprint === '60'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>60-Day Sprint</span>
          <span className="text-[10px] font-medium opacity-70">Systems & Portfolio</span>
        </button>

        <button
          onClick={() => setActiveSprint('90')}
          className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
            activeSprint === '90'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>90-Day Sprint</span>
          <span className="text-[10px] font-medium opacity-70">Placement Ready</span>
        </button>
      </div>

      {/* Active Sprint Overview Banner */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {currentSprintData.duration} • {currentSprintData.phase}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-1">
            Focus: {currentSprintData.focus}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Phase Completion</span>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400">{sprintProgress}%</p>
          </div>
          <div className="w-16 sm:w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${sprintProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Milestones Checklist */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Actionable Sprint Milestones (Click to mark complete)
        </span>

        <div className="space-y-2.5">
          {currentSprintData.milestones.map((m) => {
            const isDone = completedItems[m.id] !== undefined ? completedItems[m.id] : m.completed;
            return (
              <div
                key={m.id}
                onClick={() => toggleMilestone(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 select-none ${
                  isDone
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white dark:text-slate-900" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 hover:text-blue-500" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs sm:text-sm font-bold ${
                        isDone
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {m.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {m.category}
                    </span>
                  </div>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      isDone
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {m.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
