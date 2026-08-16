import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  Calendar,
  Globe,
  Github,
  Linkedin,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Download,
} from 'lucide-react';
import { exportStudentTwinPDF } from '../../lib/pdfExport';

export const MyProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, skills, projects, achievements, careerGoal, readinessScore, profileCompletion, updateProfile } = useStudentTwin();

  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [fullName, setFullName] = useState(profile.fullName);
  const [degree, setDegree] = useState(profile.degree || '');
  const [major, setMajor] = useState(profile.major || '');
  const [institution, setInstitution] = useState(profile.institution || '');
  const [year, setYear] = useState(profile.year || '2nd Year');
  const [graduationYear, setGraduationYear] = useState(profile.graduationYear || '2027');
  const [careerGoalText, setCareerGoalText] = useState(profile.careerGoal || 'AI/ML Engineer');
  const [bio, setBio] = useState(profile.bio || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile.portfolioUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Sync state if profile changes
  useEffect(() => {
    setFullName(profile.fullName);
    setDegree(profile.degree || '');
    setMajor(profile.major || '');
    setInstitution(profile.institution || '');
    setYear(profile.year || '2nd Year');
    setGraduationYear(profile.graduationYear || '2027');
    setCareerGoalText(profile.careerGoal || 'AI/ML Engineer');
    setBio(profile.bio || '');
    setGithubUrl(profile.githubUrl || '');
    setLinkedinUrl(profile.linkedinUrl || '');
    setPortfolioUrl(profile.portfolioUrl || '');
  }, [profile]);

  const handleExportPDF = async () => {
    setIsExporting(true);
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
      setToastMsg({ success: false, text: 'Failed to download Profile PDF. Please try again.' });
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    // Revert form state back to profile
    setFullName(profile.fullName);
    setDegree(profile.degree || '');
    setMajor(profile.major || '');
    setInstitution(profile.institution || '');
    setYear(profile.year || '2nd Year');
    setGraduationYear(profile.graduationYear || '2027');
    setCareerGoalText(profile.careerGoal || 'AI/ML Engineer');
    setBio(profile.bio || '');
    setGithubUrl(profile.githubUrl || '');
    setLinkedinUrl(profile.linkedinUrl || '');
    setPortfolioUrl(profile.portfolioUrl || '');
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setToastMsg(null);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        degree: degree.trim(),
        major: major.trim(),
        institution: institution.trim(),
        year: year.trim(),
        graduationYear: graduationYear.trim(),
        careerGoal: careerGoalText.trim(),
        bio: bio.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
      });
      setToastMsg({ success: true, text: 'Profile successfully updated and persisted!' });
      setIsEditing(false);
    } catch (err) {
      setToastMsg({ success: false, text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive digital twin representation of your academic background, career trajectory, and handles.
          </p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2.5">
            <button
              id="profile-download-cv-pdf-btn"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Download Profile PDF'}</span>
            </button>

            <button
              id="profile-edit-mode-btn"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Toast Feedback */}
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

      {/* Profile Completion Bar Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Profile Completion Level
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated dynamically from identity, academic details, and portfolio presence
              </p>
            </div>
          </div>
          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
            {profileCompletion}%
          </span>
        </div>

        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${profileCompletion}%` }}
          />
        </div>
      </div>

      {/* DISPLAY VIEW (When not in edit mode) */}
      {!isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Info Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {(profile.fullName || 'V').charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {profile.fullName || 'Vangala Sricharan'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile.email || user?.email || 'Engineering Student'}
                </p>
              </div>
            </div>

            {/* Core Profile Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Full Name
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.fullName || 'Vangala Sricharan'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  University / Institution
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.institution || 'Marwadi University'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Degree
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.degree || 'B.Tech'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Branch / Major
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.major || 'Computer Science & Engineering (AI/ML)'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Academic Year
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {profile.year || '2nd Year'} (Grad Class {profile.graduationYear || '2027'})
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-1">
                  Primary Career Goal
                </span>
                <p className="text-sm font-extrabold text-blue-900 dark:text-blue-200">
                  {profile.careerGoal || 'AI/ML Engineer'}
                </p>
              </div>
            </div>

            {/* Bio Section */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Technical Bio & Summary
              </span>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {profile.bio || 'Engineering student developing algorithms, machine learning models, and production-ready systems.'}
              </p>
            </div>
          </div>

          {/* External Handles & Meta Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Engineering Links & Handles
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <Github className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">GitHub</p>
                    {profile.githubUrl ? (
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {profile.githubUrl}
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <Linkedin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">LinkedIn</p>
                    {profile.linkedinUrl ? (
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {profile.linkedinUrl}
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Not set</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Portfolio</p>
                    {profile.portfolioUrl ? (
                      <a
                        href={profile.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        {profile.portfolioUrl}
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Not set</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT FORM MODE */
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Edit Student Profile
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modify and save your digital twin identity.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Cancel editing"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                id="edit-fullname-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vangala Sricharan"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                University / Institution *
              </label>
              <input
                id="edit-institution-input"
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Marwadi University"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Degree Program *
              </label>
              <input
                id="edit-degree-input"
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Branch / Major *
              </label>
              <input
                id="edit-major-input"
                type="text"
                required
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science & Engineering (AI/ML)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Academic Year *
              </label>
              <input
                id="edit-year-input"
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2nd Year"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Career Goal *
              </label>
              <input
                id="edit-careergoal-input"
                type="text"
                required
                value={careerGoalText}
                onChange={(e) => setCareerGoalText(e.target.value)}
                placeholder="e.g. AI/ML Engineer"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Graduation Target Year
              </label>
              <input
                id="edit-gradyear-input"
                type="text"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="e.g. 2027"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                GitHub Profile URL
              </label>
              <input
                id="edit-github-input"
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                LinkedIn Profile URL
              </label>
              <input
                id="edit-linkedin-input"
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Portfolio / Website URL
              </label>
              <input
                id="edit-portfolio-input"
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://portfolio.dev"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Technical Bio & Background
            </label>
            <textarea
              id="edit-bio-input"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Summary of engineering focus, algorithmic skills, and machine learning projects..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions: Save & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              id="profile-cancel-btn"
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="profile-save-btn"
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
