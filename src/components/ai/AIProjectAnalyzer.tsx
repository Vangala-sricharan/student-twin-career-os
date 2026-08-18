import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Zap,
  Check,
  X,
} from 'lucide-react';
import { ProjectAnalysisRecord } from '../../types';
import { auditProjectTechnicalDepth } from '../../lib/projectAnalysisService';
import { cloudStore } from '../../lib/cloudStore';
import { exportProjectAnalysisPDF } from '../../lib/pdfExport';

export const AIProjectAnalyzer: React.FC = () => {
  const { projects, profile } = useStudentTwin();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'custom');
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customTech, setCustomTech] = useState('');
  const [customGithub, setCustomGithub] = useState('');
  const [customLive, setCustomLive] = useState('');
  const [customRole, setCustomRole] = useState('Full-Stack Engineer');
  const [customDifficulty, setCustomDifficulty] = useState('Intermediate');
  const [customStatus, setCustomStatus] = useState('Completed');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ProjectAnalysisRecord | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // When selected project changes, immediately clear previous analysis state and try to load saved analysis for this specific project
  useEffect(() => {
    let isCancelled = false;
    setErrorState(null);
    setResult(null);

    if (selectedProjectId && selectedProjectId !== 'custom') {
      setIsLoadingSaved(true);
      cloudStore
        .getProjectAnalysis(profile.id, selectedProjectId)
        .then((saved) => {
          if (!isCancelled && saved && saved.projectId === selectedProjectId) {
            setResult(saved);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!isCancelled) setIsLoadingSaved(false);
        });
    } else {
      setIsLoadingSaved(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedProjectId, profile.id]);

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

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorState(null);

    try {
      let title = customTitle.trim();
      let desc = customDesc.trim();
      let tech = customTech.split(',').map((t) => t.trim()).filter(Boolean);
      let github = customGithub.trim();
      let live = customLive.trim();
      let role = customRole.trim();
      let difficulty = customDifficulty;
      let status = customStatus;
      const targetProjectId = selectedProjectId === 'custom' ? `custom_${Date.now()}` : selectedProjectId;

      if (selectedProjectId !== 'custom') {
        const p = projects.find((proj) => proj.id === selectedProjectId);
        if (!p) {
          throw new Error('Selected project could not be found in project database.');
        }
        title = p.title;
        desc = p.description;
        tech = p.techStack;
        github = p.githubUrl || '';
        live = p.liveUrl || '';
        role = p.role || 'Lead Engineer';
        difficulty = p.difficulty || 'Intermediate';
        status = p.status || 'Completed';
      }

      if (!title) {
        throw new Error('Please select a project with a valid title or provide custom project information.');
      }

      const analysis = await auditProjectTechnicalDepth({
        userId: profile.id,
        projectId: targetProjectId,
        projectTitle: title,
        description: desc,
        techStack: tech,
        githubUrl: github || undefined,
        liveUrl: live || undefined,
        role,
        difficulty,
        status,
      });

      // Save specifically associated with user_id + project_id
      await cloudStore.saveProjectAnalysis(profile.id, targetProjectId, analysis);

      setResult(analysis);
    } catch (err: any) {
      console.error('Project Technical Depth Audit failed:', err);
      setErrorState(err?.message || 'Project evaluation failed. Please verify project data and retry.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

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
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Choose Project to Analyze
          </label>
          <select
            id="select-project-dropdown"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.techStack.slice(0, 3).join(', ')})
              </option>
            ))}
            <option value="custom">+ Input Custom / New Project Info</option>
          </select>
        </div>

        {/* Selected Project Summary Card if selecting an existing project */}
        {selectedProjectId !== 'custom' && selectedProject && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedProject.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10px]">
                  {selectedProject.difficulty || 'Intermediate'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium text-[10px]">
                  {selectedProject.status}
                </span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {selectedProject.description || 'No description provided.'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {selectedProject.techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              {selectedProject.githubUrl ? (
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Github className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[220px]">{selectedProject.githubUrl}</span>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic">No GitHub repo linked</span>
              )}
              {selectedProject.liveUrl ? (
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[200px]">{selectedProject.liveUrl}</span>
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 italic">No live demo linked</span>
              )}
            </div>
          </div>
        )}

        {/* Custom Input Form if selecting Custom */}
        {selectedProjectId === 'custom' && (
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Distributed Task Queue & Stream Processor"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Tech Stack (comma-separated) *
                </label>
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  placeholder="e.g. Go, Redis, Docker, gRPC, PostgreSQL"
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
                placeholder="Explain the technical problem, database schema, concurrency model, and system boundaries..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  GitHub Repository URL (optional)
                </label>
                <input
                  type="text"
                  value={customGithub}
                  onChange={(e) => setCustomGithub(e.target.value)}
                  placeholder="https://github.com/username/repo-name"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Live Demo URL (optional)
                </label>
                <input
                  type="text"
                  value={customLive}
                  onChange={(e) => setCustomLive(e.target.value)}
                  placeholder="https://my-project-live.app"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Your Role
                </label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Lead Architect"
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Difficulty
                </label>
                <select
                  value={customDifficulty}
                  onChange={(e) => setCustomDifficulty(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Basic">Basic</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Production">Production</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Status
                </label>
                <select
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {isLoadingSaved
              ? 'Checking saved analysis for this project...'
              : result
              ? `Displaying verified analysis for "${result.projectTitle}"`
              : 'Project selected. Run Technical Depth Audit to analyze this project.'}
          </span>
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

      {/* When no result is loaded */}
      {!result && !isAnalyzing && (
        <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
          <FolderGit2 className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No Active Audit For This Project
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click &quot;Run Technical Depth Audit&quot; above to perform an evidence-based architectural audit, verify repository signals, and compute technical metrics for this specific project.
          </p>
        </div>
      )}

      {/* Result Metrics */}
      {result && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col justify-between shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  TECHNICAL DEPTH
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {result.rating || 'Evaluated'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 my-1">
                <span className="text-3xl sm:text-4xl font-black text-blue-400">
                  {result.technicalDepthScore}
                </span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
              <div className="text-xs font-semibold text-indigo-300 flex items-center justify-between">
                <span>Rating: {result.complexityRating}</span>
                {result.analysisDate && (
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(result.analysisDate).toLocaleDateString()}
                  </span>
                )}
              </div>
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
                {result.resumeImpact || result.resumeImpactValue}
              </p>
            </div>
          </div>

          {/* 8-Category Detailed Breakdown */}
          {result.categoryScores && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  <span>Technical Evaluation Breakdown</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  8 Rigorous Architecture Dimensions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    name: 'System Design & Arch',
                    score: result.categoryScores.architectureSystemDesign,
                    max: 20,
                  },
                  {
                    name: 'Technical Complexity',
                    score: result.categoryScores.technicalComplexity,
                    max: 20,
                  },
                  {
                    name: 'Technology Stack',
                    score: result.categoryScores.technologyStack,
                    max: 15,
                  },
                  {
                    name: 'Data & DB Architecture',
                    score: result.categoryScores.dataBackendDatabase,
                    max: 15,
                  },
                  {
                    name: 'Security & Auth',
                    score: result.categoryScores.securityAuthentication,
                    max: 10,
                  },
                  {
                    name: 'Scalability & Perf',
                    score: result.categoryScores.scalabilityPerformance,
                    max: 10,
                  },
                  {
                    name: 'Testing & Reliability',
                    score: result.categoryScores.testingReliability,
                    max: 5,
                  },
                  {
                    name: 'DevOps & Deployment',
                    score: result.categoryScores.deploymentDevops,
                    max: 5,
                  },
                ].map((cat, idx) => {
                  const pct = Math.min(100, Math.round((cat.score / cat.max) * 100));
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                          {cat.name}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">
                          {cat.score}/{cat.max}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Repository & Evidence Signals */}
          {result.evidence && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Verified Project Evidence Signals</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Database Layer</span>
                  {result.evidence.hasDatabase ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Detected
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">None</span>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Authentication</span>
                  {result.evidence.hasAuth ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Detected
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500">None</span>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Testing Suite</span>
                  {result.evidence.hasTesting ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Detected
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Missing</span>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Live Deployment</span>
                  {result.evidence.liveDemoVerified ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Unverified</span>
                  )}
                </div>
              </div>

              {result.evidence.githubRepoData && (
                <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Github className="w-3.5 h-3.5" />
                    {result.evidence.githubRepoData.repoFullName || 'Repository'}:
                  </span>
                  <span>{result.evidence.githubRepoData.verificationMessage}</span>
                  {result.evidence.githubRepoData.hasReadme && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      ✓ README Verified
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Evaluated Technologies & Industry Demand */}
          {Array.isArray(result.technologiesEvaluated) && result.technologiesEvaluated.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Technologies Evaluated & Industry Demand
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {result.technologiesEvaluated.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white font-mono">
                        {t.name}
                      </span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                        {t.relevance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {t.industryDemand}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Improvements & Actionable Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing Production Upgrades</span>
              </div>
              <ul className="space-y-2">
                {(result.missingProductionUpgrades || result.missingImprovements || []).map((imp, idx) => (
                  <li key={idx} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <span className="font-bold shrink-0">•</span>
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
