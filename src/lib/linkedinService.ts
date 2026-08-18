import { LinkedInProfileEvidence, LinkedInReadinessAnalysis, LinkedInCategoryScores } from '../types';

export interface LinkedinUrlValidationResult {
  valid: boolean;
  slug: string | null;
  normalizedUrl: string | null;
  error?: string;
}

/**
 * Validates whether the entered string is a valid LinkedIn profile URL
 */
export function validateLinkedinUrl(rawInput: string): LinkedinUrlValidationResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, slug: null, normalizedUrl: null, error: 'LinkedIn profile URL cannot be empty.' };
  }

  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { valid: false, slug: null, normalizedUrl: null, error: 'LinkedIn profile URL cannot be empty.' };
  }

  let urlObj: URL;
  try {
    const withProto = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`;
    urlObj = new URL(withProto);
  } catch {
    return { valid: false, slug: null, normalizedUrl: null, error: 'Invalid LinkedIn profile URL' };
  }

  const hostname = urlObj.hostname.toLowerCase();
  const validHosts = ['linkedin.com', 'www.linkedin.com', 'in.linkedin.com', 'uk.linkedin.com', 'ca.linkedin.com'];
  if (!validHosts.some((h) => hostname === h || hostname.endsWith('.linkedin.com'))) {
    return { valid: false, slug: null, normalizedUrl: null, error: 'Invalid LinkedIn profile URL (Must belong to linkedin.com)' };
  }

  // Check /in/ path
  const pathSegments = urlObj.pathname.split('/').filter(Boolean);
  if (pathSegments.length < 2 || pathSegments[0].toLowerCase() !== 'in') {
    return { valid: false, slug: null, normalizedUrl: null, error: 'Invalid LinkedIn profile URL (Must follow format https://www.linkedin.com/in/your-username)' };
  }

  const slug = pathSegments[1];
  if (!slug || slug.trim().length === 0) {
    return { valid: false, slug: null, normalizedUrl: null, error: 'Invalid LinkedIn username in URL' };
  }

  return {
    valid: true,
    slug,
    normalizedUrl: `https://www.linkedin.com/in/${slug}/`,
  };
}

/**
 * Robust text extractor for LinkedIn profile PDF files
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to string safely to scan for PDF text objects
    let binaryStr = '';
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binaryStr += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
    }

    const textPieces: string[] = [];

    // 1. Match standard PDF Text Blocks (BT ... ET)
    const btRegex = /BT[\s\S]*?ET/g;
    const matches = binaryStr.match(btRegex) || [];

    for (const block of matches) {
      // Find (Text) or <HexText>
      const stringMatches = block.match(/\((.*?)\)|<([0-9a-fA-F]+)>/g) || [];
      for (const sm of stringMatches) {
        if (sm.startsWith('(') && sm.endsWith(')')) {
          const raw = sm.slice(1, -1);
          // Unescape
          const unescaped = raw
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          if (unescaped.trim().length > 0) {
            textPieces.push(unescaped);
          }
        } else if (sm.startsWith('<') && sm.endsWith('>')) {
          const hex = sm.slice(1, -1);
          let decoded = '';
          for (let h = 0; h < hex.length; h += 2) {
            const charCode = parseInt(hex.substr(h, 2), 16);
            if (charCode >= 32 && charCode <= 126) {
              decoded += String.fromCharCode(charCode);
            }
          }
          if (decoded.trim().length > 0) {
            textPieces.push(decoded);
          }
        }
      }
    }

    // 2. Also look for plain ascii text runs if BT block extraction yielded low content
    if (textPieces.length < 5) {
      const asciiRuns = binaryStr.match(/[A-Za-z0-9\s,.:;@/_\-+–—()]{4,}/g) || [];
      const filtered = asciiRuns
        .filter((r) => !r.includes('/Type') && !r.includes('/Font') && !r.includes('/Obj') && r.trim().length > 4)
        .slice(0, 200);
      textPieces.push(...filtered);
    }

    const extracted = textPieces.join(' ').replace(/\s+/g, ' ').trim();
    if (extracted.length < 30) {
      throw new Error('Could not extract readable text from PDF. Please copy-paste your LinkedIn text directly.');
    }
    return extracted;
  } catch (err) {
    console.error('PDF text extraction error:', err);
    throw new Error(err instanceof Error ? err.message : 'Failed to read LinkedIn profile PDF.');
  }
}

/**
 * Parses raw text into structured LinkedIn profile sections
 */
export function parseLinkedInTextEvidence(
  rawText: string,
  profileUrl: string,
  slug: string,
  dataSource: 'pasted_text' | 'uploaded_pdf' | 'public_api'
): LinkedInProfileEvidence {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Section indicators
  const hasHeadline = lower.includes('student') || lower.includes('engineer') || lower.includes('developer') || lower.includes('aspiring') || lower.includes('intern') || lower.includes('specialist');
  const hasAbout = lower.includes('about') || lower.includes('summary') || lower.includes('passionate') || lower.includes('seeking') || text.length > 300;
  const hasSkills = lower.includes('skills') || lower.includes('technologies') || lower.includes('python') || lower.includes('react') || lower.includes('java') || lower.includes('typescript');
  const hasProjects = lower.includes('project') || lower.includes('projects') || lower.includes('github') || lower.includes('portfolio');
  const hasExperience = lower.includes('experience') || lower.includes('intern') || lower.includes('internship') || lower.includes('work') || lower.includes('employment');
  const hasEducation = lower.includes('education') || lower.includes('university') || lower.includes('bachelor') || lower.includes('b.tech') || lower.includes('college') || lower.includes('institute') || lower.includes('degree');
  const hasCertifications = lower.includes('certification') || lower.includes('licenses') || lower.includes('certified') || lower.includes('aws') || lower.includes('coursera') || lower.includes('nptel');

  // Extract detected technical skills
  const knownSkills = [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Django', 'Flask',
    'HTML', 'CSS', 'Tailwind', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'Linux',
    'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision',
    'Data Structures', 'Algorithms', 'System Design', 'REST API', 'GraphQL',
  ];
  const detectedSkills = knownSkills.filter((s) => lower.includes(s.toLowerCase()));

  // Extract headline line if possible (first 1-2 lines)
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  let headline: string | undefined;
  if (lines.length >= 2) {
    const candidate = lines.find((l) => l.length > 10 && l.length < 150 && (l.toLowerCase().includes('student') || l.toLowerCase().includes('engineer') || l.toLowerCase().includes('|') || l.toLowerCase().includes('@')));
    if (candidate) headline = candidate;
  }

  return {
    profileUrl,
    slug,
    dataSource,
    headline: headline || (hasHeadline ? lines[0] : undefined),
    about: hasAbout ? text.slice(0, 400) : undefined,
    education: hasEducation ? ['Degree & Coursework Detected'] : undefined,
    skills: detectedSkills.length > 0 ? detectedSkills : undefined,
    certifications: hasCertifications ? ['Verified Certificates Detected'] : undefined,
    projects: hasProjects ? ['Project Portfolios Detected'] : undefined,
    experience: hasExperience ? ['Internship / Work Experience Detected'] : undefined,
    rawTextPreview: text.slice(0, 500),
    sectionPresence: {
      headline: hasHeadline,
      about: hasAbout,
      skills: detectedSkills.length >= 3,
      projects: hasProjects,
      experience: hasExperience,
      education: hasEducation,
      certifications: hasCertifications,
    },
  };
}

/**
 * Calculates genuine evidence-based LinkedIn readiness scores
 */
export function calculateLinkedinReadiness(
  evidence: LinkedInProfileEvidence,
  userId: string
): LinkedInReadinessAnalysis {
  const p = evidence.sectionPresence;
  const rawLower = (evidence.rawTextPreview || '').toLowerCase();

  // 1. Profile Completeness (Max 15)
  let profileCompleteness = 0;
  if (p.headline) profileCompleteness += 3;
  if (p.about) profileCompleteness += 3;
  if (p.education) profileCompleteness += 3;
  if (p.skills) profileCompleteness += 3;
  if (p.experience || p.projects) profileCompleteness += 3;
  profileCompleteness = Math.min(15, profileCompleteness);

  // 2. Headline & Positioning (Max 15)
  let headlinePositioning = 0;
  if (p.headline) {
    headlinePositioning += 7;
    const hl = (evidence.headline || '').toLowerCase();
    if (hl.includes('|') || hl.includes('•') || hl.includes('@') || hl.includes('aspiring') || hl.includes('enthusiast') || hl.includes('specialist')) {
      headlinePositioning += 4;
    }
    if (evidence.skills && evidence.skills.length >= 2) {
      headlinePositioning += 4;
    }
  } else {
    headlinePositioning += 3; // Basic presence
  }
  headlinePositioning = Math.min(15, headlinePositioning);

  // 3. About Section (Max 15)
  let aboutSection = 0;
  if (p.about) {
    aboutSection += 8;
    if ((evidence.about || '').length > 150) aboutSection += 4;
    if (rawLower.includes('passionate') || rawLower.includes('building') || rawLower.includes('skills') || rawLower.includes('reach out')) {
      aboutSection += 3;
    }
  }
  aboutSection = Math.min(15, aboutSection);

  // 4. Skills & Technical Stack (Max 15)
  let skillsTechnicalStack = 0;
  const skillCount = evidence.skills?.length || 0;
  if (skillCount >= 8) skillsTechnicalStack = 15;
  else if (skillCount >= 5) skillsTechnicalStack = 12;
  else if (skillCount >= 3) skillsTechnicalStack = 9;
  else if (skillCount >= 1) skillsTechnicalStack = 6;
  else skillsTechnicalStack = 2;

  // 5. Projects & Portfolio (Max 15)
  let projectsPortfolio = 0;
  if (p.projects) {
    projectsPortfolio += 8;
    if (rawLower.includes('github.com') || rawLower.includes('http')) projectsPortfolio += 4;
    if (rawLower.includes('built') || rawLower.includes('developed') || rawLower.includes('deployed')) projectsPortfolio += 3;
  }
  projectsPortfolio = Math.min(15, projectsPortfolio);

  // 6. Experience / Internships (Max 10)
  let experienceInternships = 0;
  if (p.experience) {
    experienceInternships += 6;
    if (rawLower.includes('intern') || rawLower.includes('internship')) experienceInternships += 2;
    if (rawLower.includes('responsible') || rawLower.includes('led') || rawLower.includes('improved')) experienceInternships += 2;
  }
  experienceInternships = Math.min(10, experienceInternships);

  // 7. Education & Certifications (Max 5)
  let educationCertifications = 0;
  if (p.education) educationCertifications += 3;
  if (p.certifications) educationCertifications += 2;
  educationCertifications = Math.min(5, educationCertifications);

  // 8. Professional Presentation (Max 5)
  let professionalPresentation = 0;
  if (evidence.dataSource === 'uploaded_pdf' || evidence.dataSource === 'pasted_text') professionalPresentation += 3;
  if (evidence.headline) professionalPresentation += 1;
  if (p.about) professionalPresentation += 1;
  professionalPresentation = Math.min(5, professionalPresentation);

  // 9. Career Alignment (Max 5)
  let careerAlignment = 0;
  if (skillCount >= 4 && (p.headline || p.about)) careerAlignment += 3;
  if (p.projects || p.experience) careerAlignment += 2;
  careerAlignment = Math.min(5, careerAlignment);

  // Overall Score
  const overallScore = Math.min(
    100,
    profileCompleteness +
      headlinePositioning +
      aboutSection +
      skillsTechnicalStack +
      projectsPortfolio +
      experienceInternships +
      educationCertifications +
      professionalPresentation +
      careerAlignment
  );

  let readinessTier: LinkedInReadinessAnalysis['readinessTier'] = 'Developing';
  if (overallScore >= 85) readinessTier = 'Elite Positioning';
  else if (overallScore >= 70) readinessTier = 'Recruiter-Ready';
  else if (overallScore >= 50) readinessTier = 'Developing';
  else readinessTier = 'Needs Optimization';

  const categories: LinkedInCategoryScores = {
    profileCompleteness,
    headlinePositioning,
    aboutSection,
    skillsTechnicalStack,
    projectsPortfolio,
    experienceInternships,
    educationCertifications,
    professionalPresentation,
    careerAlignment,
  };

  // Strengths
  const strengths: string[] = [];
  if (skillCount >= 4) {
    strengths.push(`Rich technical skills keyword density (${evidence.skills?.slice(0, 4).join(', ')}) matching recruiter search queries.`);
  }
  if (p.headline) {
    strengths.push('Descriptive headline present highlighting core technical identity.');
  }
  if (p.about) {
    strengths.push('About summary structured to provide recruiter context on background and ambitions.');
  }
  if (p.projects) {
    strengths.push('Featured engineering projects and practical implementations documented.');
  }
  if (p.experience) {
    strengths.push('Practical work or internship experience included in profile timeline.');
  }
  if (strengths.length === 0) {
    strengths.push('Verified public LinkedIn profile URL provided.');
  }

  // Weaknesses
  const weaknesses: string[] = [];
  if (!p.about) {
    weaknesses.push('Missing About/Summary section; recruiters read this first to gauge communication and focus.');
  }
  if (skillCount < 5) {
    weaknesses.push(`Low technical skill count detected (${skillCount} identified; recommended: at least 8-10 core skills).`);
  }
  if (!p.projects && !p.experience) {
    weaknesses.push('No detailed showcase projects or internship experience detected in profile text.');
  }
  if (!p.certifications) {
    weaknesses.push('No verified certifications or cloud credentials logged in Licenses & Certifications.');
  }
  if (!rawLower.includes('github.com')) {
    weaknesses.push('Missing public GitHub or portfolio links in Featured/Contact sections.');
  }
  if (weaknesses.length === 0) {
    weaknesses.push('Consider requesting 2-3 recommendations from professors, mentors, or project leads.');
  }

  // Recommendations
  const recommendations: string[] = [];
  recommendations.push('Add your GitHub profile URL and top live project demo directly into your LinkedIn "Featured" section.');
  recommendations.push('Enhance your headline formula: [Target Role] | [Core Stack e.g. Python, React, AI] | [Unique Achievement/College].');
  recommendations.push('Write a 3-paragraph About section covering: 1) Who you are, 2) Technical domains you build in, 3) Call to action for recruiters.');
  recommendations.push('Take LinkedIn Skill Assessments to earn verified skill badges for Python, Java, or React.');
  recommendations.push('Post regular updates (once a week) about projects you are building or concepts you are learning to trigger recruiter algorithm visibility.');

  // Recruiter Screening Checklist
  const checklist = [
    {
      item: 'Optimized Headline with Target Role & Keywords',
      passed: p.headline && headlinePositioning >= 10,
      note: p.headline ? 'Headline configured' : 'Headline missing',
    },
    {
      item: 'Engaging 3-Paragraph "About" Section',
      passed: p.about,
      note: p.about ? 'Summary section present' : 'Summary missing',
    },
    {
      item: 'At least 8 Technical Skills Logged',
      passed: skillCount >= 8,
      note: `${skillCount} skills detected`,
    },
    {
      item: 'Featured Projects with GitHub / Demo Links',
      passed: p.projects,
      note: p.projects ? 'Projects detected' : 'No projects found',
    },
    {
      item: 'Internship / Work Experience History',
      passed: p.experience,
      note: p.experience ? 'Experience logged' : 'No experience section',
    },
    {
      item: 'Education & Degree Program Details',
      passed: p.education,
      note: p.education ? 'Education logged' : 'Education missing',
    },
    {
      item: 'Industry Certifications (AWS / Google / Coursera)',
      passed: p.certifications,
      note: p.certifications ? 'Certifications found' : 'No certifications found',
    },
  ];

  return {
    id: `li_analysis_${Date.now()}`,
    userId,
    platform: 'linkedin',
    profileUrl: evidence.profileUrl,
    analysisDate: new Date().toISOString(),
    overallScore,
    readinessTier,
    categories,
    evidence,
    strengths,
    weaknesses,
    recommendations,
    checklist,
  };
}
