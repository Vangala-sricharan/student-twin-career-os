import {
  Project,
  ProjectAnalysisRecord,
  ProjectCategoryScores,
  ProjectRepoEvidence,
  ProjectAnalysisEvidence,
} from '../types';

export interface ProjectAnalysisRequest {
  userId: string;
  projectId: string;
  projectTitle: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  role?: string;
  difficulty?: string;
  status?: string;
}

export function validateProjectGitHubUrl(url?: string): {
  isValid: boolean;
  owner?: string;
  repo?: string;
  cleanUrl?: string;
} {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { isValid: false };
  }

  const trimmed = url.trim().replace(/\/+$/, '');
  const match = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)$/i);

  if (!match) {
    return { isValid: false, cleanUrl: trimmed };
  }

  return {
    isValid: true,
    owner: match[1],
    repo: match[2].replace(/\.git$/, ''),
    cleanUrl: `https://github.com/${match[1]}/${match[2].replace(/\.git$/, '')}`,
  };
}

export async function fetchPublicProjectRepoData(
  owner: string,
  repo: string
): Promise<ProjectRepoEvidence> {
  try {
    const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return {
        repoFullName: `${owner}/${repo}`,
        isVerified: false,
        verificationMessage: `GitHub repository https://github.com/${owner}/${repo} returned HTTP ${res.status} (private, non-existent, or API limit).`,
      };
    }

    const data = await res.json();
    const defaultBranch = data.default_branch || 'main';

    let hasReadme = false;
    let readmeSnippet = '';

    try {
      const readmeRes = await fetch(
        `https://raw.githubusercontent.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${defaultBranch}/README.md`
      );
      if (readmeRes.ok) {
        hasReadme = true;
        const text = await readmeRes.text();
        readmeSnippet = text.slice(0, 300);
      }
    } catch {
      hasReadme = false;
    }

    return {
      repoFullName: data.full_name || `${owner}/${repo}`,
      name: data.name,
      description: data.description || null,
      stars: data.stargazers_count || 0,
      forks: data.forks_count || 0,
      primaryLanguage: data.language || null,
      hasReadme,
      readmeSnippet: readmeSnippet || undefined,
      lastPushedAt: data.pushed_at || null,
      topics: Array.isArray(data.topics) ? data.topics : [],
      isVerified: true,
      verificationMessage: `Verified active repository on GitHub (${data.stargazers_count || 0} stars, ${data.language || 'Code'}).`,
    };
  } catch (err) {
    return {
      repoFullName: `${owner}/${repo}`,
      isVerified: false,
      verificationMessage: 'Could not connect to GitHub API. Repository status unverified.',
    };
  }
}

/**
 * Intelligent evidence-based analysis engine.
 * Generates distinct, tailored scores & recommendations based on the actual project metadata.
 */
export function analyzeProjectEvidenceLocally(
  req: ProjectAnalysisRequest,
  repoData?: ProjectRepoEvidence
): ProjectAnalysisRecord {
  const title = (req.projectTitle || '').trim();
  const desc = (req.description || '').trim();
  const techStack = Array.isArray(req.techStack) ? req.techStack.map(t => t.trim()).filter(Boolean) : [];
  const githubUrl = req.githubUrl?.trim();
  const liveUrl = req.liveUrl?.trim();
  const difficulty = (req.difficulty || 'Intermediate').toLowerCase();
  const status = (req.status || 'In Progress').toLowerCase();
  const combinedText = `${title} ${desc} ${techStack.join(' ')} ${difficulty} ${status}`.toLowerCase();

  // 1. Evidence Extraction
  const hasDatabase = ['postgres', 'postgresql', 'mysql', 'mongodb', 'sqlite', 'supabase', 'firebase', 'prisma', 'firestore', 'dynamodb', 'redis', 'cassandra'].some(d => combinedText.includes(d));
  const hasAuth = ['jwt', 'oauth', 'auth0', 'supabase auth', 'firebase auth', 'bcrypt', 'passport', 'session', 'clerk', 'cognito', 'nextauth', 'login', 'authentication'].some(a => combinedText.includes(a));
  const hasTesting = ['jest', 'vitest', 'pytest', 'cypress', 'playwright', 'mocha', 'junit', 'unit test', 'integration test', 'tdd'].some(t => combinedText.includes(t));
  const hasCiCd = ['github actions', 'ci/cd', 'docker', 'kubernetes', 'gitlab ci', 'jenkins', 'argo', 'terraform'].some(c => combinedText.includes(c));
  const hasDockerOrK8s = ['docker', 'dockerfile', 'kubernetes', 'k8s', 'container'].some(k => combinedText.includes(k));
  const hasLiveDemo = Boolean(liveUrl && liveUrl.startsWith('http'));
  const hasVerifiedRepo = Boolean(repoData?.isVerified);

  // 2. Score Architecture & System Design (Max 20)
  let archScore = 8;
  if (desc.length > 50) archScore += 3;
  if (desc.length > 120) archScore += 3;
  if (techStack.length >= 3) archScore += 2;
  if (techStack.length >= 5) archScore += 2;
  if (difficulty === 'production' || difficulty === 'advanced') archScore += 2;
  archScore = Math.min(20, Math.max(5, archScore));

  // 3. Technical Complexity (Max 20)
  let complexityScore = 7;
  const advancedKeywords = ['pytorch', 'tensorflow', 'machine learning', 'distributed', 'fastapi', 'microservice', 'websocket', 'socket.io', 'redis', 'compiler', 'algorithm', 'concurrency', 'grpc', 'kafka', 'llm', 'embedding', 'rag'];
  const advancedHits = advancedKeywords.filter(k => combinedText.includes(k)).length;
  complexityScore += Math.min(8, advancedHits * 3);
  if (difficulty === 'production') complexityScore += 5;
  else if (difficulty === 'advanced') complexityScore += 3;
  else if (difficulty === 'basic' || difficulty === 'beginner') complexityScore = Math.min(10, complexityScore);
  complexityScore = Math.min(20, Math.max(4, complexityScore));

  // 4. Technology Stack (Max 15)
  let techScore = 6;
  if (techStack.length >= 2) techScore += 3;
  if (techStack.length >= 4) techScore += 3;
  if (techStack.some(t => ['typescript', 'python', 'go', 'rust', 'react', 'next.js', 'fastapi', 'node.js'].includes(t.toLowerCase()))) techScore += 3;
  techScore = Math.min(15, Math.max(4, techScore));

  // 5. Data / Backend / Database Design (Max 15)
  let dataScore = 3;
  if (hasDatabase) dataScore += 7;
  if (combinedText.includes('migration') || combinedText.includes('schema') || combinedText.includes('indexing') || combinedText.includes('prisma') || combinedText.includes('orm')) dataScore += 3;
  if (combinedText.includes('redis') || combinedText.includes('cache')) dataScore += 2;
  dataScore = Math.min(15, Math.max(2, dataScore));

  // 6. Security & Authentication (Max 10)
  let secScore = 2;
  if (hasAuth) secScore += 5;
  if (combinedText.includes('rbac') || combinedText.includes('jwt') || combinedText.includes('cors') || combinedText.includes('rate limit') || combinedText.includes('encryption')) secScore += 3;
  secScore = Math.min(10, Math.max(1, secScore));

  // 7. Scalability & Performance (Max 10)
  let scaleScore = 2;
  if (hasDockerOrK8s) scaleScore += 3;
  if (combinedText.includes('cache') || combinedText.includes('async') || combinedText.includes('queue') || combinedText.includes('load balance') || combinedText.includes('cluster')) scaleScore += 3;
  if (status === 'completed' && hasLiveDemo) scaleScore += 2;
  scaleScore = Math.min(10, Math.max(1, scaleScore));

  // 8. Testing & Reliability (Max 5)
  let testScore = 1;
  if (hasTesting) testScore += 3;
  if (repoData?.hasReadme) testScore += 1;
  testScore = Math.min(5, Math.max(1, testScore));

  // 9. Deployment & DevOps (Max 5)
  let devopsScore = 1;
  if (hasLiveDemo) devopsScore += 2;
  if (hasCiCd || hasDockerOrK8s) devopsScore += 2;
  devopsScore = Math.min(5, Math.max(1, devopsScore));

  const totalScore = archScore + complexityScore + techScore + dataScore + secScore + scaleScore + testScore + devopsScore;

  // Complexity Rating
  let complexityRating: ProjectAnalysisRecord['complexityRating'] = 'Moderate';
  if (totalScore >= 82) complexityRating = 'Advanced Systems';
  else if (totalScore >= 68) complexityRating = 'Production-Ready';
  else if (totalScore >= 48) complexityRating = 'Moderate';
  else complexityRating = 'Foundational';

  // Resume Impact Rating
  let rating: ProjectAnalysisRecord['rating'] = 'Moderate Impact';
  if (totalScore >= 80) rating = 'High Impact';
  else if (totalScore >= 65) rating = 'Strong Impact';
  else if (totalScore >= 48) rating = 'Moderate Impact';
  else rating = 'Needs Improvement';

  // Project-specific Real World Value
  let realWorldValue = '';
  if (hasLiveDemo && status === 'completed') {
    realWorldValue = `High Deployment Readiness: Deployed live demo demonstrates full operational lifecycle. Direct evidence of engineering execution for ${techStack.slice(0, 3).join(', ')}.`;
  } else if (hasDatabase && hasAuth) {
    realWorldValue = `Practical Application Utility: Integrates persistent data stores and user access boundaries for ${title}. Adding an active live demo endpoint will maximize recruiter engagement.`;
  } else if (hasLiveDemo) {
    realWorldValue = `Interactive Showcase: Accessible live interface allows interviewers to test user workflows, though backend data persistence or automated state handling should be verified.`;
  } else {
    realWorldValue = `Foundational Codebase: Strong conceptual implementation for ${title}. Needs cloud hosting, live endpoints, and benchmark metrics to substantiate real-world traffic readiness.`;
  }

  // Project-specific Resume Impact
  let resumeImpact = '';
  if (totalScore >= 80) {
    resumeImpact = `Tier-1 Technical Asset: Demonstrates multi-tier architecture, production toolchain (${techStack.slice(0, 3).join(', ')}), and clear separation of concerns. Highlight latency or throughput gains on your resume.`;
  } else if (totalScore >= 65) {
    resumeImpact = `Competitive Engineering Project: Strong portfolio piece for ${req.role || 'Software Engineering'} interviews. Quantify specific user impact and algorithmic trade-offs in your resume bullet points.`;
  } else if (totalScore >= 50) {
    resumeImpact = `Promising Core Project: Good demonstration of ${techStack.slice(0, 2).join(' & ')} fundamentals. Elevate from classroom project to production caliber by adding automated test suites and live deployment.`;
  } else {
    resumeImpact = `Introductory Portfolio Project: Validates initial syntax and modularity, but requires deeper architectural scope, persistent storage, and error handling to stand out to technical interviewers.`;
  }

  // Missing Production Upgrades (Context-aware — only recommends what is genuinely missing!)
  const missingUpgrades: string[] = [];
  if (!hasTesting) {
    missingUpgrades.push('Automated Test Suite: Implement unit/integration tests with Vitest, PyTest, or Jest to establish baseline code reliability.');
  }
  if (!hasCiCd && !hasDockerOrK8s) {
    missingUpgrades.push('CI/CD Pipeline & Containerization: Configure GitHub Actions for automated linting/tests and provide a Dockerfile for reproducible builds.');
  }
  if (!hasAuth && (difficulty === 'advanced' || difficulty === 'production' || hasDatabase)) {
    missingUpgrades.push('Authentication & Security: Implement JWT, OAuth 2.0, or RBAC route guards to protect API endpoints and sensitive operations.');
  }
  if (!hasDatabase && (difficulty === 'advanced' || difficulty === 'production')) {
    missingUpgrades.push('Persistent Data Layer: Integrate a managed database (PostgreSQL, Supabase, or MongoDB) with migrations and connection pooling.');
  }
  if (!hasLiveDemo) {
    missingUpgrades.push('Live Cloud Deployment: Deploy to Vercel, Render, AWS, or Cloud Run to give recruiters instant clickable verification.');
  }
  if (!repoData?.hasReadme) {
    missingUpgrades.push('Technical README & Architecture Diagram: Add system diagrams, setup commands, and API endpoint documentation.');
  }
  if (missingUpgrades.length < 3) {
    missingUpgrades.push('Performance Benchmarking: Log API response latency, caching hit rates, or memory profiles to substantiate scalability.');
  }

  // Actionable Recommendations (Tailored specifically to project gaps)
  const recommendations: string[] = [];
  if (!hasLiveDemo) {
    recommendations.push(`Host a live demo on Vercel or Render and link it in the header of ${title}'s repository.`);
  }
  if (!hasTesting) {
    recommendations.push(`Write 5-10 core integration tests covering critical business logic for ${title}.`);
  }
  recommendations.push(`Record a 45-second visual demo or GIF and place it prominently in the repository README.`);
  if (hasDatabase && !combinedText.includes('redis')) {
    recommendations.push(`Add Redis caching or connection pooling to demonstrate backend performance tuning.`);
  } else if (!hasAuth) {
    recommendations.push(`Add token-based session handling or Supabase Auth to demonstrate end-to-end user security.`);
  } else {
    recommendations.push(`Add structured structured logging and healthcheck endpoints (/api/health) for observability.`);
  }

  // Technologies Evaluated
  const technologiesEvaluated = techStack.length > 0
    ? techStack.map(t => {
        const lower = t.toLowerCase();
        let relevance = 'High Industry Demand';
        let demand = 'Frequently sought by tech recruiters and hiring teams';
        if (['pytorch', 'fastapi', 'python', 'gemini ai', 'docker', 'kubernetes', 'typescript', 'postgresql'].includes(lower)) {
          relevance = 'Tier-1 Engineering Core';
          demand = 'High-growth tech companies and AI enterprises actively seek this stack';
        } else if (['react', 'node.js', 'next.js', 'tailwind css', 'express', 'supabase'].includes(lower)) {
          relevance = 'Production Standard';
          demand = 'Standard industry toolkit for modern cloud-native web applications';
        }
        return { name: t, relevance, industryDemand: demand };
      })
    : [{ name: 'Core Architecture', relevance: 'Baseline', industryDemand: 'Foundational programming concepts' }];

  // Architecture Strengths
  const architectureStrengths: string[] = [];
  if (techStack.length >= 3) {
    architectureStrengths.push(`Modular multi-tier stack integration (${techStack.slice(0, 3).join(', ')})`);
  }
  if (hasDatabase) {
    architectureStrengths.push('Dedicated persistent storage layer decoupled from business logic');
  }
  if (hasAuth) {
    architectureStrengths.push('Authenticated session boundary and user authorization controls');
  }
  if (hasLiveDemo) {
    architectureStrengths.push('Live deployment configuration with public web accessibility');
  }
  if (architectureStrengths.length === 0) {
    architectureStrengths.push(`Targeted problem domain addressing ${title}`);
    architectureStrengths.push('Organized repository component structure');
  }

  const categoryScores: ProjectCategoryScores = {
    architectureSystemDesign: archScore,
    technicalComplexity: complexityScore,
    technologyStack: techScore,
    dataBackendDatabase: dataScore,
    securityAuthentication: secScore,
    scalabilityPerformance: scaleScore,
    testingReliability: testScore,
    deploymentDevops: devopsScore,
  };

  const evidence: ProjectAnalysisEvidence = {
    projectId: req.projectId,
    projectTitle: title,
    description: desc,
    techStack,
    githubUrl,
    liveUrl,
    role: req.role,
    difficulty: req.difficulty,
    status: req.status,
    githubRepoData: repoData,
    liveDemoVerified: hasLiveDemo,
    hasDatabase,
    hasAuth,
    hasTesting,
    hasCiCd,
    hasDockerOrK8s,
  };

  return {
    id: `audit_${req.projectId}_${Date.now()}`,
    userId: req.userId,
    projectId: req.projectId,
    projectTitle: title,
    analysisDate: new Date().toISOString(),
    technicalDepthScore: totalScore,
    complexityRating,
    rating,
    realWorldValue,
    resumeImpact,
    resumeImpactValue: resumeImpact,
    missingProductionUpgrades: missingUpgrades.slice(0, 3),
    missingImprovements: missingUpgrades.slice(0, 3),
    actionableRecommendations: recommendations.slice(0, 3),
    architectureStrengths,
    technologiesEvaluated,
    categoryScores,
    evidence,
  };
}

/**
 * Main entry point: Audits project technical depth using live GitHub data and Gemini AI / server.
 */
export async function auditProjectTechnicalDepth(
  req: ProjectAnalysisRequest
): Promise<ProjectAnalysisRecord> {
  // Step 1: Validate and inspect GitHub repo if URL is supplied
  let repoEvidence: ProjectRepoEvidence | undefined;
  const ghValidation = validateProjectGitHubUrl(req.githubUrl);

  if (ghValidation.isValid && ghValidation.owner && ghValidation.repo) {
    repoEvidence = await fetchPublicProjectRepoData(ghValidation.owner, ghValidation.repo);
  } else if (req.githubUrl && req.githubUrl.trim().length > 0) {
    repoEvidence = {
      isVerified: false,
      verificationMessage: 'Invalid GitHub URL format. Expected: https://github.com/username/repository',
    };
  }

  const analysisPayload = {
    ...req,
    githubEvidence: repoEvidence,
  };

  let aiResult: ProjectAnalysisRecord | null = null;

  // Step 2: Try Server-Side Gemini AI Endpoint
  try {
    const res = await fetch('/api/analyze-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysisPayload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.technicalDepthScore === 'number') {
        aiResult = {
          ...data,
          id: data.id || `audit_${req.projectId}_${Date.now()}`,
          userId: req.userId,
          projectId: req.projectId,
          projectTitle: req.projectTitle,
          analysisDate: new Date().toISOString(),
          resumeImpactValue: data.resumeImpact || data.resumeImpactValue || 'Strong Impact',
          missingImprovements: data.missingProductionUpgrades || data.missingImprovements || [],
        };
      }
    }
  } catch (err) {
    console.warn('Server-side AI project audit call note (using evidence analyzer):', err);
  }

  // Step 3: Fallback to evidence-based deterministic engine if AI endpoint is offline
  const finalAnalysis = aiResult || analyzeProjectEvidenceLocally(req, repoEvidence);

  // Requirement 18 Debug Logging
  console.log('=== [PROJECT ANALYZER DEBUG LOG] ===');
  console.log('selectedProjectId:', req.projectId);
  console.log('projectTitle:', req.projectTitle);
  console.log('githubUrl:', req.githubUrl || 'N/A');
  console.log('liveDemoUrl:', req.liveUrl || 'N/A');
  console.log('analysisRequest:', JSON.stringify(analysisPayload, null, 2));
  console.log('AI response (or Evidence Engine):', JSON.stringify(finalAnalysis, null, 2));
  console.log('finalScore:', finalAnalysis.technicalDepthScore);
  console.log('====================================');

  return finalAnalysis;
}
