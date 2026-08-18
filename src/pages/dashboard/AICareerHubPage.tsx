import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Sparkles,
  Bot,
  FileText,
  BookOpen,
  FolderGit2,
  Calendar,
  Briefcase,
  Sliders,
  Github,
  Linkedin,
  TrendingUp,
  Download,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { AICareerAssistant } from '../../components/ai/AICareerAssistant';
import { AIResumeBuilder } from '../../components/ai/AIResumeBuilder';
import { AIResumeAnalyzer } from '../../components/ai/AIResumeAnalyzer';
import { AISyllabusAnalyzer } from '../../components/ai/AISyllabusAnalyzer';
import { AIProjectAnalyzer } from '../../components/ai/AIProjectAnalyzer';
import { AIRoadmap30_60_90 } from '../../components/ai/AIRoadmap30_60_90';
import { InternshipReadiness } from '../../components/ai/InternshipReadiness';
import { WhatIfCareerSimulator } from '../../components/ai/WhatIfCareerSimulator';
import { GitHubReadinessAnalyzer } from '../../components/ai/GitHubReadinessAnalyzer';
import { LinkedInReadinessAnalyzer } from '../../components/ai/LinkedInReadinessAnalyzer';
import { AICareerInsights } from '../../components/ai/AICareerInsights';
import { exportStudentTwinPDF } from '../../lib/pdfExport';

type AIToolTab =
  | 'assistant'
  | 'resume-builder'
  | 'resume'
  | 'roadmap'
  | 'insights'
  | 'internship'
  | 'simulator'
  | 'project'
  | 'syllabus'
  | 'github'
  | 'linkedin';

interface AICareerHubPageProps {
  initialTool?: AIToolTab;
}

export const AICareerHubPage: React.FC<AICareerHubPageProps> = ({ initialTool = 'assistant' }) => {
  const { profile, skills, projects, achievements, careerGoal, readinessScore } = useStudentTwin();
  const [activeTool, setActiveTool] = useState<AIToolTab>(initialTool);
  const [isExporting, setIsExporting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Sync activeTool if initialTool changes
  React.useEffect(() => {
    if (initialTool) {
      setActiveTool(initialTool);
    }
  }, [initialTool]);

  const tools = [
    { id: 'assistant', name: 'AI Career Assistant', icon: Bot, badge: 'Interactive' },
    { id: 'resume-builder', name: 'AI Resume Builder', icon: FileCheck2, badge: 'Download PDF' },
    { id: 'resume', name: 'Resume ATS Analyzer', icon: FileText, badge: 'ATS Audit' },
    { id: 'roadmap', name: '30/60/90-Day Roadmap', icon: Calendar, badge: 'Sprints' },
    { id: 'insights', name: 'AI Career Insights', icon: TrendingUp, badge: 'Live Audit' },
    { id: 'internship', name: 'Internship Readiness', icon: Briefcase, badge: 'Role Match' },
    { id: 'simulator', name: 'What-If Simulator', icon: Sliders, badge: 'Projection' },
    { id: 'project', name: 'Project Depth Analyzer', icon: FolderGit2, badge: 'Architecture' },
    { id: 'syllabus', name: 'Syllabus Analyzer', icon: BookOpen, badge: 'Curriculum' },
    { id: 'github', name: 'GitHub Readiness', icon: Github, badge: 'Reputation' },
    { id: 'linkedin', name: 'LinkedIn Readiness', icon: Linkedin, badge: 'Recruiter' },
  ];

  const handleExportFullDossier = async () => {
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportStudentTwinPDF({
        profile,
        skills,
        projects,
        achievements,
        careerGoal,
        readinessScore,
      });
    } catch (err) {
      setErrorState('Export failed. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Career Intelligence Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
              BUILD 3 FINAL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Autonomous career intelligence suite operating on active profile ({profile.fullName || 'Active Student'}).
          </p>
        </div>

        <button
          id="export-complete-dossier-pdf-btn"
          onClick={handleExportFullDossier}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating PDF...' : 'Download Student Twin Report PDF'}</span>
        </button>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleExportFullDossier} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Tool Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as AIToolTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tool.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {tool.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active AI Tool Component */}
      <div className="transition-all duration-300">
        {activeTool === 'assistant' && <AICareerAssistant />}
        {activeTool === 'resume-builder' && <AIResumeBuilder />}
        {activeTool === 'resume' && <AIResumeAnalyzer />}
        {activeTool === 'roadmap' && <AIRoadmap30_60_90 />}
        {activeTool === 'insights' && <AICareerInsights />}
        {activeTool === 'internship' && <InternshipReadiness />}
        {activeTool === 'simulator' && <WhatIfCareerSimulator />}
        {activeTool === 'project' && <AIProjectAnalyzer />}
        {activeTool === 'syllabus' && <AISyllabusAnalyzer />}
        {activeTool === 'github' && <GitHubReadinessAnalyzer />}
        {activeTool === 'linkedin' && <LinkedInReadinessAnalyzer />}
      </div>
    </div>
  );
};
