import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  Sparkles,
  User,
  GraduationCap,
  Building,
  Target,
  Code2,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  ShieldCheck,
} from 'lucide-react';

interface FirstTimeOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstTimeOnboardingModal: React.FC<FirstTimeOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { updateProfile, addSkill, updateCareerGoal, uploadDataToCloud, setIsOnboardingOpen } = useStudentTwin();

  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('1st Year');
  const [graduationYear, setGraduationYear] = useState('2028');
  const [careerGoal, setCareerGoal] = useState('Software Engineer');
  const [bio, setBio] = useState('');

  // Skills input
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const suggestedSkills = [
    'Python',
    'JavaScript',
    'React',
    'Data Structures & Algorithms',
    'SQL',
    'Java',
    'C++',
    'Machine Learning',
    'Node.js',
    'Git & GitHub',
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !institution.trim() || !major.trim()) {
      setErrorMsg('Please provide your Full Name, Institution, and Degree Major.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Update Profile
      await updateProfile({
        fullName: fullName.trim(),
        institution: institution.trim(),
        degree: degree.trim(),
        major: major.trim(),
        year,
        graduationYear,
        careerGoal: careerGoal.trim(),
        bio: bio.trim() || `${year} student in ${major} at ${institution} aiming for ${careerGoal}.`,
        email: user?.email || '',
      });

      // 2. Add Selected Skills
      for (const sk of selectedSkills) {
        let category: any = 'Programming';
        if (sk.toLowerCase().includes('algorithm') || sk.toLowerCase().includes('dsa')) category = 'DSA';
        else if (sk.toLowerCase().includes('learn') || sk.toLowerCase().includes('ai') || sk.toLowerCase().includes('ml')) category = 'AI/ML';
        else if (sk.toLowerCase().includes('react') || sk.toLowerCase().includes('web') || sk.toLowerCase().includes('node')) category = 'Web Development';
        else if (sk.toLowerCase().includes('sql') || sk.toLowerCase().includes('db')) category = 'Databases';
        else if (sk.toLowerCase().includes('git') || sk.toLowerCase().includes('docker')) category = 'Tools';

        await addSkill({
          name: sk,
          category,
          proficiency: 'Intermediate',
          score: 75,
          status: 'Active',
          isVerified: false,
          yearsOfExperience: 1,
        });
      }

      // 3. Set Career Goal
      await updateCareerGoal({
        primaryGoal: `${careerGoal.trim()} Placement Target`,
        targetRole: careerGoal.trim(),
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        requiredSkills: selectedSkills.slice(0, 5),
        targetTimeline: `${graduationYear} Placements`,
        targetCompensationINR: '₹12,00,000 / yr',
        industryPreferences: ['Technology', 'Engineering'],
        milestones: [
          { id: 'm1', title: 'Complete Core CS & Programming Foundation', completed: false },
          { id: 'm2', title: 'Build and Deploy Capstone Project', completed: false },
        ],
      });

      // 4. Upload to user's cloud account
      await uploadDataToCloud();

      setIsOnboardingOpen(false);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save setup. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Step {step} of 2 • New User Setup
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            Welcome to Student Digital Twin
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            Let's configure your unique engineering profile from scratch. Your data is isolated strictly to your account.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                1. Academic & Personal Identity
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    University / College *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Stanford University / IIT"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Degree
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                    <option value="B.S.">B.S. (Bachelor of Science)</option>
                    <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                    <option value="M.Tech">M.Tech / M.S.</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Branch / Major *
                  </label>
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="e.g. Computer Science / AI & ML"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Academic Year
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Career Goal
                  </label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. AI/ML Engineer, Full Stack Dev"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (!fullName.trim() || !institution.trim() || !major.trim()) {
                      setErrorMsg('Please complete Full Name, Institution, and Major to continue.');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(2);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Skills</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                2. Initial Skills & Technologies
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select your foundational technical skills or add custom ones. You can refine scores and add projects anytime later.
              </p>

              {/* Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  Suggested Skills (Click to add):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedSkills.map((sk) => {
                    const isSelected = selectedSkills.includes(sk);
                    return (
                      <button
                        key={sk}
                        type="button"
                        onClick={() => (isSelected ? handleRemoveSkill(sk) : handleAddSkill(sk))}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        <span>{sk}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom skill input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder="Add custom skill (e.g., PyTorch, Rust, Docker)..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add
                </button>
              </div>

              {/* Selected List */}
              {selectedSkills.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Your Selected Skills ({selectedSkills.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Back
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating & Syncing to Cloud...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Initialize My Student Twin</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
