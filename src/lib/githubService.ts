import { GitHubProfileEvidence, GitHubReadinessAnalysis, GitHubCategoryScores } from '../types';

export interface GithubUrlValidationResult {
  valid: boolean;
  username: string | null;
  normalizedUrl: string | null;
  error?: string;
}

const RESERVED_GITHUB_NAMES = new Set([
  'about', 'account', 'admin', 'api', 'apps', 'blog', 'business', 'careers',
  'changelog', 'cla', 'codereview', 'collections', 'community', 'contact',
  'dashboard', 'developer', 'discover', 'discussions', 'docs', 'events',
  'explore', 'features', 'gist', 'help', 'home', 'issues', 'join', 'login',
  'marketplace', 'mobile', 'new', 'news', 'notifications', 'organizations',
  'orgs', 'pricing', 'projects', 'pulls', 'readme', 'repositories', 'search',
  'security', 'session', 'settings', 'signup', 'site', 'sponsors', 'stars',
  'status', 'support', 'team', 'topics', 'trending', 'users', 'watching',
]);

/**
 * Validates whether the entered string is a valid public GitHub profile URL
 */
export function validateGithubUrl(rawInput: string): GithubUrlValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, username: null, normalizedUrl: null, error: 'GitHub profile URL cannot be empty.' };
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { valid: false, username: null, normalizedUrl: null, error: 'GitHub profile URL cannot be empty.' };
  }

  let urlObj: URL;
  try {
    const withProto = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    urlObj = new URL(withProto);
  } catch {
    return { valid: false, username: null, normalizedUrl: null, error: 'Invalid GitHub profile URL' };
  }

  // Must belong to github.com
  const hostname = urlObj.hostname.toLowerCase();
  if (hostname !== 'github.com' && hostname !== 'www.github.com') {
    return { valid: false, username: null, normalizedUrl: null, error: 'Invalid GitHub profile URL (Must belong to github.com)' };
  }

  // Path segments
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  if (pathSegments.length === 0) {
    return { valid: false, username: null, normalizedUrl: null, error: 'Invalid GitHub profile URL (Username missing)' };
  }

  const username = pathSegments[0];

  if (RESERVED_GITHUB_NAMES.has(username.toLowerCase())) {
    return { valid: false, username: null, normalizedUrl: null, error: 'Invalid GitHub profile URL (Reserved path)' };
  }

  // GitHub username constraints: 1-39 chars, alphanumeric or single hyphens, cannot start or end with hyphen
  const ghUsernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  if (!ghUsernameRegex.test(username)) {
    return { valid: false, username: null, normalizedUrl: null, error: 'Invalid GitHub username in URL' };
  }

  return {
    valid: true,
    username,
    normalizedUrl: `https://github.com/${username}`,
  };
}

/**
 * Fetches real public GitHub profile data and repositories
 */
export async function fetchRealGithubProfileData(
  username: string,
  onProgress?: (step: string) => void
): Promise<GitHubProfileEvidence> {
  onProgress?.('Fetching public profile data...');

  // 1. Fetch User Profile
  const userRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (userRes.status === 404) {
    throw new Error('GitHub profile not found.');
  }

  if (userRes.status === 403) {
    throw new Error('GitHub API rate limit exceeded or access restricted. Please try again in a few moments.');
  }

  if (!userRes.ok) {
    throw new Error(`GitHub profile could not be accessed. Status: ${userRes.status}`);
  }

  const userData = await userRes.json();

  onProgress?.('Reviewing repositories...');

  // 2. Fetch Public Repositories (up to 30 sorted by most recently pushed)
  let repoData: any[] = [];
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&direction=desc&per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    if (reposRes.ok) {
      repoData = await reposRes.json();
    }
  } catch (err) {
    console.warn('Could not fetch GitHub repositories list:', err);
  }

  onProgress?.('Evaluating profile README & documentation...');

  // 3. Check for Profile README (username/username repo)
  let hasProfileReadme = false;
  let profileReadmeSnippet: string | undefined;

  try {
    // Try main branch then master branch
    const readmeRes = await fetch(
      `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/main/README.md`
    );
    if (readmeRes.ok) {
      hasProfileReadme = true;
      const text = await readmeRes.text();
      profileReadmeSnippet = text.slice(0, 300);
    } else {
      const readmeMasterRes = await fetch(
        `https://raw.githubusercontent.com/${encodeURIComponent(username)}/${encodeURIComponent(username)}/master/README.md`
      );
      if (readmeMasterRes.ok) {
        hasProfileReadme = true;
        const text = await readmeMasterRes.text();
        profileReadmeSnippet = text.slice(0, 300);
      }
    }
  } catch {}

  onProgress?.('Evaluating project quality & activity...');

  // 4. Analyze repository metrics
  let totalStars = 0;
  let totalForks = 0;
  let hasLiveDemoLinks = false;
  let lastActivityDate: string | null = null;
  const languageCounts: Record<string, number> = {};

  const mappedRepos = (Array.isArray(repoData) ? repoData : []).map((r: any) => {
    const stars = Number(r.stargazers_count) || 0;
    const forks = Number(r.forks_count) || 0;
    const lang = r.language || null;
    const homepage = (r.homepage && typeof r.homepage === 'string' && r.homepage.trim().length > 0) ? r.homepage.trim() : null;
    const desc = r.description || null;

    totalStars += stars;
    totalForks += forks;

    if (homepage || (desc && (desc.includes('http://') || desc.includes('https://')))) {
      hasLiveDemoLinks = true;
    }

    if (lang) {
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    }

    const pushed = r.pushed_at || r.updated_at;
    if (pushed) {
      if (!lastActivityDate || new Date(pushed) > new Date(lastActivityDate)) {
        lastActivityDate = pushed;
      }
    }

    return {
      name: r.name || 'repository',
      description: desc,
      language: lang,
      stars,
      forks,
      updatedAt: r.updated_at || new Date().toISOString(),
      homepage,
      topics: Array.isArray(r.topics) ? r.topics : [],
      isFork: !!r.fork,
    };
  });

  // Calculate language distribution
  const totalLangsCount = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  const topLanguages = Object.entries(languageCounts)
    .map(([language, count]) => ({
      language,
      count,
      percentage: totalLangsCount > 0 ? Math.round((count / totalLangsCount) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    username: userData.login || username,
    profileUrl: userData.html_url || `https://github.com/${username}`,
    name: userData.name || undefined,
    bio: userData.bio || undefined,
    avatarUrl: userData.avatar_url || undefined,
    publicReposCount: Number(userData.public_repos) || 0,
    followersCount: Number(userData.followers) || 0,
    followingCount: Number(userData.following) || 0,
    company: userData.company || undefined,
    location: userData.location || undefined,
    blog: userData.blog || undefined,
    createdAt: userData.created_at || undefined,
    updatedAt: userData.updated_at || undefined,
    hasProfileReadme,
    profileReadmeSnippet,
    analyzedReposCount: mappedRepos.length,
    topLanguages,
    lastActivityDate,
    totalStars,
    totalForks,
    hasLiveDemoLinks,
    repositories: mappedRepos,
  };
}

/**
 * Calculates evidence-based GitHub readiness score based ONLY on real collected public data
 */
export function calculateGithubReadiness(
  evidence: GitHubProfileEvidence,
  userId: string
): GitHubReadinessAnalysis {
  const originalRepos = evidence.repositories.filter((r) => !r.isFork);
  const reposWithDesc = originalRepos.filter((r) => r.description && r.description.trim().length > 15);
  const reposWithTopics = originalRepos.filter((r) => r.topics && r.topics.length > 0);
  const reposWithLiveLinks = originalRepos.filter((r) => r.homepage || (r.description && r.description.includes('http')));

  // 1. Profile Quality (Max 15)
  let profileQuality = 0;
  if (evidence.name && evidence.name.trim().length > 0) profileQuality += 3;
  if (evidence.bio && evidence.bio.trim().length > 0) profileQuality += 3;
  if (evidence.hasProfileReadme) profileQuality += 4;
  if (evidence.location || evidence.company || evidence.blog) profileQuality += 3;
  if (evidence.avatarUrl) profileQuality += 2;
  profileQuality = Math.min(15, profileQuality);

  // 2. Project Quality (Max 25)
  let projectQuality = 0;
  const originalCount = originalRepos.length;
  if (originalCount >= 1) projectQuality += 6;
  if (originalCount >= 2) projectQuality += 6;
  if (originalCount >= 4) projectQuality += 5;
  if (originalCount >= 6) projectQuality += 3;

  // Language diversity
  if (evidence.topLanguages.length >= 2) projectQuality += 3;
  if (evidence.topLanguages.length >= 4) projectQuality += 2;

  // Stars / Community signals
  if (evidence.totalStars >= 1) projectQuality += 2;
  if (evidence.totalStars >= 5) projectQuality += 2;
  if (evidence.totalForks >= 1) projectQuality += 1;
  projectQuality = Math.min(25, projectQuality);

  // 3. README / Documentation (Max 20)
  let documentation = 0;
  if (evidence.hasProfileReadme) documentation += 5;
  const descRatio = originalCount > 0 ? reposWithDesc.length / originalCount : 0;
  documentation += Math.round(descRatio * 10);
  if (reposWithDesc.length >= 3) documentation += 5;
  documentation = Math.min(20, documentation);

  // 4. Repository Organization (Max 15)
  let organization = 0;
  if (originalCount > 0) {
    const nonForkRatio = originalCount / Math.max(1, evidence.repositories.length);
    organization += Math.round(nonForkRatio * 5);
  }
  const topicRatio = originalCount > 0 ? reposWithTopics.length / originalCount : 0;
  organization += Math.round(topicRatio * 5);
  if (originalRepos.some((r) => r.name.includes('-') || r.name.includes('_') || /^[a-z0-9-]+$/.test(r.name))) {
    organization += 5;
  }
  organization = Math.min(15, organization);

  // 5. Activity / Consistency (Max 15)
  let activity = 0;
  if (evidence.lastActivityDate) {
    const daysSincePush = Math.floor(
      (Date.now() - new Date(evidence.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePush <= 30) activity += 15;
    else if (daysSincePush <= 90) activity += 11;
    else if (daysSincePush <= 180) activity += 7;
    else if (daysSincePush <= 365) activity += 4;
    else activity += 2;
  } else if (evidence.publicReposCount > 0) {
    activity += 3;
  }
  activity = Math.min(15, activity);

  // 6. Engineering Presentation (Max 10)
  let engineeringPresentation = 0;
  if (evidence.hasLiveDemoLinks || reposWithLiveLinks.length > 0) {
    engineeringPresentation += 6;
  }
  if (evidence.blog && evidence.blog.startsWith('http')) {
    engineeringPresentation += 2;
  }
  if (evidence.topLanguages.length >= 2) {
    engineeringPresentation += 2;
  }
  engineeringPresentation = Math.min(10, engineeringPresentation);

  // Total Overall Score = Sum of categories (0 to 100)
  const overallScore = Math.min(
    100,
    profileQuality + projectQuality + documentation + organization + activity + engineeringPresentation
  );

  let profileStrength: GitHubReadinessAnalysis['profileStrength'] = 'Developing';
  if (overallScore >= 85) profileStrength = 'Top Tier';
  else if (overallScore >= 70) profileStrength = 'Competitive';
  else if (overallScore >= 50) profileStrength = 'Developing';
  else profileStrength = 'Basic';

  const categories: GitHubCategoryScores = {
    profileQuality,
    projectQuality,
    documentation,
    organization,
    activity,
    engineeringPresentation,
  };

  // Generate Evidence-Based Strengths
  const strengths: string[] = [];
  if (originalCount >= 3) {
    strengths.push(`Strong portfolio breadth with ${originalCount} original public engineering repositories.`);
  } else if (originalCount > 0) {
    strengths.push(`Published ${originalCount} public repositories demonstrating active coding capability.`);
  }
  if (evidence.hasProfileReadme) {
    strengths.push('Active profile README configured to showcase developer identity and contact channels.');
  }
  if (evidence.topLanguages.length >= 2) {
    strengths.push(`Polyglot language footprint spanning ${evidence.topLanguages.slice(0, 3).map((l) => l.language).join(', ')}.`);
  }
  if (evidence.hasLiveDemoLinks) {
    strengths.push('Included live demo or hosted deployment links accessible to technical recruiters.');
  }
  if (evidence.totalStars >= 3) {
    strengths.push(`Earned ${evidence.totalStars} GitHub stars from the developer community.`);
  }
  if (strengths.length === 0) {
    strengths.push('Verified public GitHub account established.');
  }

  // Generate Evidence-Based Weaknesses
  const weaknesses: string[] = [];
  if (!evidence.hasProfileReadme) {
    weaknesses.push('Missing a root GitHub Profile README (username/username) with tech badges and career focus.');
  }
  if (originalCount < 3) {
    weaknesses.push(`Low original repository count (${originalCount} found; recommended: at least 3-4 showcase systems).`);
  }
  if (reposWithDesc.length < originalCount) {
    weaknesses.push(`${originalCount - reposWithDesc.length} repositories lack descriptive summary text explaining their purpose.`);
  }
  if (!evidence.hasLiveDemoLinks) {
    weaknesses.push('No live deployment or demo URLs detected in repository homepages or descriptions.');
  }
  if (reposWithTopics.length === 0 && originalCount > 0) {
    weaknesses.push('Repositories lack topic tags (e.g. #react, #fastapi, #machine-learning) for discoverability.');
  }
  if (evidence.lastActivityDate) {
    const daysSince = Math.floor((Date.now() - new Date(evidence.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 60) {
      weaknesses.push(`Last public commit was ${daysSince} days ago; recruiters look for active weekly/monthly cadence.`);
    }
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Consider adding automated CI/CD GitHub Actions badges to demonstrate production release discipline.');
  }

  // Generate High-Impact Recommendations
  const recommendations: string[] = [];
  if (!evidence.hasProfileReadme) {
    recommendations.push(`Create a public repo named "${evidence.username}" and add a rich README.md with your tech stack badges, current projects, and LinkedIn link.`);
  }
  if (!evidence.hasLiveDemoLinks) {
    recommendations.push('Deploy your top 2 applications to free hosting (Vercel, Render, or Railway) and set the live URL in the GitHub repository "About" settings.');
  }
  if (reposWithDesc.length < originalCount) {
    recommendations.push('Write concise 1-sentence descriptions and add 4-5 topics for every repository on your profile.');
  }
  recommendations.push('Add an architecture diagram and quickstart GIF/screenshot inside the README of your primary showcase project.');
  recommendations.push('Pin your top 4 most impressive and complete repositories to the top of your GitHub profile.');

  // Recruiter Screening Checklist
  const checklist = [
    {
      item: 'Verified Public GitHub Profile',
      passed: true,
      note: `@${evidence.username} verified`,
    },
    {
      item: 'Profile Bio & Identity Details',
      passed: !!(evidence.bio || evidence.location || evidence.company),
      note: evidence.bio ? 'Bio present' : 'Bio missing',
    },
    {
      item: 'Custom Profile README (username/username)',
      passed: evidence.hasProfileReadme,
      note: evidence.hasProfileReadme ? 'Profile README active' : 'No profile README found',
    },
    {
      item: 'At least 3 Original Public Repositories',
      passed: originalCount >= 3,
      note: `${originalCount} original repositories detected`,
    },
    {
      item: 'Repository Descriptions & Documentation',
      passed: reposWithDesc.length >= 2,
      note: `${reposWithDesc.length}/${originalCount} repos have detailed descriptions`,
    },
    {
      item: 'Live Demo / Hosted Deployment Links',
      passed: evidence.hasLiveDemoLinks,
      note: evidence.hasLiveDemoLinks ? 'Live URLs detected' : 'No live demo links found',
    },
    {
      item: 'Recent Commit / Push Activity (Last 90 Days)',
      passed: activity >= 11,
      note: evidence.lastActivityDate
        ? `Last active: ${new Date(evidence.lastActivityDate).toLocaleDateString()}`
        : 'No activity recorded',
    },
  ];

  return {
    id: `gh_analysis_${Date.now()}`,
    userId,
    platform: 'github',
    profileUrl: evidence.profileUrl,
    username: evidence.username,
    analysisDate: new Date().toISOString(),
    overallScore,
    profileStrength,
    categories,
    evidence,
    strengths,
    weaknesses,
    recommendations,
    checklist,
  };
}
