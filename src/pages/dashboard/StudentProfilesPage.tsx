import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { UserProfile } from '../../types';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Edit2,
  Trash2,
  Search,
  Building2,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Sparkles,
  Download,
  AlertTriangle,
  X,
  Plus,
} from 'lucide-react';
import { exportStudentTwinPDF } from '../../lib/pdfExport';

export const StudentProfilesPage: React.FC = () => {
  const {
    students,
    activeStudentId,
    switchActiveStudent,
    addStudent,
    updateStudentProfile,
    deleteStudent,
    profile: activeProfile,
    skills,
    projects,
    achievements,
    careerGoal,
    readinessScore,
  } = useStudentTwin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<UserProfile | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for adding/editing student
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    institution: '',
    degree: 'B.Tech',
    major: '',
    year: '2nd Year',
    graduationYear: '2027',
    careerGoal: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const openAddModal = () => {
    setFormData({
      fullName: '',
      email: '',
      institution: 'Marwadi University',
      degree: 'B.Tech',
      major: 'Computer Science & Engineering',
      year: '2nd Year',
      graduationYear: '2027',
      careerGoal: 'AI/ML Engineer',
      bio: '',
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: UserProfile) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName || '',
      email: student.email || '',
      institution: student.institution || '',
      degree: student.degree || 'B.Tech',
      major: student.major || '',
      year: student.year || '2nd Year',
      graduationYear: student.graduationYear || '2027',
      careerGoal: student.careerGoal || '',
      bio: student.bio || '',
      githubUrl: student.githubUrl || '',
      linkedinUrl: student.linkedinUrl || '',
      portfolioUrl: student.portfolioUrl || '',
    });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showFeedback('error', 'Full name is required.');
      return;
    }

    try {
      if (editingStudent) {
        await updateStudentProfile(editingStudent.id, {
          ...formData,
        });
        showFeedback('success', `Updated profile for ${formData.fullName}`);
        setEditingStudent(null);
      } else {
        const newId = await addStudent({
          ...formData,
        });
        showFeedback('success', `Added new student profile: ${formData.fullName}`);
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      showFeedback('error', err?.message || 'Failed to save student profile.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      await deleteStudent(studentToDelete.id);
      showFeedback('success', `Deleted profile for ${studentToDelete.fullName}`);
      setStudentToDelete(null);
    } catch (err: any) {
      showFeedback('error', err?.message || 'Could not delete profile.');
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportStudentTwinPDF({
        profile: activeProfile,
        skills,
        projects,
        achievements,
        careerGoal,
        readinessScore,
      });
      showFeedback('success', 'Official Student Twin PDF exported successfully.');
    } catch (err) {
      showFeedback('error', 'Failed to generate PDF export.');
    } finally {
      setIsExporting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      s.fullName.toLowerCase().includes(q) ||
      (s.institution && s.institution.toLowerCase().includes(q)) ||
      (s.major && s.major.toLowerCase().includes(q)) ||
      (s.careerGoal && s.careerGoal.toLowerCase().includes(q));

    const matchesYear = selectedYearFilter === 'All' || s.year === selectedYearFilter;
    return matchesQuery && matchesYear;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student Profiles Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
              {students.length} {students.length === 1 ? 'Profile' : 'Profiles'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage multiple student digital twins with strict, isolated records for skills, projects, and career intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="export-active-student-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-sm hover:border-blue-400 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{isExporting ? 'Generating PDF...' : 'Export Active Twin PDF'}</span>
          </button>

          <button
            id="add-new-student-btn"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Currently Active Profile Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-blue-700 font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-white/40">
              {activeProfile.fullName?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 backdrop-blur-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Currently Active Profile
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/20">
                  {activeProfile.year || '2nd Year'} • {activeProfile.degree || 'B.Tech'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">
                {activeProfile.fullName || 'Vangala Sricharan'}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{activeProfile.institution || 'Marwadi University'}</span>
                <span>•</span>
                <span>{activeProfile.major || 'Computer Science & Engineering (AI/ML)'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center min-w-[90px]">
              <div className="text-xl font-black">{readinessScore.overall}%</div>
              <div className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Readiness</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center min-w-[90px]">
              <div className="text-xl font-black">{skills.length}</div>
              <div className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Skills</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center min-w-[90px]">
              <div className="text-xl font-black">{projects.length}</div>
              <div className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Projects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Year Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-student-profiles-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, university, goal..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {['All', '1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'].map((yr) => (
            <button
              key={yr}
              onClick={() => setSelectedYearFilter(yr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedYearFilter === yr
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Student Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const isActive = student.id === activeStudentId;
          return (
            <div
              key={student.id}
              className={`p-5 rounded-3xl transition-all border flex flex-col justify-between ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-600/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div>
                {/* Header with status badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                    {student.fullName?.charAt(0) || 'S'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Name & Academic info */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {student.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 line-clamp-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>{student.institution || 'University Not Specified'}</span>
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-semibold">{student.degree}</span>
                    <span>•</span>
                    <span className="text-slate-500 dark:text-slate-400">{student.year || '2nd Year'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                      Goal: {student.careerGoal || 'Software Engineer'}
                    </span>
                  </div>
                </div>

                {student.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 italic">
                    "{student.bio}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                {isActive ? (
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Loaded in Workspace</span>
                  </div>
                ) : (
                  <button
                    onClick={() => switchActiveStudent(student.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-600 text-blue-600 dark:text-blue-400 hover:text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Activate Profile
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(student)}
                    title="Edit Student Info"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {students.length > 1 && (
                    <button
                      onClick={() => setStudentToDelete(student)}
                      title="Delete Profile"
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Student Profiles Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            No student matches your current search criteria. Try modifying your filter or create a new student profile.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {editingStudent ? 'Edit Student Profile' : 'Add New Student'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {editingStudent ? 'Update student record details' : 'Create an isolated digital twin profile for a student'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Vangala Sricharan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@marwadiuniversity.ac.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. Marwadi University"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="e.g. B.Tech, M.Tech, BCA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Major / Branch / Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering (AI/ML)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Career Goal / Target Role
                  </label>
                  <input
                    type="text"
                    value={formData.careerGoal}
                    onChange={(e) => setFormData({ ...formData, careerGoal: e.target.value })}
                    placeholder="e.g. AI/ML Engineer, Full Stack Developer, Data Scientist"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profile Bio / Professional Summary
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief background and career aspirations..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    GitHub Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStudent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Delete Student Profile?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{studentToDelete.fullName}</strong>? All their isolated skills, projects, achievements, and career intelligence records will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
