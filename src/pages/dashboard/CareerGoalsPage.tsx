import React, { useState, useEffect } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { Milestone } from '../../types';
import {
  Target,
  Building2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Plus,
  Trash2,
  Save,
  Sparkles,
  AlertCircle,
  Loader2,
  Briefcase,
  Layers,
} from 'lucide-react';

const COMMON_ROLES = [
  'AI/ML Engineer',
  'Full-Stack Engineer',
  'Backend Systems Engineer',
  'Frontend Engineer',
  'Cloud / DevOps Engineer',
  'Data Engineer',
];

const TIMELINE_OPTIONS = [
  '3 Months (Immediate Internship)',
  '6 Months (Pre-Placement)',
  '1 Year (Campus Placements)',
  '2 Years (Long-Term Mastery)',
];

export const CareerGoalsPage: React.FC = () => {
  const { careerGoal, updateCareerGoal, skills } = useStudentTwin();

  const [targetRole, setTargetRole] = useState(careerGoal?.targetRole || 'AI/ML Engineer');
  const [secondaryRolesInput, setSecondaryRolesInput] = useState(
    careerGoal?.secondaryRoles ? careerGoal.secondaryRoles.join(', ') : 'Full-Stack Engineer, Backend Engineer'
  );
  const [companiesInput, setCompaniesInput] = useState(
    careerGoal?.targetCompanies ? careerGoal.targetCompanies.join(', ') : 'Google, Microsoft, Razorpay, Zepto'
  );
  const [targetTimeline, setTargetTimeline] = useState(
    careerGoal?.targetTimeline || '1 Year (Campus Placements)'
  );
  const [targetCompensationINR, setTargetCompensationINR] = useState(
    careerGoal?.targetCompensationINR || '₹18,00,000'
  );
  const [requiredSkillsInput, setRequiredSkillsInput] = useState(
    careerGoal?.requiredSkills ? careerGoal.requiredSkills.join(', ') : 'Python, PyTorch, DSA, Docker, FastAPI'
  );

  const [milestones, setMilestones] = useState<Milestone[]>(
    careerGoal?.milestones || [
      { id: 'm1', title: 'Master Core DSA: 150+ LeetCode problems (Graphs, DP, Trees)', completed: true },
      { id: 'm2', title: 'Architect & Deploy 2 Production Full-Stack / ML Applications', completed: true },
      { id: 'm3', title: 'Complete Cloud or Distributed Systems Certification', completed: false },
      { id: 'm4', title: 'Participate in National Hackathon or Contribute to Open Source', completed: false },
      { id: 'm5', title: 'Complete Mock Technical Interviews and System Design Reviews', completed: false },
    ]
  );
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    if (careerGoal) {
      setTargetRole(careerGoal.targetRole || 'AI/ML Engineer');
      setSecondaryRolesInput(
        careerGoal.secondaryRoles ? careerGoal.secondaryRoles.join(', ') : 'Full-Stack Engineer, Backend Engineer'
      );
      setCompaniesInput(
        careerGoal.targetCompanies ? careerGoal.targetCompanies.join(', ') : 'Google, Microsoft, Razorpay, Zepto'
      );
      setTargetTimeline(careerGoal.targetTimeline || '1 Year (Campus Placements)');
      setTargetCompensationINR(careerGoal.targetCompensationINR || '₹18,00,000');
      setRequiredSkillsInput(
        careerGoal.requiredSkills ? careerGoal.requiredSkills.join(', ') : 'Python, PyTorch, DSA, Docker, FastAPI'
      );
      if (careerGoal.milestones && careerGoal.milestones.length > 0) {
        setMilestones(careerGoal.milestones);
      }
    }
  }, [careerGoal]);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    const newM: Milestone = {
      id: 'm_' + Math.random().toString(36).substring(2, 8),
      title: newMilestoneTitle.trim(),
      completed: false,
    };
    setMilestones([...milestones, newM]);
    setNewMilestoneTitle('');
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMsg(null);

    const targetCompanies = companiesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const secondaryRoles = secondaryRolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const requiredSkills = requiredSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateCareerGoal({
        targetRole: targetRole.trim(),
        secondaryRoles,
        targetCompanies,
        targetTimeline: targetTimeline.trim(),
        targetCompensationINR: targetCompensationINR.trim(),
        requiredSkills,
        milestones,
      });
      setToastMsg({ success: true, text: 'Career goals and roadmap saved in your Student Digital Twin!' });
    } catch (err) {
      setToastMsg({ success: false, text: 'Failed to update career goals.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const milestoneProgress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Career Goals & Target Trajectory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Define primary and secondary engineering roles, target tech employers, salary benchmarks (₹ INR), and milestone roadmaps.
        </p>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-3 shadow-sm ${
            toastMsg.success
              ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          {toastMsg.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Career Goals Form */}
      <form onSubmit={handleSaveGoals} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              1. Target Engineering Roles & Target Companies
            </h2>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Active Goal Set
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Target Role *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Target className="w-4 h-4" />
                </div>
                <input
                  id="goals-role-input"
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. AI/ML Engineer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {COMMON_ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTargetRole(r)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Secondary Target Roles (Comma-separated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="goals-secondary-roles-input"
                  type="text"
                  value={secondaryRolesInput}
                  onChange={(e) => setSecondaryRolesInput(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer, Backend Systems"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Companies (Comma-separated)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  id="goals-companies-input"
                  type="text"
                  value={companiesInput}
                  onChange={(e) => setCompaniesInput(e.target.value)}
                  placeholder="e.g. Google, Atlassian, Razorpay"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Timeline
              </label>
              <select
                id="goals-timeline-select"
                value={targetTimeline}
                onChange={(e) => setTargetTimeline(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMELINE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target CTC (INR ₹)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <input
                  id="goals-ctc-input"
                  type="text"
                  value={targetCompensationINR}
                  onChange={(e) => setTargetCompensationINR(e.target.value)}
                  placeholder="e.g. ₹18,00,000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Required Skills for Target Role (Comma-separated)
            </label>
            <input
              id="goals-required-skills-input"
              type="text"
              value={requiredSkillsInput}
              onChange={(e) => setRequiredSkillsInput(e.target.value)}
              placeholder="e.g. Python, PyTorch, Transformers, DSA, Docker, FastAPI"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Milestone Checklist Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                2. Career Readiness Milestones & Roadmap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Completed {completedCount} of {milestones.length} roadmap milestones ({milestoneProgress}%)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                {milestoneProgress}%
              </span>
              <div className="w-32 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Interactive Milestones List */}
          <div className="space-y-2.5">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  milestone.completed
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div
                  onClick={() => toggleMilestone(milestone.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                      milestone.completed
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {milestone.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      milestone.completed ? 'line-through text-slate-500 dark:text-slate-400' : ''
                    }`}
                  >
                    {milestone.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                  title="Remove Milestone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom milestone input */}
          <div className="pt-2">
            <div className="flex gap-2">
              <input
                id="goals-new-milestone-input"
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Add a custom career milestone (e.g. Build an AI agent system, Pass Cloud exam)..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            id="goals-save-btn"
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Goals...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Career Trajectory</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
