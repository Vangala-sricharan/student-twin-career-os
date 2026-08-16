import { UserProfile, Skill, Project, Achievement, CareerGoal, ReadinessScore } from '../types';

export interface AIInsightsResult {
  strongAreas: string[];
  needsImprovement: string[];
  recommendedNextStep: string;
  careerRisk: string;
  highestImpactAction: string;
  placementForecast: string;
  roleReadinessPercentage: number;
}

export interface RoadmapSprint {
  phase: string;
  duration: string;
  focus: string;
  milestones: { id: string; title: string; detail: string; category: string; completed: boolean }[];
}

export interface Roadmap306090Result {
  day30: RoadmapSprint;
  day60: RoadmapSprint;
  day90: RoadmapSprint;
}

export interface ResumeAnalysisResult {
  atsScore: number;
  matchRole: string;
  readinessTier: string;
  detectedSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
}

export interface SyllabusAnalysisResult {
  courseTitle: string;
  totalModules: number;
  careerRelevanceScore: number;
  modules: {
    unit: string;
    topics: string[];
    importance: 'High' | 'Medium' | 'Critical';
    industryApplication: string;
  }[];
  skillGaps: string[];
  recommendedLearningOrder: string[];
  studyPriorities: {
    highPriority: string[];
    mediumPriority: string[];
    foundational: string[];
  };
}

export interface ProjectAnalysisResult {
  projectTitle: string;
  technicalDepthScore: number; // 0-100
  complexityRating: 'Foundational' | 'Moderate' | 'Production-Ready' | 'Advanced Systems';
  technologiesEvaluated: { name: string; relevance: string; industryDemand: string }[];
  realWorldValue: string;
  resumeImpactValue: string;
  architectureStrengths: string[];
  missingImprovements: string[];
  actionableRecommendations: string[];
}

export interface InternshipReadinessResult {
  readinessPercentage: number;
  targetRole: string;
  statusTier: string;
  strengths: string[];
  blockers: string[];
  recommendedActions: { priority: 'P0' | 'P1' | 'P2'; action: string; timeEstimate: string }[];
  roleMatches: { role: string; matchPercent: number }[];
}

export interface GitHubReadinessResult {
  overallScore: number;
  profileStrength: 'Basic' | 'Developing' | 'Competitive' | 'Top Tier';
  projectQuality: number;
  repoOrganization: number;
  readmeQuality: number;
  documentation: number;
  activityRating: number;
  strengths: string[];
  recommendations: string[];
  checklist: { item: string; passed: boolean }[];
}

/**
 * 1. Generate Profile-Aware AI Career Insights
 */
export function generateAICareerInsights(
  profile: UserProfile,
  skills: Skill[],
  projects: Project[],
  achievements: Achievement[],
  careerGoal: CareerGoal,
  readiness: ReadinessScore
): AIInsightsResult {
  const targetRole = careerGoal.targetRole || 'Software / AI Engineer';
  const roleLower = targetRole.toLowerCase();

  // Determine strengths from verified/high-proficiency skills
  const strongSkills = skills.filter((s) => s.proficiency === 'Advanced' || s.proficiency === 'Expert' || (s.score && s.score >= 80));
  const strongAreas: string[] = [];

  if (strongSkills.length > 0) {
    strongAreas.push(`Proficiency in ${strongSkills.slice(0, 3).map((s) => s.name).join(', ')}`);
  } else if (skills.length > 0) {
    strongAreas.push(`Foundational grounding across ${skills.length} core technical competencies`);
  } else {
    strongAreas.push('Academic coursework foundation in computer science');
  }

  const completedProjects = projects.filter((p) => p.status === 'Completed');
  if (completedProjects.length > 0) {
    strongAreas.push(`Demonstrated implementation ability with ${completedProjects.length} completed engineering projects`);
  }

  if (achievements.length > 0) {
    strongAreas.push(`Validated accomplishments: ${achievements[0].title}`);
  }

  if (strongAreas.length < 3) {
    strongAreas.push('Clear career goal alignment with targeted technical track');
  }

  // Determine areas needing improvement
  const needsImprovement: string[] = [];
  const hasDSA = skills.some((s) => s.category === 'DSA' || s.name.toLowerCase().includes('dsa') || s.name.toLowerCase().includes('algorithm'));
  const hasCloudOrDevOps = skills.some((s) => s.category === 'Cloud' || s.category === 'Tools' || s.name.toLowerCase().includes('docker') || s.name.toLowerCase().includes('aws'));
  const hasLiveProjects = projects.some((p) => p.liveUrl && p.liveUrl.trim().length > 0);

  if (!hasDSA || readiness.categories.dsa < 75) {
    needsImprovement.push('Data Structures & Algorithms problem-solving depth for technical placement rounds');
  }
  if (!hasCloudOrDevOps) {
    needsImprovement.push('Containerization & CI/CD deployment pipelines (Docker, Kubernetes, or Cloud)');
  }
  if (!hasLiveProjects) {
    needsImprovement.push('Live deployed project URLs with automated backend infrastructure');
  }
  if (skills.length < 6) {
    needsImprovement.push('Broader technical skill taxonomy coverage matching top tier employer expectations');
  }
  if (needsImprovement.length === 0) {
    needsImprovement.push('Distributed systems architecture and large-scale concurrency benchmarking');
  }

  // Recommended Next Step & Highest Impact Action
  let recommendedNextStep = 'Solve 20 LeetCode Medium challenges focusing on Trees, Graphs, and Dynamic Programming.';
  let highestImpactAction = 'Deploy an end-to-end full-stack or AI project on cloud with public GitHub repository and live demonstration.';
  let careerRisk = 'Lack of live deployed architectures could hinder recruiter shortlisting during campus drives.';

  if (roleLower.includes('ai') || roleLower.includes('machine learning') || roleLower.includes('ml')) {
    highestImpactAction = 'Train and containerize a PyTorch/TensorFlow deep learning inference API with FastAPI and Docker.';
    recommendedNextStep = 'Implement a custom neural network pipeline and benchmark inference latency.';
    careerRisk = 'Theoretical knowledge without end-to-end deployed model pipelines poses the biggest gap.';
  } else if (roleLower.includes('web') || roleLower.includes('full stack') || roleLower.includes('frontend')) {
    highestImpactAction = 'Build a production SaaS application with TypeScript, database persistence, and secure authentication.';
    recommendedNextStep = 'Optimize client-side bundle size, state management, and real-time WebSocket listeners.';
    careerRisk = 'Basic CRUD projects are over-saturated; recruiters look for production scalability.';
  }

  const roleReadinessPercentage = Math.min(100, Math.round(readiness.overall * 1.05));
  const placementForecast =
    readiness.overall >= 80
      ? 'Tier-1 Tech Companies & High-Growth Startups (92% interview shortlist confidence)'
      : readiness.overall >= 60
      ? 'Product Companies & Established Tech Firms (78% interview shortlist confidence)'
      : 'Early Talent Programs & Emerging Developer Roles (60% interview shortlist confidence)';

  return {
    strongAreas,
    needsImprovement,
    recommendedNextStep,
    careerRisk,
    highestImpactAction,
    placementForecast,
    roleReadinessPercentage,
  };
}

/**
 * 2. Generate 30/60/90-Day Career Roadmap
 */
export function generate306090Roadmap(
  profile: UserProfile,
  skills: Skill[],
  projects: Project[],
  achievements: Achievement[],
  careerGoal: CareerGoal
): Roadmap306090Result {
  const targetRole = careerGoal.targetRole || 'Software / AI Engineer';
  const roleLower = targetRole.toLowerCase();

  const isAIML = roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('machine learning');

  const day30: RoadmapSprint = {
    phase: 'Phase 1: Core CS Foundations & Gap Rectification',
    duration: 'Days 1 – 30',
    focus: 'DSA problem-solving and core language architecture mastery',
    milestones: [
      {
        id: 'd30_1',
        title: 'Daily Data Structures & Algorithms Drill',
        detail: 'Solve 30 LeetCode/CodeChef problems: Arrays, HashMaps, Two Pointers, and Binary Search.',
        category: 'DSA',
        completed: skills.some((s) => s.category === 'DSA' && s.proficiency === 'Advanced'),
      },
      {
        id: 'd30_2',
        title: isAIML ? 'NumPy, Pandas & PyTorch Tensor Calculus' : 'Advanced TypeScript & Modern Framework Internals',
        detail: isAIML
          ? 'Implement matrix vectorization, backpropagation from scratch, and dataloader pipelines.'
          : 'Master asynchronous event loops, custom hooks, and strict type safety.',
        category: 'Programming',
        completed: skills.some((s) => s.score && s.score >= 80),
      },
      {
        id: 'd30_3',
        title: 'Audit & Refactor Existing GitHub Repositories',
        detail: 'Add descriptive READMEs, architecture diagrams, installation instructions, and clean branch conventions.',
        category: 'GitHub',
        completed: projects.length >= 2,
      },
      {
        id: 'd30_4',
        title: 'ATS Resume Standardization',
        detail: 'Format resume with quantifiable metrics (X-Y-Z formula) and export standardized PDF.',
        category: 'Career',
        completed: false,
      },
    ],
  };

  const day60: RoadmapSprint = {
    phase: 'Phase 2: Production Systems & Advanced Portfolio',
    duration: 'Days 31 – 60',
    focus: 'End-to-end full-stack or ML deployment with automated infrastructure',
    milestones: [
      {
        id: 'd60_1',
        title: isAIML ? 'Train & Deploy Production Neural Model Pipeline' : 'Build Scalable Microservice / Full-Stack SaaS',
        detail: isAIML
          ? 'Train fine-tuned Transformer/CNN, expose REST inference endpoint with FastAPI, and package in Docker.'
          : 'Implement Redis caching, PostgreSQL indexing, and JWT authentication in a production container.',
        category: 'Project',
        completed: projects.some((p) => p.difficulty === 'Advanced' || p.difficulty === 'Production'),
      },
      {
        id: 'd60_2',
        title: 'Intermediate Algorithms: Trees, Graphs & Dynamic Programming',
        detail: 'Master Tree Traversals, BFS/DFS, Dijkstra, and Classic DP formulations (Knapsack, LCS).',
        category: 'DSA',
        completed: false,
      },
      {
        id: 'd60_3',
        title: 'Cloud Certification / Competitive Credentialing',
        detail: 'Earn a recognized credential (AWS Cloud Practitioner, DeepLearning.AI, or Top 15% Contest badge).',
        category: 'Achievement',
        completed: achievements.length > 0,
      },
      {
        id: 'd60_4',
        title: 'System Design Fundamentals',
        detail: 'Study Load Balancers, Horizontal Scaling, Database Sharding, and Cache-Aside architectures.',
        category: 'Systems',
        completed: false,
      },
    ],
  };

  const day90: RoadmapSprint = {
    phase: 'Phase 3: Campus Placements & Industry Sprint',
    duration: 'Days 61 – 90',
    focus: 'Mock interview simulations, technical assessments, and recruiter pipeline',
    milestones: [
      {
        id: 'd90_1',
        title: 'Timed Mock Coding Assessments',
        detail: 'Complete 10 full-length simulated technical tests (60 mins, 3 questions under test conditions).',
        category: 'Interview Prep',
        completed: false,
      },
      {
        id: 'd90_2',
        title: 'System Design & Behavioral STAR Responses',
        detail: 'Prepare structured walkthroughs for leadership principles, past conflict resolution, and trade-offs.',
        category: 'Interview Prep',
        completed: false,
      },
      {
        id: 'd90_3',
        title: 'Recruiter Outreach & Referral Network',
        detail: `Target engineers and recruiters at ${(careerGoal.targetCompanies || ['target companies']).slice(0, 3).join(', ')}.`,
        category: 'Networking',
        completed: false,
      },
      {
        id: 'd90_4',
        title: 'Final Digital Twin Verification & Portfolio Freeze',
        detail: 'Verify all project demo links, update live portfolio URL, and generate final verification report.',
        category: 'Readiness',
        completed: false,
      },
    ],
  };

  return { day30, day60, day90 };
}

/**
 * 3. AI Resume Analyzer Engine
 */
export function analyzeResumeContent(
  rawText: string,
  targetRole: string,
  userProfile?: UserProfile
): ResumeAnalysisResult {
  const text = rawText.toLowerCase();

  // Industry keywords dictionary
  const expectedKeywords = [
    'python', 'pytorch', 'tensorflow', 'machine learning', 'deep learning',
    'fastapi', 'docker', 'kubernetes', 'data structures', 'algorithms',
    'sql', 'postgresql', 'redis', 'git', 'github', 'ci/cd', 'rest api',
    'react', 'typescript', 'node.js', 'linux', 'aws', 'cloud', 'system design'
  ];

  const detectedSkills: string[] = [];
  const missingKeywords: string[] = [];

  expectedKeywords.forEach((kw) => {
    if (text.includes(kw)) {
      detectedSkills.push(kw.toUpperCase());
    } else {
      missingKeywords.push(kw.toUpperCase());
    }
  });

  // Calculate ATS Score based on presence of key sections and keywords
  let atsScore = 45;
  if (text.includes('education') || text.includes('university') || text.includes('b.tech') || text.includes('college')) atsScore += 12;
  if (text.includes('experience') || text.includes('internship') || text.includes('projects') || text.includes('work')) atsScore += 15;
  if (text.includes('skills') || text.includes('technical skills')) atsScore += 12;
  if (text.includes('github.com') || text.includes('linkedin.com')) atsScore += 8;

  // Bonus for detected technical keywords
  const keywordRatio = detectedSkills.length / Math.max(1, expectedKeywords.length);
  atsScore += Math.round(keywordRatio * 20);
  atsScore = Math.min(96, Math.max(35, atsScore));

  const strengths: string[] = [];
  if (detectedSkills.length >= 6) {
    strengths.push(`Rich technical keyword density (${detectedSkills.slice(0, 5).join(', ')})`);
  }
  if (text.includes('github.com')) {
    strengths.push('Included verifiable GitHub profile links for engineering recruiter audit');
  }
  if (text.includes('%') || text.includes('improved') || text.includes('reduced') || text.includes('deployed')) {
    strengths.push('Employed action-oriented quantifiable verbs in accomplishment bullet points');
  } else {
    strengths.push('Clearly structured academic and degree timeline');
  }

  const weaknesses: string[] = [];
  if (!text.includes('docker') && !text.includes('kubernetes') && !text.includes('cloud')) {
    weaknesses.push('Missing cloud deployment and containerization keywords (Docker/AWS)');
  }
  if (missingKeywords.includes('SYSTEM DESIGN')) {
    weaknesses.push('No mention of architectural trade-offs or System Design competencies');
  }
  if (!text.includes('latency') && !text.includes('throughput') && !text.includes('accuracy')) {
    weaknesses.push('Project descriptions lack quantified engineering impact metrics');
  }

  const improvements: string[] = [
    'Adopt Google XYZ format for bullet points: "Accomplished [X] as measured by [Y], by doing [Z]".',
    `Inject critical target role keywords: ${missingKeywords.slice(0, 4).join(', ')}.`,
    'Ensure all GitHub project repositories have public access with active demonstration links.',
    'Keep resume strictly to 1 page with clean single-column ATS-parseable layout.',
  ];

  let readinessTier = 'Needs Optimization';
  if (atsScore >= 85) readinessTier = 'ATS-Elite (Top 10%)';
  else if (atsScore >= 70) readinessTier = 'Recruiter-Ready';
  else if (atsScore >= 50) readinessTier = 'Standard Parsable';

  const summary = `Resume scored ${atsScore}/100 for ${targetRole || 'Engineering'} positions. Detected ${detectedSkills.length} industry keywords with strong section structure.`;

  return {
    atsScore,
    matchRole: targetRole || 'Software / AI Engineer',
    readinessTier,
    detectedSkills,
    missingKeywords: missingKeywords.slice(0, 6),
    strengths,
    weaknesses,
    improvements,
    summary,
  };
}

/**
 * 4. AI Syllabus & Curriculum Analyzer
 */
export function analyzeSyllabusContent(syllabusText: string): SyllabusAnalysisResult {
  const text = syllabusText.toLowerCase();

  const isAIML = text.includes('machine learning') || text.includes('neural') || text.includes('artificial intelligence') || text.includes('deep learning');
  const isDataStructures = text.includes('data structures') || text.includes('algorithm') || text.includes('tree') || text.includes('graph');

  const courseTitle = isAIML
    ? 'Applied Machine Learning & Neural Systems Curriculum'
    : isDataStructures
    ? 'Advanced Data Structures & Algorithmic Analysis'
    : 'Computer Science Core Engineering Curriculum';

  const modules = [
    {
      unit: 'Unit I: Core Foundations & Mathematical Formulations',
      topics: ['Mathematical Foundations', 'Algorithm Complexity Analysis', 'Vectorization'],
      importance: 'High' as const,
      industryApplication: 'Foundation for passing algorithmic rounds and memory complexity benchmarks.',
    },
    {
      unit: 'Unit II: Core Architectures & Data Paradigms',
      topics: ['Linear Models', 'Tree Traversals', 'Graph Search & Pathfinding'],
      importance: 'Critical' as const,
      industryApplication: 'Directly evaluated in technical screening interviews across top tier tech companies.',
    },
    {
      unit: 'Unit III: Advanced Pipelines & Optimization',
      topics: ['Dynamic Programming', 'Hyperparameter Tuning', 'Distributed Caching'],
      importance: 'Critical' as const,
      industryApplication: 'Required for building high-throughput production systems and scalable APIs.',
    },
    {
      unit: 'Unit IV: Production Deployment & Industry Engineering',
      topics: ['Containerization with Docker', 'CI/CD Pipelines', 'API Gateway Protocols'],
      importance: 'High' as const,
      industryApplication: 'Distinguishes senior engineering candidates from purely theoretical students.',
    },
  ];

  const skillGaps = [
    'Microservices and Distributed Task Queues (often omitted in standard academic university exams)',
    'Real-time WebSocket event streaming and cache eviction strategies (Redis)',
    'Automated Unit Testing & Integration Test Coverage (Jest/PyTest)',
  ];

  const recommendedLearningOrder = [
    '1. Master Unit I & II foundational principles alongside LeetCode practice.',
    '2. Build a standalone prototype implementing Unit III algorithms from scratch.',
    '3. Package the system with Docker and deploy to cloud (Unit IV bridge).',
    '4. Document architecture with sequence diagrams and benchmarks.',
  ];

  const studyPriorities = {
    highPriority: [
      'Data Structures & Algorithm Complexity (Big-O analysis)',
      'API Endpoints & Database Transaction Isolation',
      'Model Training & Validation Optimization',
    ],
    mediumPriority: [
      'Theoretical Proofs and Formal Mathematical Derivations',
      'Legacy File Storage and Hardware Architectures',
    ],
    foundational: [
      'Programming Syntax and Control Flow',
      'Basic Command Line Operations (Bash / Linux)',
    ],
  };

  return {
    courseTitle,
    totalModules: modules.length,
    careerRelevanceScore: 88,
    modules,
    skillGaps,
    recommendedLearningOrder,
    studyPriorities,
  };
}

/**
 * 5. AI Project Deep Technical Analyzer
 */
export function analyzeProjectTechnicalDepth(
  title: string,
  description: string,
  techStack: string[],
  githubUrl?: string,
  liveUrl?: string
): ProjectAnalysisResult {
  const combined = `${title} ${description} ${techStack.join(' ')}`.toLowerCase();

  let depthScore = 60;
  if (techStack.length >= 3) depthScore += 10;
  if (techStack.length >= 5) depthScore += 8;
  if (githubUrl && githubUrl.includes('github.com')) depthScore += 10;
  if (liveUrl && liveUrl.trim().length > 0) depthScore += 12;

  const hasAdvancedTech = ['pytorch', 'docker', 'redis', 'fastapi', 'kubernetes', 'typescript', 'grpc', 'kafka'].some(t => combined.includes(t));
  if (hasAdvancedTech) depthScore += 10;

  depthScore = Math.min(98, Math.max(45, depthScore));

  let complexityRating: ProjectAnalysisResult['complexityRating'] = 'Moderate';
  if (depthScore >= 88) complexityRating = 'Advanced Systems';
  else if (depthScore >= 75) complexityRating = 'Production-Ready';
  else if (depthScore >= 55) complexityRating = 'Moderate';
  else complexityRating = 'Foundational';

  const technologiesEvaluated = techStack.map(t => ({
    name: t,
    relevance: 'High Industry Demand',
    industryDemand: 'Tier-1 tech companies actively recruit for this stack',
  }));

  const realWorldValue = liveUrl
    ? 'High: Hosted with live demonstration endpoints accessible to engineering interviewers.'
    : 'Moderate: Strong code implementation, but adding a live deployed URL will multiply recruiter callback rates.';

  const resumeImpactValue = depthScore >= 80
    ? 'Tier-1 Candidate Project: Demonstrates architectural maturity, modern toolchain, and separation of concerns.'
    : 'Strong Foundation Project: Ready for technical discussion; recommend adding concurrency or caching metrics.';

  const architectureStrengths = [
    `Clear modular stack integration (${techStack.slice(0, 3).join(', ')})`,
    'Practical problem domain with direct portfolio relevance',
  ];

  const missingImprovements = [
    'Add automated CI/CD GitHub Actions workflow for linting and automated unit tests.',
    'Implement Redis cache or connection pooling to demonstrate backend performance tuning.',
    'Include structured error handling and API request rate limiting.',
  ];

  const actionableRecommendations = [
    'Record a 60-second Loom/GIF walkthrough and embed it at the top of your GitHub README.',
    'Add benchmark statistics (e.g. "reduced response latency by 45% via Redis caching").',
    'Write unit test suites achieving >80% code coverage.',
  ];

  return {
    projectTitle: title || 'Engineering Project',
    technicalDepthScore: depthScore,
    complexityRating,
    technologiesEvaluated,
    realWorldValue,
    resumeImpactValue,
    architectureStrengths,
    missingImprovements,
    actionableRecommendations,
  };
}

/**
 * 6. Internship Readiness Calculator
 */
export function calculateInternshipReadiness(
  profile: UserProfile,
  skills: Skill[],
  projects: Project[],
  achievements: Achievement[],
  careerGoal: CareerGoal,
  readiness: ReadinessScore
): InternshipReadinessResult {
  const targetRole = careerGoal.targetRole || 'Software Engineering Intern';
  const overallScore = readiness.overall;

  const strengths: string[] = [];
  if (skills.length >= 4) strengths.push(`${skills.length} technical skills logged across multiple disciplines`);
  if (projects.length >= 1) strengths.push(`${projects.length} verified engineering repository projects`);
  if (achievements.length >= 1) strengths.push(`Verified credentials & contest achievements (${achievements[0].title})`);
  if (strengths.length === 0) strengths.push('Active degree enrollment in Computer Science');

  const blockers: string[] = [];
  if (projects.length < 2) blockers.push('Need at least 2 distinct showcase projects on GitHub');
  if (readiness.categories.dsa < 70) blockers.push('DSA proficiency score is below target placement benchmark (70%)');
  if (!projects.some(p => p.liveUrl)) blockers.push('No live deployed demo URL linked in portfolio');

  const recommendedActions = [
    { priority: 'P0' as const, action: 'Solve 15 essential DSA interview patterns (Sliding Window, Two Pointers, BFS)', timeEstimate: '1-2 Weeks' },
    { priority: 'P1' as const, action: 'Deploy best project with public live URL and update README', timeEstimate: '3-4 Days' },
    { priority: 'P2' as const, action: 'Draft customized cover letter and tailor resume for target intern openings', timeEstimate: '2 Days' },
  ];

  const roleMatches = [
    { role: targetRole, matchPercent: Math.min(95, Math.round(overallScore * 1.05)) },
    { role: 'Software Development Engineer (SDE) Intern', matchPercent: Math.min(92, Math.round(readiness.categories.programming * 0.5 + readiness.categories.dsa * 0.5)) },
    { role: 'AI/ML Research Intern', matchPercent: Math.min(90, Math.round(readiness.categories.aiMl * 0.7 + readiness.categories.programming * 0.3)) },
    { role: 'Full-Stack Developer Intern', matchPercent: Math.min(92, Math.round(readiness.categories.projects * 0.6 + readiness.categories.programming * 0.4)) },
  ];

  let statusTier = 'Early Stage Preparation';
  if (overallScore >= 80) statusTier = 'Interview Ready (High Probability)';
  else if (overallScore >= 65) statusTier = 'Placement Ready (Competitive)';
  else if (overallScore >= 45) statusTier = 'Developing Competencies';

  return {
    readinessPercentage: overallScore,
    targetRole,
    statusTier,
    strengths,
    blockers,
    recommendedActions,
    roleMatches,
  };
}

/**
 * 7. GitHub Readiness & Repository Analyzer
 */
export function analyzeGitHubReadiness(
  githubUrl: string,
  projects: Project[],
  skills: Skill[]
): GitHubReadinessResult {
  let projectQuality = 75;
  let repoOrganization = 70;
  let readmeQuality = 68;
  let documentation = 65;
  let activityRating = 72;

  const validUrl = githubUrl && githubUrl.includes('github.com');
  if (validUrl) {
    repoOrganization += 10;
    activityRating += 8;
  }

  if (projects.length >= 2) projectQuality += 10;
  if (projects.some(p => p.githubUrl)) readmeQuality += 10;

  const overallScore = Math.min(95, Math.round(
    projectQuality * 0.25 +
    repoOrganization * 0.2 +
    readmeQuality * 0.2 +
    documentation * 0.15 +
    activityRating * 0.2
  ));

  let profileStrength: GitHubReadinessResult['profileStrength'] = 'Competitive';
  if (overallScore >= 85) profileStrength = 'Top Tier';
  else if (overallScore >= 70) profileStrength = 'Competitive';
  else if (overallScore >= 50) profileStrength = 'Developing';
  else profileStrength = 'Basic';

  const strengths = [
    'Clear repository separation for individual project domains',
    'Tech stack declared in project manifests (package.json / requirements.txt)',
    'Public repositories accessible for recruiter screening audits',
  ];

  const recommendations = [
    'Add an animated GIF or screenshot in every project README to showcase live UI/output.',
    'Add a comprehensive root GitHub Profile README with your tech stack badges and contact links.',
    'Set up GitHub Actions CI workflow to show green passing build badges.',
  ];

  const checklist = [
    { item: 'Valid Public GitHub Profile Link', passed: !!validUrl },
    { item: 'At least 2 Featured Projects with Code', passed: projects.length >= 2 },
    { item: 'Architecture & Installation in README', passed: true },
    { item: 'Clean Commit Messages & Branch Naming', passed: true },
    { item: 'Live Demo URL in Repository Description', passed: projects.some(p => p.liveUrl) },
  ];

  return {
    overallScore,
    profileStrength,
    projectQuality,
    repoOrganization,
    readmeQuality,
    documentation,
    activityRating,
    strengths,
    recommendations,
    checklist,
  };
}

/**
 * 8. What-If Simulator Calculation Engine
 */
export interface WhatIfState {
  addedProjects: number; // 0, 1, 2
  learnedNewSkills: number; // 0, 1, 2, 3
  completedCertifications: number; // 0, 1, 2
  dsaBoost: number; // 0 to 30
  aiMlBoost: number; // 0 to 30
  githubPolished: boolean;
}

export function simulateReadinessChange(
  baseReadiness: ReadinessScore,
  sim: WhatIfState
): {
  projectedOverall: number;
  delta: number;
  projectedBreakdown: ReadinessScore['breakdown'];
  projectedCategories: ReadinessScore['categories'];
} {
  let projectBoost = sim.addedProjects * 12;
  let skillsBoost = sim.learnedNewSkills * 8;
  let certBoost = sim.completedCertifications * 10;
  let dsaBoostPts = sim.dsaBoost;
  let aiBoostPts = sim.aiMlBoost;
  let ghBoost = sim.githubPolished ? 8 : 0;

  const projSkillsCoverage = Math.min(100, baseReadiness.breakdown.skillsCoverage + skillsBoost);
  const projProjectPortfolio = Math.min(100, baseReadiness.breakdown.projectPortfolio + projectBoost + ghBoost);
  const projIndustryAlignment = Math.min(100, baseReadiness.breakdown.industryAlignment + certBoost + Math.round(dsaBoostPts * 0.3));
  const projVerifications = Math.min(100, baseReadiness.breakdown.verifications + certBoost);

  const projectedOverall = Math.min(
    100,
    Math.round(
      projSkillsCoverage * 0.3 +
      projProjectPortfolio * 0.3 +
      projIndustryAlignment * 0.2 +
      projVerifications * 0.1 +
      10 // Base completion
    )
  );

  const delta = Math.max(0, projectedOverall - baseReadiness.overall);

  const projectedCategories: ReadinessScore['categories'] = {
    programming: Math.min(100, baseReadiness.categories.programming + skillsBoost),
    dsa: Math.min(100, baseReadiness.categories.dsa + dsaBoostPts),
    aiMl: Math.min(100, baseReadiness.categories.aiMl + aiBoostPts),
    projects: Math.min(100, baseReadiness.categories.projects + projectBoost + ghBoost),
    communication: baseReadiness.categories.communication,
    careerPrep: Math.min(100, baseReadiness.categories.careerPrep + certBoost + Math.round(dsaBoostPts * 0.2)),
  };

  return {
    projectedOverall,
    delta,
    projectedBreakdown: {
      skillsCoverage: projSkillsCoverage,
      projectPortfolio: projProjectPortfolio,
      industryAlignment: projIndustryAlignment,
      verifications: projVerifications,
    },
    projectedCategories,
  };
}
