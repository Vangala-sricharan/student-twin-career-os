import React, { useState, useMemo, useCallback } from 'react';
import { PublicView, ActiveTab, UserProfile, Skill, Project, Achievement, CareerGoal, ReadinessScore, SubscriptionPlan } from '../types';
import { StudentTwinContext, StudentTwinContextType } from '../context/StudentTwinContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardOverview } from './dashboard/DashboardOverview';
import { MyProfilePage } from './dashboard/MyProfilePage';
import { StudentProfilesPage } from './dashboard/StudentProfilesPage';
import { SkillsPage } from './dashboard/SkillsPage';
import { ProjectsPage } from './dashboard/ProjectsPage';
import { AchievementsPage } from './dashboard/AchievementsPage';
import { CareerGoalsPage } from './dashboard/CareerGoalsPage';
import { ProgressAnalyticsPage } from './dashboard/ProgressAnalyticsPage';
import { AICareerHubPage } from './dashboard/AICareerHubPage';
import { SubscriptionUpgradePage } from './dashboard/SubscriptionUpgradePage';
import { SettingsPage } from './dashboard/SettingsPage';

interface DemoPageProps {
  setCurrentView: (view: PublicView) => void;
}

const INITIAL_DEMO_PROFILE: UserProfile = {
  id: 'demo_vangala_sricharan',
  fullName: 'Vangala Sricharan (Demo)',
  degree: 'B.Tech',
  major: 'Computer Science & Engineering (AI/ML)',
  institution: 'Marwadi University',
  year: '2nd Year',
  graduationYear: '2027',
  careerGoal: 'AI/ML Engineer',
  bio: '2nd Year B.Tech student in Computer Science & Engineering (AI/ML) at Marwadi University. Modeling AI/ML systems, neural networks, and engineering career readiness.',
  githubUrl: 'https://github.com/vangala-sricharan-demo',
  linkedinUrl: 'https://linkedin.com/in/vangala-sricharan-demo',
  portfolioUrl: '',
  email: 'vangalasricharan7@gmail.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const INITIAL_DEMO_SKILLS: Skill[] = [
  {
    id: 'demo_sk_1',
    userId: 'demo_vangala_sricharan',
    name: 'Python & AI Foundations (Demo)',
    category: 'AI/ML',
    proficiency: 'Advanced',
    status: 'Active',
    score: 88,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_sk_2',
    userId: 'demo_vangala_sricharan',
    name: 'PyTorch & Deep Learning (Demo)',
    category: 'AI/ML',
    proficiency: 'Intermediate',
    status: 'Active',
    score: 80,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_sk_3',
    userId: 'demo_vangala_sricharan',
    name: 'Data Structures & Algorithms (Demo)',
    category: 'DSA',
    proficiency: 'Advanced',
    status: 'Verified',
    score: 85,
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_sk_4',
    userId: 'demo_vangala_sricharan',
    name: 'TypeScript & Web Development (Demo)',
    category: 'Web Development',
    proficiency: 'Intermediate',
    status: 'Active',
    score: 75,
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_sk_5',
    userId: 'demo_vangala_sricharan',
    name: 'Docker & Containerization (Demo)',
    category: 'Tools',
    proficiency: 'Intermediate',
    status: 'Learning',
    score: 70,
    isVerified: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_PROJECTS: Project[] = [
  {
    id: 'demo_proj_1',
    userId: 'demo_vangala_sricharan',
    title: 'Neural Vision Classifier (Sample Demo)',
    description: 'End-to-end computer vision inference pipeline with PyTorch, FastAPI backend, and containerized Docker architecture.',
    status: 'Completed',
    difficulty: 'Advanced',
    techStack: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
    githubUrl: 'https://github.com/demo/neural-vision',
    liveUrl: 'https://demo-vision-model.app',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_proj_2',
    userId: 'demo_vangala_sricharan',
    title: 'Distributed Task Queue (Sample Demo)',
    description: 'High-throughput asynchronous background job worker and task dispatcher built with Redis and TypeScript.',
    status: 'In Progress',
    difficulty: 'Intermediate',
    techStack: ['TypeScript', 'Node.js', 'Redis'],
    githubUrl: 'https://github.com/demo/task-queue',
    liveUrl: '',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'demo_ach_1',
    userId: 'demo_vangala_sricharan',
    title: 'AI & Engineering Hackathon Finalist (Sample Demo)',
    category: 'Hackathon & Contest',
    issuer: 'National Tech Consortium',
    issueDate: '2025-11-20',
    date: '2025-11-20',
    credentialUrl: 'https://verify.demo-credential.org',
    description: 'Built prototype automated ML model optimization system.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo_ach_2',
    userId: 'demo_vangala_sricharan',
    title: 'Deep Learning Specialization (Sample Demo)',
    category: 'Certifications',
    issuer: 'DeepLearning.AI',
    issueDate: '2025-08-15',
    date: '2025-08-15',
    credentialUrl: 'https://coursera.org/verify/demo',
    description: 'Mastered neural network architectures, hyperparameter tuning, and sequence models.',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_GOALS: CareerGoal[] = [
  {
    id: 'demo_goal_1',
    userId: 'demo_vangala_sricharan',
    primaryGoal: 'AI/ML Engineer Campus Placement & Industry Readiness',
    targetRole: 'AI/ML Engineer',
    targetCompanies: ['Google', 'Microsoft', 'NVIDIA', 'Amazon'],
    requiredSkills: ['Python', 'PyTorch', 'DSA', 'FastAPI', 'Docker', 'System Design'],
    targetTimeline: '2026-2027 Campus Placements',
    targetCompensationINR: '₹18,00,000 / yr',
    industryPreferences: ['Artificial Intelligence', 'Machine Learning Systems', 'Cloud Tech'],
    milestones: [
      { id: 'm1', title: 'Complete Core CS & Algorithm Mastery (DSA)', completed: true },
      { id: 'm2', title: 'Train & Deploy Production AI / ML Pipeline', completed: true },
      { id: 'm3', title: 'Publish Open Source AI Project / Contribution', completed: false },
      { id: 'm4', title: 'Crack Tier-1 Tech Placement Assessment', completed: false },
    ],
    updatedAt: new Date().toISOString(),
  },
];

export const DemoPage: React.FC<DemoPageProps> = ({ setCurrentView }) => {
  // Navigation inside Demo Mode
  const [demoActiveTab, setDemoActiveTab] = useState<ActiveTab>('dashboard');

  // Multi-student demo state
  const [students, setStudents] = useState<UserProfile[]>([INITIAL_DEMO_PROFILE]);
  const [activeStudentId, setActiveStudentId] = useState<string>(INITIAL_DEMO_PROFILE.id);

  // Isolated Demo State in memory
  const [profile, setProfile] = useState<UserProfile>(INITIAL_DEMO_PROFILE);
  const [skills, setSkills] = useState<Skill[]>(INITIAL_DEMO_SKILLS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_DEMO_PROJECTS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_DEMO_ACHIEVEMENTS);
  const [careerGoalsList, setCareerGoalsList] = useState<CareerGoal[]>(INITIAL_DEMO_GOALS);
  const [activeGoalId, setActiveGoalId] = useState<string>(INITIAL_DEMO_GOALS[0].id);

  const switchActiveStudent = useCallback(async (studentId: string) => {
    setActiveStudentId(studentId);
    const found = students.find((s) => s.id === studentId);
    if (found) {
      setProfile(found);
    }
  }, [students]);

  const addStudent = useCallback(async (newProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newId = 'demo_student_' + Date.now();
    const newProf: UserProfile = {
      ...newProfileData,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setStudents((prev) => [...prev, newProf]);
    setActiveStudentId(newId);
    setProfile(newProf);
    setSkills([]);
    setProjects([]);
    setAchievements([]);
    return newId;
  }, []);

  const updateStudentProfile = useCallback(async (studentId: string, updates: Partial<UserProfile>) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s)));
    if (studentId === activeStudentId) {
      setProfile((prev) => ({ ...prev, ...updates }));
    }
  }, [activeStudentId]);

  const deleteStudent = useCallback(async (studentId: string) => {
    if (students.length <= 1) return;
    const next = students.filter((s) => s.id !== studentId);
    setStudents(next);
    if (activeStudentId === studentId) {
      setActiveStudentId(next[0].id);
      setProfile(next[0]);
    }
  }, [students, activeStudentId]);

  const careerGoal = useMemo(() => {
    return careerGoalsList.find((g) => g.id === activeGoalId) || careerGoalsList[0] || INITIAL_DEMO_GOALS[0];
  }, [careerGoalsList, activeGoalId]);

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    let score = 0;
    if (profile.fullName && profile.fullName.trim() !== '') score += 10;
    if (profile.institution && profile.institution.trim() !== '') score += 10;
    if (profile.degree && profile.degree.trim() !== '') score += 8;
    if (profile.major && profile.major.trim() !== '') score += 8;
    if (profile.year && profile.year.trim() !== '') score += 8;
    if (profile.careerGoal && profile.careerGoal.trim() !== '') score += 8;
    if (profile.bio && profile.bio.trim() !== '') score += 8;
    if (skills.length > 0) score += Math.min(15, skills.length * 3);
    if (projects.length > 0) score += Math.min(15, projects.length * 5);
    if (achievements.length > 0) score += Math.min(10, achievements.length * 5);
    return Math.min(100, Math.round(score));
  }, [profile, skills, projects, achievements]);

  // Dynamic Readiness Score calculation matching schema
  const readinessScore = useMemo<ReadinessScore>(() => {
    const progSkills = skills.filter((s) => s.category === 'Programming');
    const dsaSkills = skills.filter((s) => s.category === 'DSA');
    const aiMlSkills = skills.filter((s) => s.category === 'AI/ML');
    const softSkills = skills.filter((s) => s.category === 'Soft Skills');

    const computeSkillCatScore = (catSkills: Skill[]) => {
      if (catSkills.length === 0) return 0;
      let totalPts = 0;
      catSkills.forEach((s) => {
        const profWeight = s.proficiency === 'Expert' ? 35 : s.proficiency === 'Advanced' ? 28 : s.proficiency === 'Intermediate' ? 20 : 12;
        const verifiedBonus = s.isVerified || s.status === 'Verified' ? 10 : 0;
        const scoreWeight = (s.score || 70) * 0.2;
        totalPts += profWeight + verifiedBonus + scoreWeight;
      });
      return Math.min(100, Math.round(totalPts));
    };

    const programmingScore = computeSkillCatScore(progSkills);
    const dsaScore = computeSkillCatScore(dsaSkills);
    const aiMlScore = computeSkillCatScore(aiMlSkills);

    let rawProjScore = 0;
    projects.forEach((p) => {
      let pts = p.status === 'Completed' ? 25 : p.status === 'In Progress' ? 15 : 10;
      if (p.githubUrl) pts += 10;
      if (p.liveUrl) pts += 10;
      if (p.difficulty === 'Advanced') pts += 10;
      else if (p.difficulty === 'Intermediate') pts += 5;
      rawProjScore += pts;
    });
    const projectsScore = Math.min(100, rawProjScore);

    const softScore = computeSkillCatScore(softSkills);
    const leadershipAchievements = achievements.filter((a) => a.category === 'Leadership' || a.category === 'Hackathon & Contest').length * 20;
    const communicationScore = Math.min(100, Math.round(softScore * 0.6 + leadershipAchievements * 0.4));

    let rawCareerPrep = 0;
    if (careerGoal.targetRole) rawCareerPrep += 20;
    if (careerGoal.targetCompanies.length > 0) rawCareerPrep += Math.min(20, careerGoal.targetCompanies.length * 5);
    if ((careerGoal.requiredSkills || []).length > 0) rawCareerPrep += Math.min(20, (careerGoal.requiredSkills || []).length * 4);
    const completedMilestones = careerGoal.milestones.filter((m) => m.completed).length;
    const totalMilestones = careerGoal.milestones.length || 1;
    rawCareerPrep += Math.round((completedMilestones / totalMilestones) * 40);
    const careerPrepScore = Math.min(100, rawCareerPrep);

    const skillsCoverage = Math.min(100, skills.length * 15);
    const projectPortfolio = projectsScore;
    const industryAlignment = careerPrepScore;
    const verifications = Math.min(
      100,
      achievements.length * 20 + skills.filter((s) => s.isVerified || s.status === 'Verified').length * 15
    );

    const overall = Math.min(
      100,
      Math.round(
        (skillsCoverage * 0.3) +
        (projectPortfolio * 0.3) +
        (industryAlignment * 0.2) +
        (verifications * 0.1) +
        (profileCompletion * 0.1)
      )
    );

    let level: ReadinessScore['level'] = 'Early Stage';
    if (overall >= 80) level = 'Industry Elite';
    else if (overall >= 60) level = 'Career Ready';
    else if (overall >= 30) level = 'Developing';

    return {
      overall,
      breakdown: {
        skillsCoverage,
        projectPortfolio,
        industryAlignment,
        verifications,
      },
      categories: {
        programming: programmingScore,
        dsa: dsaScore,
        aiMl: aiMlScore,
        projects: projectsScore,
        communication: communicationScore,
        careerPrep: careerPrepScore,
      },
      level,
    };
  }, [skills, projects, achievements, careerGoal, profileCompletion]);

  // Handlers for full interactive Demo CRUD actions
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addSkill = useCallback(async (skill: Omit<Skill, 'id' | 'userId' | 'createdAt'>) => {
    const newSkill: Skill = {
      ...skill,
      id: `demo_sk_${Date.now()}`,
      userId: activeStudentId,
      createdAt: new Date().toISOString(),
    };
    setSkills((prev) => [newSkill, ...prev]);
  }, [activeStudentId]);

  const updateSkill = useCallback(async (id: string, updates: Partial<Skill>) => {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteSkill = useCallback(async (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addProject = useCallback(async (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => {
    const newProj: Project = {
      ...project,
      id: `demo_proj_${Date.now()}`,
      userId: activeStudentId,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
  }, [activeStudentId]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addAchievement = useCallback(async (achievement: Omit<Achievement, 'id' | 'userId' | 'createdAt'>) => {
    const newAch: Achievement = {
      ...achievement,
      id: `demo_ach_${Date.now()}`,
      userId: activeStudentId,
      createdAt: new Date().toISOString(),
    };
    setAchievements((prev) => [newAch, ...prev]);
  }, [activeStudentId]);

  const updateAchievement = useCallback(async (id: string, updates: Partial<Achievement>) => {
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const deleteAchievement = useCallback(async (id: string) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateCareerGoal = useCallback(async (goalUpdates: Partial<Omit<CareerGoal, 'id' | 'userId' | 'updatedAt'>>) => {
    setCareerGoalsList((prev) =>
      prev.map((g) =>
        g.id === activeGoalId
          ? { ...g, ...goalUpdates, updatedAt: new Date().toISOString() }
          : g
      )
    );
  }, [activeGoalId]);

  const addCareerGoal = useCallback(async (goal: Omit<CareerGoal, 'id' | 'userId' | 'updatedAt'>) => {
    const newGoal: CareerGoal = {
      ...goal,
      id: `demo_goal_${Date.now()}`,
      userId: activeStudentId,
      updatedAt: new Date().toISOString(),
    };
    setCareerGoalsList((prev) => [...prev, newGoal]);
    setActiveGoalId(newGoal.id);
  }, [activeStudentId]);

  const deleteCareerGoal = useCallback(async (id: string) => {
    setCareerGoalsList((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      if (filtered.length === 0) {
        return INITIAL_DEMO_GOALS;
      }
      return filtered;
    });
  }, []);

  const setActiveCareerGoal = useCallback(async (id: string) => {
    setActiveGoalId(id);
  }, []);

  const clearAllUserData = useCallback(async () => {
    setProfile(INITIAL_DEMO_PROFILE);
    setSkills(INITIAL_DEMO_SKILLS);
    setProjects(INITIAL_DEMO_PROJECTS);
    setAchievements(INITIAL_DEMO_ACHIEVEMENTS);
    setCareerGoalsList(INITIAL_DEMO_GOALS);
    setActiveGoalId(INITIAL_DEMO_GOALS[0].id);
  }, []);

  // Exit Demo handler: resets demo state and returns cleanly to landing page
  const handleExitDemo = () => {
    clearAllUserData();
    setCurrentView('landing');
  };

  const demoContextValue: StudentTwinContextType = {
    profile,
    skills,
    projects,
    achievements,
    careerGoal,
    careerGoalsList,
    readinessScore,
    profileCompletion,
    isLoadingData: false,
    students,
    activeStudentId,
    switchActiveStudent,
    addStudent,
    updateStudentProfile,
    deleteStudent,
    updateProfile,
    addSkill,
    updateSkill,
    deleteSkill,
    addProject,
    updateProject,
    deleteProject,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    updateCareerGoal,
    addCareerGoal,
    deleteCareerGoal,
    setActiveCareerGoal,
    clearAllUserData,
    cloudSyncStatus: {
      isSyncing: false,
      lastSyncedAt: null,
      error: null,
    },
    uploadDataToCloud: async () => ({ success: true, message: 'Demo data does not require cloud upload' }),
    plan: 'free',
    upgradePlan: async (newPlan: SubscriptionPlan) => newPlan,
    isOnboardingOpen: false,
    setIsOnboardingOpen: () => {},
  };

  return (
    <StudentTwinContext.Provider value={demoContextValue}>
      <DashboardLayout
        activeTab={demoActiveTab}
        setActiveTab={setDemoActiveTab}
        isDemo={true}
        onExitDemo={handleExitDemo}
      >
        {demoActiveTab === 'dashboard' && <DashboardOverview setActiveTab={setDemoActiveTab} />}
        {demoActiveTab === 'profile' && <MyProfilePage />}
        {demoActiveTab === 'student-profiles' && <StudentProfilesPage />}
        {demoActiveTab === 'skills' && <SkillsPage />}
        {demoActiveTab === 'projects' && <ProjectsPage />}
        {demoActiveTab === 'achievements' && <AchievementsPage />}
        {demoActiveTab === 'goals' && <CareerGoalsPage />}
        {demoActiveTab === 'analytics' && <ProgressAnalyticsPage setActiveTab={setDemoActiveTab} />}
        
        {/* AI Career OS in Demo */}
        {demoActiveTab === 'ai-assistant' && <AICareerHubPage initialTool="assistant" />}
        {demoActiveTab === 'ai-resume-builder' && <AICareerHubPage initialTool="resume-builder" />}
        {demoActiveTab === 'ai-resume-analyzer' && <AICareerHubPage initialTool="resume" />}
        {demoActiveTab === 'ai-syllabus-analyzer' && <AICareerHubPage initialTool="syllabus" />}
        {demoActiveTab === 'ai-project-analyzer' && <AICareerHubPage initialTool="project" />}
        {demoActiveTab === 'ai-career-roadmap' && <AICareerHubPage initialTool="roadmap" />}
        
        {/* Career & Readiness in Demo */}
        {demoActiveTab === 'internship-readiness' && <AICareerHubPage initialTool="internship" />}
        {demoActiveTab === 'career-simulator' && <AICareerHubPage initialTool="simulator" />}
        {demoActiveTab === 'github-readiness' && <AICareerHubPage initialTool="github" />}
        
        {/* AI Hub */}
        {demoActiveTab === 'ai-hub' && <AICareerHubPage />}
        
        {/* System in Demo */}
        {demoActiveTab === 'subscription' && <SubscriptionUpgradePage />}
        {demoActiveTab === 'settings' && <SettingsPage />}
      </DashboardLayout>
    </StudentTwinContext.Provider>
  );
};
