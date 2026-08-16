export type Theme = 'light' | 'dark';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string; // Supabase user ID or creator ID
  email: string;
  fullName: string;
  avatarUrl?: string;
  degree?: string;
  major?: string;
  institution?: string;
  graduationYear?: string;
  year?: string; // Academic year e.g. "2nd Year"
  careerGoal?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SkillCategory = 
  | 'Programming'
  | 'DSA'
  | 'AI/ML'
  | 'Web Development'
  | 'Databases'
  | 'Tools'
  | 'Cloud'
  | 'Soft Skills';

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SkillStatus = 'Active' | 'Learning' | 'Verified';

export interface Skill {
  id: string;
  userId: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
  score: number; // 0 to 100
  status: SkillStatus;
  yearsOfExperience?: number;
  isVerified?: boolean;
  createdAt: string;
}

export type ProjectStatus = 'Planned' | 'In Progress' | 'Completed' | 'Archived';
export type ProjectDifficulty = 'Basic' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Production';

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  status: ProjectStatus;
  difficulty: ProjectDifficulty;
  year?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export type AchievementCategory = 
  | 'Hackathons'
  | 'Certifications'
  | 'Competitive Programming'
  | 'Publications'
  | 'Academics'
  | 'Leadership'
  | 'Certification'
  | 'Hackathon & Contest'
  | 'Academic Honor'
  | 'Publication / Patent';

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  issuer: string;
  category: AchievementCategory;
  issueDate?: string;
  date?: string;
  credentialUrl?: string;
  description?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface CareerGoal {
  id: string;
  userId: string;
  primaryGoal?: string;
  targetRole: string;
  secondaryRoles?: string[];
  targetCompanies: string[];
  requiredSkills?: string[];
  targetTimeline: string;
  targetCompensationINR?: string;
  industryPreferences?: string[];
  milestones: Milestone[];
  notes?: string;
  updatedAt: string;
}

export interface ReadinessScore {
  overall: number; // 0 to 100
  breakdown: {
    skillsCoverage: number;
    projectPortfolio: number;
    industryAlignment: number;
    verifications: number;
  };
  categories: {
    programming: number;
    dsa: number;
    aiMl: number;
    projects: number;
    communication: number;
    careerPrep: number;
  };
  level: 'Early Stage' | 'Developing' | 'Career Ready' | 'Industry Elite';
}

export type ActiveTab = 
  | 'dashboard'
  | 'profile'
  | 'student-profiles'
  | 'skills'
  | 'projects'
  | 'achievements'
  | 'goals'
  | 'analytics'
  | 'ai-assistant'
  | 'ai-resume-builder'
  | 'ai-resume-analyzer'
  | 'ai-syllabus-analyzer'
  | 'ai-project-analyzer'
  | 'ai-career-roadmap'
  | 'internship-readiness'
  | 'career-simulator'
  | 'github-readiness'
  | 'ai-hub'
  | 'subscription'
  | 'settings';

export type PublicView = 'landing' | 'login' | 'signup' | 'demo';

export type SubscriptionPlan = 'free' | 'pro_monthly' | 'pro_annual' | 'institution';

export interface UserSubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'trial' | 'expired';
  activatedAt?: string;
  expiresAt?: string;
  upiRef?: string;
}

export interface CloudSyncStatus {
  lastSyncedAt: string | null;
  isSyncing: boolean;
  error: string | null;
}
