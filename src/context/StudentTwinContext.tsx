import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  UserProfile,
  Skill,
  Project,
  Achievement,
  CareerGoal,
  ReadinessScore,
  SubscriptionPlan,
  CloudSyncStatus,
} from '../types';
import { cloudStore, UserCloudPayload } from '../lib/cloudStore';

// Initial demo profile (kept strictly for Demo Mode reference)
export const DEFAULT_CREATOR_PROFILE: UserProfile = {
  id: 'student_vangala_sricharan',
  email: 'vangalasricharan7@gmail.com',
  fullName: 'Vangala Sricharan',
  degree: 'B.Tech',
  major: 'Computer Science & Engineering (AI/ML)',
  institution: 'Marwadi University',
  year: '2nd Year',
  graduationYear: '2027',
  careerGoal: 'AI/ML Engineer',
  bio: 'Engineering student at Marwadi University specializing in AI/ML, distributed systems, and intelligent software engineering.',
  githubUrl: 'https://github.com/sricharan-ai',
  linkedinUrl: 'https://linkedin.com/in/sricharan-vangala',
  portfolioUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_INITIAL_SKILLS: Skill[] = [
  {
    id: 'sk_vs_1',
    userId: 'student_vangala_sricharan',
    name: 'Python',
    category: 'Programming',
    proficiency: 'Advanced',
    score: 88,
    status: 'Verified',
    isVerified: true,
    yearsOfExperience: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sk_vs_2',
    userId: 'student_vangala_sricharan',
    name: 'PyTorch & Deep Learning',
    category: 'AI/ML',
    proficiency: 'Advanced',
    score: 85,
    status: 'Verified',
    isVerified: true,
    yearsOfExperience: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sk_vs_3',
    userId: 'student_vangala_sricharan',
    name: 'Data Structures & Algorithms',
    category: 'DSA',
    proficiency: 'Intermediate',
    score: 78,
    status: 'Verified',
    isVerified: true,
    yearsOfExperience: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sk_vs_4',
    userId: 'student_vangala_sricharan',
    name: 'LLM Prompt Engineering & LangChain',
    category: 'AI/ML',
    proficiency: 'Advanced',
    score: 82,
    status: 'Verified',
    isVerified: true,
    yearsOfExperience: 1,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_vs_1',
    userId: 'student_vangala_sricharan',
    title: 'Student Digital Twin & Career Readiness OS',
    description: 'Autonomous career readiness modeling engine assessing engineering skills, project depth, roadmap milestones, and ATS placement gaps using modern TypeScript and cloud synchronization.',
    techStack: ['TypeScript', 'React', 'Tailwind CSS', 'Supabase', 'Node.js'],
    githubUrl: 'https://github.com/vangala-sricharan/student-digital-twin',
    liveUrl: 'https://student-twin.app.preview',
    role: 'Lead Full-Stack Architect',
    status: 'Completed',
    difficulty: 'Production',
    year: '2025',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj_vs_2',
    userId: 'student_vangala_sricharan',
    title: 'Restaurant Management & Kitchen Order Routing System',
    description: 'Full-stack point-of-sale system with table reservation management, automated kitchen ticket dispatch, inventory tracking, and sales analytics.',
    techStack: ['Node.js', 'Express', 'PostgreSQL', 'React', 'Socket.io'],
    githubUrl: 'https://github.com/vangala-sricharan/restaurant-pos-manager',
    liveUrl: '',
    role: 'Backend & Database Developer',
    status: 'Completed',
    difficulty: 'Intermediate',
    year: '2024',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'proj_vs_3',
    userId: 'student_vangala_sricharan',
    title: 'AI Travel Planner & Dynamic Itinerary Optimizer',
    description: 'Smart vacation planning application leveraging LLM agents, geolocation APIs, and constraint satisfaction algorithms for personalized budget-aware travel schedules.',
    techStack: ['Python', 'FastAPI', 'Gemini AI', 'Next.js', 'Redis'],
    githubUrl: 'https://github.com/vangala-sricharan/ai-travel-planner',
    liveUrl: 'https://travel-ai-planner.preview.app',
    role: 'AI Engineer & Frontend Developer',
    status: 'In Progress',
    difficulty: 'Advanced',
    year: '2025',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  },
];


export const DEFAULT_INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_vs_1',
    userId: 'student_vangala_sricharan',
    title: 'Smart India Hackathon Finalist',
    issuer: 'Ministry of Education & AICTE',
    category: 'Hackathon & Contest',
    issueDate: '2025-01-15',
    date: '2025-01-15',
    credentialUrl: 'https://sih.gov.in/verify/2025',
    description: 'Selected among top national finalists in AI & Robotics track for autonomous defect inspection.',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_INITIAL_GOAL: CareerGoal = {
  id: 'goal_vs_primary',
  userId: 'student_vangala_sricharan',
  primaryGoal: 'Secure Tier-1 Tech Placement as AI/ML Engineer',
  targetRole: 'AI/ML Engineer',
  targetCompanies: ['Google', 'Microsoft', 'NVIDIA', 'OpenAI', 'Amazon'],
  requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'LLMs', 'Docker', 'FastAPI'],
  targetTimeline: '2026-2027 Campus Placements',
  targetCompensationINR: '₹18,00,000 / yr',
  industryPreferences: ['Artificial Intelligence', 'Cloud Infrastructure', 'Deep Learning'],
  milestones: [
    { id: 'm1', title: 'Master Core DSA & Solve 150+ LeetCode Problems', completed: true },
    { id: 'm2', title: 'Train & Deploy Production LLM / Computer Vision Pipeline', completed: true },
  ],
  updatedAt: new Date().toISOString(),
};

// Factory for a completely empty profile for new users
export const createEmptyProfile = (userId: string, email = '', fullName = ''): UserProfile => ({
  id: 'student_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36),
  email: email,
  fullName: fullName,
  degree: '',
  major: '',
  institution: '',
  year: '',
  graduationYear: '',
  careerGoal: '',
  bio: '',
  githubUrl: '',
  linkedinUrl: '',
  portfolioUrl: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export interface StudentTwinContextType {
  // Active student data
  profile: UserProfile;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  careerGoal: CareerGoal;
  careerGoalsList: CareerGoal[];
  readinessScore: ReadinessScore;
  profileCompletion: number;
  isLoadingData: boolean;

  // Cloud Sync & Persistence
  cloudSyncStatus: CloudSyncStatus;
  uploadDataToCloud: () => Promise<{ success: boolean; error?: string; timestamp?: string }>;

  // Subscription Plan
  plan: SubscriptionPlan;
  upgradePlan: (newPlan: SubscriptionPlan, billingPeriod?: 'monthly' | 'annual', price?: number) => Promise<SubscriptionPlan>;

  // Onboarding
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;

  // Multi-student management
  students: UserProfile[];
  activeStudentId: string;
  switchActiveStudent: (studentId: string) => Promise<void>;
  addStudent: (newProfile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStudentProfile: (studentId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;

  // Active student operations
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  addSkill: (skill: Omit<Skill, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSkill: (id: string, updates: Partial<Skill>) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addAchievement: (achievement: Omit<Achievement, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateAchievement: (id: string, updates: Partial<Achievement>) => Promise<void>;
  deleteAchievement: (id: string) => Promise<void>;
  updateCareerGoal: (goal: Partial<Omit<CareerGoal, 'id' | 'userId' | 'updatedAt'>>) => Promise<void>;
  addCareerGoal: (goal: Omit<CareerGoal, 'id' | 'userId' | 'updatedAt'>) => Promise<void>;
  deleteCareerGoal: (id: string) => Promise<void>;
  setActiveCareerGoal: (id: string) => Promise<void>;
  clearAllUserData: () => Promise<void>;
}

export const StudentTwinContext = createContext<StudentTwinContextType | undefined>(undefined);

export const StudentTwinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  // Multi-student list state
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('');

  // Active student isolated entities
  const [profile, setProfile] = useState<UserProfile>(() => createEmptyProfile(userId, user?.email || '', user?.user_metadata?.full_name || ''));
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [careerGoalsList, setCareerGoalsList] = useState<CareerGoal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string>('');
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Subscription Plan (Defaults to 'free' for all new authenticated users)
  const [plan, setPlan] = useState<SubscriptionPlan>('free');

  // Cloud Sync Status
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    lastSyncedAt: null,
    isSyncing: false,
    error: null,
  });

  // Onboarding Modal Trigger
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // Key generators scoped strictly to userId + studentId
  const getStudentKeys = useCallback((uid: string, sId: string) => ({
    studentsList: `sdt_students_list_${uid}`,
    activeStudentId: `sdt_active_student_id_${uid}`,
    profile: `sdt_profile_${uid}_${sId}`,
    skills: `sdt_skills_${uid}_${sId}`,
    projects: `sdt_projects_${uid}_${sId}`,
    achievements: `sdt_achievements_${uid}_${sId}`,
    goals: `sdt_goals_${uid}_${sId}`,
    activeGoalId: `sdt_active_goal_id_${uid}_${sId}`,
  }), []);

  // Helper to load isolated data for a specific student ID
  const loadStudentData = useCallback((uid: string, sId: string, currentStudents: UserProfile[]) => {
    const keys = getStudentKeys(uid, sId);

    // 1. Profile
    let studentProf = currentStudents.find((s) => s.id === sId);
    const rawProf = localStorage.getItem(keys.profile);
    if (rawProf) {
      try {
        studentProf = JSON.parse(rawProf);
      } catch {}
    }
    if (!studentProf) {
      studentProf = createEmptyProfile(uid, user?.email || '', user?.user_metadata?.full_name || '');
      studentProf.id = sId;
    }
    setProfile(studentProf);

    // 2. Skills
    const rawSkills = localStorage.getItem(keys.skills);
    if (rawSkills) {
      try {
        setSkills(JSON.parse(rawSkills));
      } catch {
        setSkills([]);
      }
    } else {
      setSkills([]);
    }

    // 3. Projects
    const rawProjects = localStorage.getItem(keys.projects);
    if (rawProjects) {
      try {
        setProjects(JSON.parse(rawProjects));
      } catch {
        setProjects([]);
      }
    } else {
      setProjects([]);
    }

    // 4. Achievements
    const rawAchievements = localStorage.getItem(keys.achievements);
    if (rawAchievements) {
      try {
        setAchievements(JSON.parse(rawAchievements));
      } catch {
        setAchievements([]);
      }
    } else {
      setAchievements([]);
    }

    // 5. Goals
    const rawGoals = localStorage.getItem(keys.goals);
    if (rawGoals) {
      try {
        const parsed = JSON.parse(rawGoals);
        const list = Array.isArray(parsed) ? parsed : [parsed];
        setCareerGoalsList(list);
        const rawActiveGoal = localStorage.getItem(keys.activeGoalId);
        setActiveGoalId(rawActiveGoal && list.some((g) => g.id === rawActiveGoal) ? rawActiveGoal : list[0]?.id || '');
      } catch {
        setCareerGoalsList([]);
      }
    } else {
      const initialGoal: CareerGoal = {
        id: 'goal_' + sId + '_primary',
        userId: sId,
        primaryGoal: studentProf.careerGoal ? `${studentProf.careerGoal} Target` : 'Career Target',
        targetRole: studentProf.careerGoal || 'Software Engineer',
        targetCompanies: [],
        requiredSkills: [],
        targetTimeline: studentProf.graduationYear ? `${studentProf.graduationYear} Placements` : 'Placements',
        targetCompensationINR: '₹12,00,000 / yr',
        industryPreferences: ['Technology'],
        milestones: [
          { id: 'm1', title: 'Complete Core CS & Programming Foundation', completed: false },
          { id: 'm2', title: 'Build and Deploy Capstone Project', completed: false },
        ],
        updatedAt: new Date().toISOString(),
      };
      setCareerGoalsList([initialGoal]);
      setActiveGoalId(initialGoal.id);
      localStorage.setItem(keys.goals, JSON.stringify([initialGoal]));
    }
  }, [getStudentKeys, user]);

  // Initial Boot / Load user data whenever authenticated user changes
  useEffect(() => {
    let isMounted = true;

    async function initializeUserData() {
      setIsLoadingData(true);
      const keys = getStudentKeys(userId, 'default');

      try {
        // 1. Fetch user subscription plan from authoritative cloud / cache (defaults to 'free' for new users)
        const userPlan = await cloudStore.getUserPlan(userId);
        if (isMounted) setPlan(userPlan);

        // 2. Check cloud backup / storage first
        let cloudData: UserCloudPayload | null = null;
        if (userId !== 'guest_user') {
          cloudData = await cloudStore.getUserData(userId);
        }

        // 3. Load Students Registry
        let loadedStudents: UserProfile[] = [];
        const rawStudents = localStorage.getItem(keys.studentsList);
        if (rawStudents) {
          try {
            loadedStudents = JSON.parse(rawStudents);
          } catch {}
        }

        // If cloud data exists and local registry was empty, restore from cloud
        if ((!loadedStudents || loadedStudents.length === 0) && cloudData) {
          loadedStudents = cloudData.students && cloudData.students.length > 0
            ? cloudData.students
            : [cloudData.profile];
          if (cloudData.lastUploadedAt) {
            setCloudSyncStatus((prev) => ({ ...prev, lastSyncedAt: cloudData?.lastUploadedAt || null }));
          }
        }

        // 4. If NEW USER with NO DATA: start with EMPTY profile and trigger onboarding
        if (!loadedStudents || loadedStudents.length === 0) {
          const emptyProf = createEmptyProfile(
            userId,
            user?.email || '',
            user?.user_metadata?.full_name || ''
          );
          loadedStudents = [emptyProf];
          localStorage.setItem(keys.studentsList, JSON.stringify(loadedStudents));
          localStorage.setItem(getStudentKeys(userId, emptyProf.id).profile, JSON.stringify(emptyProf));
          
          if (userId !== 'guest_user' && !cloudStore.hasCompletedOnboarding(userId)) {
            setIsOnboardingOpen(true);
          }
        }

        if (!isMounted) return;
        setStudents(loadedStudents);

        // 5. Determine active student ID
        let targetActiveId = loadedStudents[0].id;
        const savedActiveId = localStorage.getItem(keys.activeStudentId);
        if (savedActiveId && loadedStudents.some((s) => s.id === savedActiveId)) {
          targetActiveId = savedActiveId;
        } else if (cloudData?.activeStudentId && loadedStudents.some((s) => s.id === cloudData?.activeStudentId)) {
          targetActiveId = cloudData.activeStudentId;
        }

        setActiveStudentId(targetActiveId);
        localStorage.setItem(keys.activeStudentId, targetActiveId);

        // 6. If cloud data provided skills/projects for active student, write them to local cache
        if (cloudData && targetActiveId === (cloudData.profile?.id || cloudData.activeStudentId)) {
          const sKeys = getStudentKeys(userId, targetActiveId);
          if (cloudData.skills) localStorage.setItem(sKeys.skills, JSON.stringify(cloudData.skills));
          if (cloudData.projects) localStorage.setItem(sKeys.projects, JSON.stringify(cloudData.projects));
          if (cloudData.achievements) localStorage.setItem(sKeys.achievements, JSON.stringify(cloudData.achievements));
          if (cloudData.careerGoalsList) localStorage.setItem(sKeys.goals, JSON.stringify(cloudData.careerGoalsList));
        }

        // 7. Load active student data
        loadStudentData(userId, targetActiveId, loadedStudents);
      } catch (e) {
        console.error('Error loading student twin data:', e);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    initializeUserData();

    return () => {
      isMounted = false;
    };
  }, [userId, user, getStudentKeys, loadStudentData]);

  // Upload Data to Cloud Function
  const uploadDataToCloud = useCallback(async () => {
    if (!userId || userId === 'guest_user') {
      return { success: false, error: 'Please log in to upload your data to the cloud.' };
    }

    setCloudSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const payload: Omit<UserCloudPayload, 'lastUploadedAt'> = {
        userId,
        profile,
        skills,
        projects,
        achievements,
        careerGoalsList,
        activeGoalId,
        students,
        activeStudentId,
        plan,
        hasCompletedOnboarding: true,
      };

      const result = await cloudStore.uploadUserData(userId, payload);

      if (result.success && result.timestamp) {
        setCloudSyncStatus({
          isSyncing: false,
          error: null,
          lastSyncedAt: result.timestamp,
        });
        cloudStore.setOnboardingCompleted(userId, true);
        return { success: true, timestamp: result.timestamp };
      } else {
        setCloudSyncStatus({
          isSyncing: false,
          error: result.error || 'Upload failed.',
          lastSyncedAt: null,
        });
        return { success: false, error: result.error || 'Upload failed.' };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown upload error.';
      setCloudSyncStatus({
        isSyncing: false,
        error: errorMsg,
        lastSyncedAt: null,
      });
      return { success: false, error: errorMsg };
    }
  }, [
    userId,
    profile,
    skills,
    projects,
    achievements,
    careerGoalsList,
    activeGoalId,
    students,
    activeStudentId,
    plan,
  ]);

  // Upgrade Plan
  const upgradePlan = useCallback(async (
    newPlan: SubscriptionPlan,
    billingPeriod?: 'monthly' | 'annual',
    price?: number
  ): Promise<SubscriptionPlan> => {
    const resolvedPeriod = billingPeriod || (newPlan === 'pro_monthly' ? 'monthly' : 'annual');
    const resolvedPrice = price ?? (newPlan === 'pro_monthly' ? 299 : newPlan === 'pro_annual' ? 1499 : 0);
    
    // 1. Authoritative persistence in Supabase & cloudStore (throws if fails)
    await cloudStore.setUserPlan(userId, newPlan, resolvedPeriod, resolvedPrice);
    
    // 2. Re-fetch and verify authoritative plan
    const verifiedPlan = await cloudStore.getUserPlan(userId);
    
    // 3. Update React state with verified plan
    setPlan(verifiedPlan);
    return verifiedPlan;
  }, [userId]);

  // Switch active student
  const switchActiveStudent = useCallback(async (studentId: string) => {
    if (studentId === activeStudentId) return;
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    setIsLoadingData(true);
    setActiveStudentId(studentId);
    try {
      localStorage.setItem(getStudentKeys(userId, studentId).activeStudentId, studentId);
    } catch {}

    loadStudentData(userId, studentId, students);
    setIsLoadingData(false);
  }, [activeStudentId, students, userId, getStudentKeys, loadStudentData]);

  // Add new student profile
  const addStudent = useCallback(async (newProfileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const newStudentId = 'student_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newProfile: UserProfile = {
      ...newProfileData,
      id: newStudentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextStudents = [...students, newProfile];
    setStudents(nextStudents);

    const keys = getStudentKeys(userId, newStudentId);
    try {
      localStorage.setItem(keys.studentsList, JSON.stringify(nextStudents));
      localStorage.setItem(keys.profile, JSON.stringify(newProfile));
      localStorage.setItem(keys.skills, JSON.stringify([]));
      localStorage.setItem(keys.projects, JSON.stringify([]));
      localStorage.setItem(keys.achievements, JSON.stringify([]));

      const initialGoal: CareerGoal = {
        id: 'goal_' + newStudentId + '_primary',
        userId: newStudentId,
        primaryGoal: `${newProfile.careerGoal || 'Software Engineer'} Target`,
        targetRole: newProfile.careerGoal || 'Software Engineer',
        targetCompanies: [],
        requiredSkills: [],
        targetTimeline: `${newProfile.graduationYear || '2027'} Placements`,
        targetCompensationINR: '₹12,00,000 / yr',
        industryPreferences: ['Technology'],
        milestones: [
          { id: 'm1', title: 'Complete Core Computer Science & Algorithms', completed: false },
          { id: 'm2', title: 'Build and Deploy Capstone Project', completed: false },
        ],
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(keys.goals, JSON.stringify([initialGoal]));
      localStorage.setItem(keys.activeGoalId, initialGoal.id);
    } catch (e) {
      console.error('Failed to save new student', e);
    }

    // Automatically switch to the new student
    await switchActiveStudent(newStudentId);
    return newStudentId;
  }, [students, userId, getStudentKeys, switchActiveStudent]);

  // Update a student profile
  const updateStudentProfile = useCallback(async (studentId: string, updates: Partial<UserProfile>) => {
    const nextStudents = students.map((s) => {
      if (s.id === studentId) {
        return { ...s, ...updates, updatedAt: new Date().toISOString() };
      }
      return s;
    });
    setStudents(nextStudents);

    const keys = getStudentKeys(userId, studentId);
    try {
      localStorage.setItem(keys.studentsList, JSON.stringify(nextStudents));
      const updatedTarget = nextStudents.find((s) => s.id === studentId);
      if (updatedTarget) {
        localStorage.setItem(keys.profile, JSON.stringify(updatedTarget));
      }
    } catch (e) {
      console.error('Failed to update student profile', e);
    }

    if (studentId === activeStudentId) {
      setProfile((prev) => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString(),
      }));
    }
  }, [students, activeStudentId, userId, getStudentKeys]);

  // Delete a student profile
  const deleteStudent = useCallback(async (studentId: string) => {
    if (students.length <= 1) {
      throw new Error('Cannot delete the only student profile. At least one profile must exist.');
    }

    const nextStudents = students.filter((s) => s.id !== studentId);
    setStudents(nextStudents);

    const keys = getStudentKeys(userId, studentId);
    try {
      localStorage.setItem(keys.studentsList, JSON.stringify(nextStudents));
      localStorage.removeItem(keys.profile);
      localStorage.removeItem(keys.skills);
      localStorage.removeItem(keys.projects);
      localStorage.removeItem(keys.achievements);
      localStorage.removeItem(keys.goals);
      localStorage.removeItem(keys.activeGoalId);
    } catch (e) {
      console.error('Failed to cleanup deleted student', e);
    }

    if (activeStudentId === studentId) {
      const nextActiveId = nextStudents[0].id;
      setActiveStudentId(nextActiveId);
      try {
        localStorage.setItem(keys.activeStudentId, nextActiveId);
      } catch {}
      loadStudentData(userId, nextActiveId, nextStudents);
    }
  }, [students, activeStudentId, userId, getStudentKeys, loadStudentData]);

  // Active Career Goal
  const careerGoal = useMemo<CareerGoal>(() => {
    if (careerGoalsList.length === 0) {
      return {
        id: 'goal_temp',
        userId: activeStudentId,
        primaryGoal: profile.careerGoal ? `${profile.careerGoal} Target` : 'Career Target',
        targetRole: profile.careerGoal || 'Software Engineer',
        targetCompanies: [],
        requiredSkills: [],
        targetTimeline: profile.graduationYear ? `${profile.graduationYear} Placements` : 'Placements',
        targetCompensationINR: '₹12,00,000 / yr',
        industryPreferences: ['Technology'],
        milestones: [
          { id: 'm1', title: 'Complete Foundations', completed: false },
        ],
        updatedAt: new Date().toISOString(),
      };
    }
    const found = careerGoalsList.find((g) => g.id === activeGoalId);
    return found || careerGoalsList[0];
  }, [careerGoalsList, activeGoalId, activeStudentId, profile.careerGoal, profile.graduationYear]);

  // Active student update operations
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    await updateStudentProfile(activeStudentId, updates);
  }, [activeStudentId, updateStudentProfile]);

  // Skill operations
  const addSkill = useCallback(async (skillData: Omit<Skill, 'id' | 'userId' | 'createdAt'>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    const newSkill: Skill = {
      ...skillData,
      id: 'skill_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: activeStudentId,
      createdAt: new Date().toISOString(),
    };
    setSkills((prev) => {
      const next = [newSkill, ...prev];
      try {
        localStorage.setItem(keys.skills, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save skills', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  const updateSkill = useCallback(async (id: string, updates: Partial<Skill>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setSkills((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      try {
        localStorage.setItem(keys.skills, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to update skill', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  const deleteSkill = useCallback(async (id: string) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setSkills((prev) => {
      const next = prev.filter((s) => s.id !== id);
      try {
        localStorage.setItem(keys.skills, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to delete skill', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  // Project operations
  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'userId' | 'createdAt'>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    const newProject: Project = {
      ...projectData,
      id: 'proj_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: activeStudentId,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => {
      const next = [newProject, ...prev];
      try {
        localStorage.setItem(keys.projects, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save projects', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(keys.projects, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to update project', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  const deleteProject = useCallback(async (id: string) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem(keys.projects, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to delete project', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  // Achievement operations
  const addAchievement = useCallback(async (achievementData: Omit<Achievement, 'id' | 'userId' | 'createdAt'>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    const newAchievement: Achievement = {
      ...achievementData,
      id: 'ach_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: activeStudentId,
      createdAt: new Date().toISOString(),
    };
    setAchievements((prev) => {
      const next = [newAchievement, ...prev];
      try {
        localStorage.setItem(keys.achievements, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save achievements', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  const updateAchievement = useCallback(async (id: string, updates: Partial<Achievement>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setAchievements((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      try {
        localStorage.setItem(keys.achievements, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to update achievement', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  const deleteAchievement = useCallback(async (id: string) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setAchievements((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(keys.achievements, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to delete achievement', e);
      }
      return next;
    });
  }, [userId, activeStudentId, getStudentKeys]);

  // Career Goal operations
  const updateCareerGoal = useCallback(async (goalData: Partial<Omit<CareerGoal, 'id' | 'userId' | 'updatedAt'>>) => {
    const keys = getStudentKeys(userId, activeStudentId);

    setCareerGoalsList((prev) => {
      const targetId = activeGoalId || (prev[0]?.id) || 'goal_' + activeStudentId;
      let found = false;
      const next = prev.map((g) => {
        if (g.id === targetId) {
          found = true;
          return { ...g, ...goalData, updatedAt: new Date().toISOString() };
        }
        return g;
      });

      if (!found) {
        const newGoal: CareerGoal = {
          id: targetId,
          userId: activeStudentId,
          primaryGoal: goalData.primaryGoal || `${profile.careerGoal || 'Software Engineer'} Target`,
          targetRole: goalData.targetRole || profile.careerGoal || 'Software Engineer',
          targetCompanies: goalData.targetCompanies || [],
          requiredSkills: goalData.requiredSkills || [],
          targetTimeline: goalData.targetTimeline || '',
          targetCompensationINR: goalData.targetCompensationINR,
          industryPreferences: goalData.industryPreferences || [],
          milestones: goalData.milestones || [],
          updatedAt: new Date().toISOString(),
        };
        next.push(newGoal);
      }

      try {
        localStorage.setItem(keys.goals, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save career goals', e);
      }
      return next;
    });
  }, [userId, activeStudentId, activeGoalId, profile.careerGoal, getStudentKeys]);

  const addCareerGoal = useCallback(async (goalData: Omit<CareerGoal, 'id' | 'userId' | 'updatedAt'>) => {
    const keys = getStudentKeys(userId, activeStudentId);
    const newGoal: CareerGoal = {
      ...goalData,
      id: 'goal_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      userId: activeStudentId,
      updatedAt: new Date().toISOString(),
    };

    setCareerGoalsList((prev) => {
      const next = [newGoal, ...prev];
      try {
        localStorage.setItem(keys.goals, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save career goals list', e);
      }
      return next;
    });
    setActiveGoalId(newGoal.id);
    try {
      localStorage.setItem(keys.activeGoalId, newGoal.id);
    } catch {}
  }, [userId, activeStudentId, getStudentKeys]);

  const deleteCareerGoal = useCallback(async (id: string) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setCareerGoalsList((prev) => {
      const next = prev.filter((g) => g.id !== id);
      try {
        localStorage.setItem(keys.goals, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to delete career goal', e);
      }
      if (activeGoalId === id && next.length > 0) {
        setActiveGoalId(next[0].id);
        try {
          localStorage.setItem(keys.activeGoalId, next[0].id);
        } catch {}
      }
      return next;
    });
  }, [userId, activeStudentId, activeGoalId, getStudentKeys]);

  const setActiveCareerGoal = useCallback(async (id: string) => {
    const keys = getStudentKeys(userId, activeStudentId);
    setActiveGoalId(id);
    try {
      localStorage.setItem(keys.activeGoalId, id);
    } catch {}
  }, [userId, activeStudentId, getStudentKeys]);

  // Reset/Clear user digital twin data for current student
  const clearAllUserData = useCallback(async () => {
    const keys = getStudentKeys(userId, activeStudentId);
    localStorage.removeItem(keys.profile);
    localStorage.removeItem(keys.skills);
    localStorage.removeItem(keys.projects);
    localStorage.removeItem(keys.achievements);
    localStorage.removeItem(keys.goals);
    localStorage.removeItem(keys.activeGoalId);

    const initialProfile = createEmptyProfile(userId, user?.email || '', user?.user_metadata?.full_name || '');
    initialProfile.id = activeStudentId;
    setProfile(initialProfile);
    setSkills([]);
    setProjects([]);
    setAchievements([]);
    const defaultGoal: CareerGoal = {
      id: 'goal_' + activeStudentId + '_primary',
      userId: activeStudentId,
      primaryGoal: 'Career Placement Target',
      targetRole: 'Software Engineer',
      targetCompanies: [],
      requiredSkills: [],
      targetTimeline: 'Placements',
      targetCompensationINR: '₹12,00,000 / yr',
      industryPreferences: ['Technology'],
      milestones: [
        { id: 'm1', title: 'Complete Core CS Foundation', completed: false },
        { id: 'm2', title: 'Build and Deploy Capstone Project', completed: false },
      ],
      updatedAt: new Date().toISOString(),
    };
    setCareerGoalsList([defaultGoal]);
    setActiveGoalId(defaultGoal.id);
  }, [userId, activeStudentId, user, getStudentKeys]);

  // Calculate dynamic Profile Completion Percentage
  const profileCompletion = useMemo<number>(() => {
    let score = 0;
    const totalWeights = 100;

    // Core profile details (60 pts)
    if (profile.fullName && profile.fullName.trim() !== '') score += 10;
    if (profile.institution && profile.institution.trim() !== '') score += 10;
    if (profile.degree && profile.degree.trim() !== '') score += 8;
    if (profile.major && profile.major.trim() !== '') score += 8;
    if (profile.year && profile.year.trim() !== '') score += 8;
    if (profile.careerGoal && profile.careerGoal.trim() !== '') score += 8;
    if (profile.bio && profile.bio.trim() !== '') score += 8;

    // Artifact presence (40 pts)
    if (skills.length > 0) score += Math.min(15, skills.length * 3);
    if (projects.length > 0) score += Math.min(15, projects.length * 5);
    if (achievements.length > 0) score += Math.min(10, achievements.length * 5);

    return Math.min(totalWeights, Math.round(score));
  }, [profile, skills, projects, achievements]);

  // Compute deterministic readiness score based strictly on actual student data
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

    // Projects score (0-100)
    let rawProjScore = 0;
    projects.forEach((p) => {
      let pts = p.status === 'Completed' ? 25 : p.status === 'In Progress' ? 15 : 10;
      if (p.githubUrl) pts += 10;
      if (p.liveUrl) pts += 10;
      if (p.difficulty === 'Advanced' || p.difficulty === 'Production') pts += 10;
      else if (p.difficulty === 'Intermediate') pts += 5;
      rawProjScore += pts;
    });
    const projectsScore = Math.min(100, rawProjScore);

    // Communication / Professional score (0-100)
    const softScore = computeSkillCatScore(softSkills);
    const leadershipAchievements = achievements.filter((a) => a.category === 'Leadership' || a.category === 'Hackathon & Contest').length * 20;
    const communicationScore = Math.min(100, Math.round(softScore * 0.6 + leadershipAchievements * 0.4));

    // Career Preparation score (0-100)
    let rawCareerPrep = 0;
    if (careerGoal.targetRole) rawCareerPrep += 20;
    if (careerGoal.targetCompanies.length > 0) rawCareerPrep += Math.min(20, careerGoal.targetCompanies.length * 5);
    if ((careerGoal.requiredSkills || []).length > 0) rawCareerPrep += Math.min(20, (careerGoal.requiredSkills || []).length * 4);
    const completedMilestones = (careerGoal.milestones || []).filter((m) => m.completed).length;
    const totalMilestones = (careerGoal.milestones || []).length || 1;
    rawCareerPrep += Math.round((completedMilestones / totalMilestones) * 40);
    const careerPrepScore = Math.min(100, rawCareerPrep);

    // 4 Core Pillars Breakdown (0-100 each)
    const skillsCoverage = Math.min(100, skills.length * 15);
    const projectPortfolio = projectsScore;
    const industryAlignment = careerPrepScore;
    const verifications = Math.min(
      100,
      achievements.length * 20 + skills.filter((s) => s.isVerified || s.status === 'Verified').length * 15
    );

    // Deterministic Overall Score (Weighted combination out of 100)
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

  return (
    <StudentTwinContext.Provider
      value={{
        profile,
        skills,
        projects,
        achievements,
        careerGoal,
        careerGoalsList,
        readinessScore,
        profileCompletion,
        isLoadingData,
        cloudSyncStatus,
        uploadDataToCloud,
        plan,
        upgradePlan,
        isOnboardingOpen,
        setIsOnboardingOpen,
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
      }}
    >
      {children}
    </StudentTwinContext.Provider>
  );
};

export const useStudentTwin = (): StudentTwinContextType => {
  const context = useContext(StudentTwinContext);
  if (!context) {
    throw new Error('useStudentTwin must be used within a StudentTwinProvider');
  }
  return context;
};
