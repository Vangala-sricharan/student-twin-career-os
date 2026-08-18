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
  | 'linkedin-readiness'
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

// GitHub Evidence & Analysis Types
export interface GitHubProfileEvidence {
  username: string;
  profileUrl: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  publicReposCount: number;
  followersCount: number;
  followingCount: number;
  company?: string;
  location?: string;
  blog?: string;
  createdAt?: string;
  updatedAt?: string;
  hasProfileReadme: boolean;
  profileReadmeSnippet?: string;
  analyzedReposCount: number;
  topLanguages: { language: string; count: number; percentage: number }[];
  lastActivityDate: string | null;
  totalStars: number;
  totalForks: number;
  hasLiveDemoLinks: boolean;
  repositories: {
    name: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    updatedAt: string;
    homepage: string | null;
    topics: string[];
    isFork: boolean;
  }[];
}

export interface GitHubCategoryScores {
  profileQuality: number; // Max 15
  projectQuality: number; // Max 25
  documentation: number; // Max 20
  organization: number; // Max 15
  activity: number; // Max 15
  engineeringPresentation: number; // Max 10
}

export interface GitHubReadinessAnalysis {
  id: string;
  userId: string;
  platform: 'github';
  profileUrl: string;
  username: string;
  analysisDate: string;
  overallScore: number;
  profileStrength: 'Basic' | 'Developing' | 'Competitive' | 'Top Tier';
  categories: GitHubCategoryScores;
  evidence: GitHubProfileEvidence;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  checklist: { item: string; passed: boolean; note?: string }[];
}

// LinkedIn Evidence & Analysis Types
export interface LinkedInProfileEvidence {
  profileUrl: string;
  slug: string;
  dataSource: 'pasted_text' | 'uploaded_pdf' | 'public_api';
  headline?: string;
  about?: string;
  education?: string[];
  skills?: string[];
  certifications?: string[];
  projects?: string[];
  experience?: string[];
  rawTextPreview?: string;
  sectionPresence: {
    headline: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    experience: boolean;
    education: boolean;
    certifications: boolean;
  };
}

export interface LinkedInCategoryScores {
  profileCompleteness: number; // Max 15
  headlinePositioning: number; // Max 15
  aboutSection: number; // Max 15
  skillsTechnicalStack: number; // Max 15
  projectsPortfolio: number; // Max 15
  experienceInternships: number; // Max 10
  educationCertifications: number; // Max 5
  professionalPresentation: number; // Max 5
  careerAlignment: number; // Max 5
}

export interface LinkedInReadinessAnalysis {
  id: string;
  userId: string;
  platform: 'linkedin';
  profileUrl: string;
  analysisDate: string;
  overallScore: number;
  readinessTier: 'Needs Optimization' | 'Developing' | 'Recruiter-Ready' | 'Elite Positioning';
  categories: LinkedInCategoryScores;
  evidence: LinkedInProfileEvidence;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  checklist: { item: string; passed: boolean; note?: string }[];
}

// Project Depth Evidence & Analysis Types
export interface ProjectCategoryScores {
  architectureSystemDesign: number; // Max 20
  technicalComplexity: number; // Max 20
  technologyStack: number; // Max 15
  dataBackendDatabase: number; // Max 15
  securityAuthentication: number; // Max 10
  scalabilityPerformance: number; // Max 10
  testingReliability: number; // Max 5
  deploymentDevops: number; // Max 5
}

export interface ProjectRepoEvidence {
  repoFullName?: string;
  name?: string;
  description?: string | null;
  stars?: number;
  forks?: number;
  primaryLanguage?: string | null;
  hasReadme?: boolean;
  readmeSnippet?: string;
  lastPushedAt?: string | null;
  topics?: string[];
  isVerified: boolean;
  verificationMessage: string;
}

export interface ProjectAnalysisEvidence {
  projectId: string;
  projectTitle: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  difficulty?: string;
  status?: string;
  githubRepoData?: ProjectRepoEvidence;
  liveDemoVerified?: boolean;
  hasDatabase: boolean;
  hasAuth: boolean;
  hasTesting: boolean;
  hasCiCd: boolean;
  hasDockerOrK8s: boolean;
}

export interface ProjectAnalysisRecord {
  id: string; // analysis_id
  userId: string; // user_id
  projectId: string; // project_id
  projectTitle: string;
  analysisDate: string; // analysis_date
  technicalDepthScore: number; // technical_depth_score (0-100)
  complexityRating: 'Foundational' | 'Moderate' | 'Production-Ready' | 'Advanced Systems';
  rating: 'High Impact' | 'Strong Impact' | 'Moderate Impact' | 'Needs Improvement';
  realWorldValue: string;
  resumeImpact: string;
  resumeImpactValue: string;
  missingProductionUpgrades: string[];
  missingImprovements: string[];
  actionableRecommendations: string[];
  architectureStrengths: string[];
  technologiesEvaluated: { name: string; relevance: string; industryDemand: string }[];
  categoryScores: ProjectCategoryScores;
  evidence: ProjectAnalysisEvidence;
}

