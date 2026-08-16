import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  FolderGit2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Code2,
  Layers,
  ExternalLink,
  Github,
  Award,
  AlertCircle,
} from 'lucide-react';
import { analyzeProjectTechnicalDepth, ProjectAnalysisResult } from '../../lib/aiCareerEngine';
import { exportProjectAnalysisPDF } from '../../lib/pdfExport';

export const AIProjectAnalyzer: React.FC = () => {
  const { projects, profile } = useStudentTwin();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customTech, setCustomTech] = useState('');
  const [customGithub, setCustomGithub] = useState('');
  const [customLive, setCustomLive] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProjectAnalysisResult | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportProjectAnalysisPDF(profile, result);
    } catch (err) {
      setErrorState('Could not export Project Analysis PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setErrorState(null);

    setTimeout(() => {
      try {
        let title = customTitle;
        let desc = customDesc;
        let tech = customTech.split(',').map((t) => t.trim()).filter(Boolean);
        let github = customGithub;
        let live = customLive;

        if (selectedProjectId !== 'custom') {
          const p = projects.find((proj) => proj.id === selectedProjectId);
          if (p) {
            title = p.title;
            desc = p.description;
            tech = p.techStack;
            github = p.githubUrl || '';
            live = p.liveUrl || '';
          }
        }

        if (!title.trim()) {
          title = 'Neural Vision Classifier Pipeline';
          desc = 'End-to-end computer vision inference pipeline with PyTorch, FastAPI backend, and containerized Docker architecture.';
          tech = ['Python', 'PyTorch', 'FastAPI', 'Docker'];
          github = 'https://github.com/vangala-sricharan/neural-vision';
          live = 'https://demo-vision-model.app';
        }

        const analysis = analyzeProjectTechnicalDepth(title, desc, tech, github, live);
        setResult(analysis);
        setIsAnalyzing(false);
      } catch (err) {
        setIsAnalyzing(false);
        setErrorState('Project evaluation failed. Please retry.');
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
              AI Project Technical Depth & Architecture Analyzer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              SYSTEMS AUDIT
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Evaluate architectural complexity, technical depth, resume impact score, and missing production upgrades.
          </p>
        </div>

        {result && (
          <button
            id="export-project-analysis-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>{isExporting ? 'Exporting PDF...' : 'Download Project Analysis PDF'}</span>
          </button>
        )}
      </div>

      {/* Project Selector / Custom Switcher */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Choose Project to Analyze
          </label>
          <select
            id="select-project-dropdown"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.techStack.join(', ')})
              </option>
            ))}
            <option value="custom">+ Input Custom / New Project Info</option>
          </select>
        </div>

        {selectedProjectId === 'custom' && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Queue"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  placeholder="e.g. Python, PyTorch, Docker, FastAPI"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Project Description & Architecture Overview
              </label>
              <textarea
                rows={3}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Explain the technical problem, architecture, benchmarks, and data flow..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={customGithub}
                onChange={(e) => setCustomGithub(e.target.value)}
                placeholder="GitHub Repository URL"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={customLive}
                onChange={(e) => setCustomLive(e.target.value)}
                placeholder="Live Demo URL (optional)"
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            id="run-project-analyzer-btn"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing Code Depth...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Technical Depth Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleRunAnalysis} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Result Metrics */}
      {result && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col justify-between shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                TECHNICAL DEPTH
              </span>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl sm:text-4xl font-black text-blue-400">
                  {result.technicalDepthScore}
                </span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <span className="text-xs font-semibold text-indigo-300">
                Rating: {result.complexityRating}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                REAL-WORLD VALUE
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                {result.realWorldValue}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                RESUME IMPACT
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                {result.resumeImpactValue}
              </p>
            </div>
          </div>

          {/* Missing Improvements & Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing Production Upgrades</span>
              </div>
              <ul className="space-y-2">
                {result.missingImprovements.map((imp, idx) => (
                  <li key={idx} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Actionable Recommendations</span>
              </div>
              <ul className="space-y-2">
                {result.actionableRecommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
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
