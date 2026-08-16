import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  Edit3,
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  AlertCircle,
  Eye,
  Settings2,
} from 'lucide-react';
import { exportAIResumePDF } from '../../lib/pdfExport';

export const AIResumeBuilder: React.FC = () => {
  const { profile, skills, projects, achievements, careerGoal } = useStudentTwin();

  const [customSummary, setCustomSummary] = useState(
    profile.bio ||
      `Ambitious Computer Science student targeting ${careerGoal.targetRole || 'Software / AI Engineer'} roles. Experienced in full-stack architecture, clean coding practices, and data structures & algorithms.`
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    projects.map((p) => p.id)
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    skills.map((s) => s.id)
  );
  const [isExporting, setIsExporting] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'customize'>('preview');

  const toggleProject = (id: string) => {
    if (selectedProjectIds.includes(id)) {
      setSelectedProjectIds(selectedProjectIds.filter((pId) => pId !== id));
    } else {
      setSelectedProjectIds([...selectedProjectIds, id]);
    }
  };

  const toggleSkill = (id: string) => {
    if (selectedSkillIds.includes(id)) {
      setSelectedSkillIds(selectedSkillIds.filter((sId) => sId !== id));
    } else {
      setSelectedSkillIds([...selectedSkillIds, id]);
    }
  };

  const handleDownloadResumePDF = async () => {
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportAIResumePDF({
        profile,
        skills,
        projects,
        achievements,
        careerGoal,
        customSummary,
        selectedProjects: selectedProjectIds,
        selectedSkills: selectedSkillIds,
      });
    } catch (err) {
      setErrorState('Failed to generate Resume PDF. Please check your inputs and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const activeProjects = projects.filter((p) => selectedProjectIds.includes(p.id));
  const activeSkills = skills.filter((s) => selectedSkillIds.includes(s.id));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Resume Builder
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              ACTIVE PROFILE ENGINE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Constructs a tailored, recruiter-ready resume dynamically synchronized with your current active student twin profile.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveView('preview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Resume Preview</span>
            </button>
            <button
              onClick={() => setActiveView('customize')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'customize'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>

          <button
            id="ai-builder-download-resume-pdf-btn"
            onClick={handleDownloadResumePDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Building PDF...' : 'Download Resume PDF'}</span>
          </button>
        </div>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleDownloadResumePDF} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Main Content Areas */}
      {activeView === 'customize' ? (
        <div className="space-y-6">
          {/* Custom Summary Editor */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <label className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block">
              Professional Summary / Career Objective
            </label>
            <textarea
              id="resume-custom-summary-textarea"
              rows={3}
              value={customSummary}
              onChange={(e) => setCustomSummary(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter a tailored executive summary..."
            />
          </div>

          {/* Project Inclusion Selectors */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Include Projects ({activeProjects.length}/{projects.length})
              </span>
              <span className="text-[11px] text-slate-500">Toggle to include/exclude from PDF</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {projects.map((proj) => {
                const isSelected = selectedProjectIds.includes(proj.id);
                return (
                  <button
                    key={proj.id}
                    onClick={() => toggleProject(proj.id)}
                    className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {proj.title}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {proj.techStack?.slice(0, 3).join(', ')}
                      </span>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skill Inclusion Selectors */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Include Skills ({activeSkills.length}/{skills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => {
                const isSelected = selectedSkillIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleSkill(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] opacity-75">({s.proficiency})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Document Preview Layout (formatted like a real professional clean resume) */
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto shadow-sm space-y-6 text-slate-900 dark:text-slate-100">
          {/* Header */}
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-800 space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {profile.fullName || 'Student Name'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {profile.email} • {profile.githubUrl || 'github.com/student'} • {profile.linkedinUrl || 'linkedin.com/in/student'}
            </p>
          </div>

          {/* Objective / Summary */}
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Professional Summary
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {customSummary}
            </p>
          </div>

          {/* Education */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Education
            </h3>
            <div className="flex items-start justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">
                  {profile.institution || 'University Institute of Engineering'}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {profile.degree ? profile.degree + ' in ' : 'B.Tech in '}
                  {profile.major || 'Computer Science & Engineering'} • {profile.year || '2nd Year'}
                </span>
              </div>
              <span className="text-slate-500 font-medium shrink-0">
                Graduation: {profile.graduationYear || '2027'}
              </span>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Technical Skills
            </h3>
            <div className="space-y-1 text-xs">
              <div className="flex flex-wrap gap-1.5">
                {activeSkills.map((s) => (
                  <span
                    key={s.id}
                    className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[11px] font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Engineering Projects
            </h3>
            <div className="space-y-3">
              {activeProjects.map((p) => (
                <div key={p.id} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{p.title}</span>
                    <span className="text-slate-500 text-[11px]">
                      {p.techStack?.join(', ')}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    {p.description}
                  </p>
                  {p.githubUrl && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 italic">
                      Source: {p.githubUrl}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Certifications */}
          {achievements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Honors & Certifications
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {achievements.map((ach) => (
                  <li key={ach.id} className="flex items-center justify-between">
                    <span>
                      • <strong>{ach.title}</strong> — {ach.issuer}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {ach.issueDate || ach.date || 'Verified'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
