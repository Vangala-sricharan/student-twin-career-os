import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Plus,
  Zap,
} from 'lucide-react';
import { simulateReadinessChange, WhatIfState } from '../../lib/aiCareerEngine';

export const WhatIfCareerSimulator: React.FC = () => {
  const { readinessScore, profile, careerGoal } = useStudentTwin();

  const [simState, setSimState] = useState<WhatIfState>({
    addedProjects: 0,
    learnedNewSkills: 0,
    completedCertifications: 0,
    dsaBoost: 0,
    aiMlBoost: 0,
    githubPolished: false,
  });

  const simResult = simulateReadinessChange(readinessScore, simState);

  const resetSimulation = () => {
    setSimState({
      addedProjects: 0,
      learnedNewSkills: 0,
      completedCertifications: 0,
      dsaBoost: 0,
      aiMlBoost: 0,
      githubPolished: false,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              What-If Career Readiness Simulator
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              SIMULATION ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Simulate how acquiring specific skills, publishing projects, or solving DSA impacts your overall readiness score.
          </p>
        </div>

        <button
          onClick={resetSimulation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Simulation</span>
        </button>
      </div>

      {/* Prominent Simulation Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-center gap-2.5 text-purple-800 dark:text-purple-300 text-xs">
        <Sparkles className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
        <span>
          <strong>Simulation Projection Only:</strong> Demonstrates hypothetical index trajectory based on mathematical weighting. Not an employment guarantee.
        </span>
      </div>

      {/* Projection Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            CURRENT SCORE
          </span>
          <div className="my-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {readinessScore.overall}%
            </span>
          </div>
          <span className="text-xs text-slate-500">{readinessScore.level}</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col justify-between shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
            PROJECTED SCORE
          </span>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-purple-400">
              {simResult.projectedOverall}%
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-400">
            {simResult.projectedOverall >= 85 ? 'Industry Elite Candidate' : 'Career Ready Candidate'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/50 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            PROJECTED BOOST DELTA
          </span>
          <div className="my-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
              +{simResult.delta}%
            </span>
          </div>
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            {simResult.delta > 0 ? 'Projected Readiness Growth' : 'Adjust levers below to simulate'}
          </span>
        </div>
      </div>

      {/* Interactive Levers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Project Lever */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Add Verified Full-Stack / ML Projects
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              +{simState.addedProjects} Projects
            </span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => setSimState((prev) => ({ ...prev, addedProjects: num }))}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  simState.addedProjects === num
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>
        </div>

        {/* Learn New In-Demand Skills */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Learn High-Yield Tech Skills
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              +{simState.learnedNewSkills} Skills
            </span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setSimState((prev) => ({ ...prev, learnedNewSkills: num }))}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  simState.learnedNewSkills === num
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                +{num}
              </button>
            ))}
          </div>
        </div>

        {/* Boost DSA Competency Slider */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              DSA Problem-Solving Surge
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              +{simState.dsaBoost} pts
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="5"
            value={simState.dsaBoost}
            onChange={(e) =>
              setSimState((prev) => ({ ...prev, dsaBoost: parseInt(e.target.value) || 0 }))
            }
            className="w-full accent-purple-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0 problems</span>
            <span>+30 Mediums</span>
            <span>+60 Mediums / Hard</span>
          </div>
        </div>

        {/* Polish GitHub & Add CI/CD Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Polish GitHub & Add CI/CD
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Demo GIFs, clean READMEs, and test badges
            </span>
          </div>
          <button
            onClick={() =>
              setSimState((prev) => ({ ...prev, githubPolished: !prev.githubPolished }))
            }
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              simState.githubPolished
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {simState.githubPolished ? '✓ Active (+8%)' : 'Simulate'}
          </button>
        </div>
      </div>
    </div>
  );
};
