import { jsPDF } from 'jspdf';
import {
  UserProfile,
  Skill,
  Project,
  Achievement,
  CareerGoal,
  ReadinessScore,
  GitHubReadinessAnalysis,
  LinkedInReadinessAnalysis,
} from '../types';
import {
  ResumeAnalysisResult,
  SyllabusAnalysisResult,
  ProjectAnalysisResult,
  InternshipReadinessResult,
  GitHubReadinessResult,
  AIInsightsResult,
  Roadmap306090Result,
} from './aiCareerEngine';

export interface ResumeTrackingEntry {
  id: string;
  date: string;
  versionTitle: string;
  score: number;
  atsScore: number;
  skillsDetectedCount: number;
  missingKeywordsCount: number;
  previousScore?: number;
  keyImprovements: string[];
}

export interface PDFExportData {
  profile: UserProfile;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  careerGoal?: CareerGoal;
  readinessScore: ReadinessScore;
  profileCompletion?: number;
  isDemo?: boolean;
  aiInsights?: {
    strengths: string[];
    weaknesses: string[];
    careerRisks: string[];
    highestImpactAction: string;
    nextSteps: string[];
  };
  roadmap?: {
    day30: string[];
    day60: string[];
    day90: string[];
  };
}

/**
 * Text wrapper utility ensuring text never overflows page boundaries
 */
function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number = 5
): number {
  if (!text) return y;
  const lines = doc.splitTextToSize(text, maxWidth);
  for (let i = 0; i < lines.length; i++) {
    doc.text(lines[i], x, y + i * lineHeight);
  }
  return y + lines.length * lineHeight;
}

/**
 * Automated page break check
 */
function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number = 25): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 28; // Top margin on new page
  }
  return currentY;
}

/**
 * Standard Official Student Digital Twin Header
 */
function addOfficialHeader(doc: jsPDF, documentTitle: string, isDemo: boolean = false) {
  // Top brand banner
  doc.setFillColor(30, 58, 138); // Deep Navy #1E3A8A
  doc.rect(0, 0, 210, 18, 'F');

  // Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('STUDENT DIGITAL TWIN', 15, 11);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('AI-Powered Student Career Intelligence', 75, 11);

  // Document Title / Badge
  if (isDemo) {
    doc.setFillColor(239, 68, 68);
    doc.roundedRect(140, 4.5, 55, 9, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('DEMO / CREATOR SHOWCASE', 167.5, 10.5, { align: 'center' });
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(documentTitle.toUpperCase(), 195, 11, { align: 'right' });
  }

  // Thin separator rule
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(15, 22, 195, 22);
}

/**
 * Standard Official Footers with Page Numbering & Timestamps
 */
function addOfficialFooters(doc: jsPDF, isDemo: boolean = false) {
  const totalPages = doc.getNumberOfPages();
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(15, pageHeight - 14, 195, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);

    const footerText = isDemo
      ? `Student Digital Twin • DEMO / CREATOR SHOWCASE • ${dateStr}`
      : `Student Digital Twin • Official Career Intelligence Document • ${dateStr}`;

    doc.text(footerText, 15, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, 195, pageHeight - 8, { align: 'right' });
  }
}

/* =========================================================================
   1. OFFICIAL STUDENT DIGITAL TWIN — PROFILE REPORT PDF
   ========================================================================= */
export async function exportStudentTwinPDF(data: PDFExportData): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { profile, skills, projects, achievements, careerGoal, readinessScore, aiInsights, roadmap, isDemo } = data;

    let y = 30;

    // Header Card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y, 180, 42, 3, 3, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(15, y, 180, 42, 3, 3, 'D');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(profile.fullName || 'Student Digital Twin', 22, y + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const academicInfo = `${profile.degree ? profile.degree + ' in ' : ''}${profile.major || 'Computer Science & Engineering'} • ${profile.year || '2nd Year'}`;
    doc.text(academicInfo, 22, y + 18);
    doc.text(`${profile.institution || 'University Institute'} • Graduation: ${profile.graduationYear || '2027'}`, 22, y + 24);

    const contactStr = [
      profile.email,
      profile.githubUrl ? `GitHub: ${profile.githubUrl}` : null,
      profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : null,
    ].filter(Boolean).join('  |  ');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(contactStr, 22, y + 32);

    // Readiness Gauge Box in Header
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(148, y + 5, 42, 32, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('READINESS INDEX', 169, y + 12, { align: 'center' });
    doc.setFontSize(19);
    doc.text(`${readinessScore.overall}%`, 169, y + 22, { align: 'center' });
    doc.setFontSize(7);
    doc.text(readinessScore.level || 'Placement Ready', 169, y + 30, { align: 'center' });

    y += 50;

    // SECTION 1: 4-Pillar Competency Computation
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('1. FOUR-PILLAR READINESS METRICS', 15, y);
    y += 6;

    const b = readinessScore.breakdown;
    const catWidth = 42;
    const pillars = [
      { label: 'Skills Coverage', val: `${b.skillsCoverage}%`, desc: `${skills.length} skills tracked` },
      { label: 'Project Portfolio', val: `${b.projectPortfolio}%`, desc: `${projects.length} repositories` },
      { label: 'Industry Alignment', val: `${b.industryAlignment}%`, desc: careerGoal?.targetRole || 'Target Role' },
      { label: 'Verifications', val: `${b.verifications}%`, desc: `${achievements.length} credentials` },
    ];

    pillars.forEach((p, idx) => {
      const px = 15 + idx * 46;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(px, y, catWidth, 20, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(px, y, catWidth, 20, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(p.label, px + 4, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(37, 99, 235);
      doc.text(p.val, px + 4, y + 13);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(p.desc.substring(0, 22), px + 4, y + 18);
    });

    y += 28;

    // SECTION 2: Career Goals & Trajectory
    if (careerGoal) {
      y = checkPageBreak(doc, y, 32);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. CAREER TRAJECTORY & GOALS', 15, y);
      y += 6;

      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, 180, 24, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`Target Role: ${careerGoal.targetRole || 'Software / AI Engineer'}`, 20, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`Target CTC: ${careerGoal.targetCompensationINR || '₹18,00,000 / yr'}  |  Target Timeline: ${careerGoal.targetTimeline || '2026-2027'}`, 20, y + 12);

      const targetCos = (careerGoal.targetCompanies || []).join(', ') || 'Google, Microsoft, Amazon';
      doc.text(`Target Companies: ${targetCos}`, 20, y + 18);

      const completedCount = careerGoal.milestones ? careerGoal.milestones.filter(m => m.completed).length : 0;
      doc.text(`Milestones: ${completedCount}/${careerGoal.milestones?.length || 0} Completed`, 130, y + 18);

      y += 30;
    }

    // SECTION 3: Skills Taxonomy
    y = checkPageBreak(doc, y, 40);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('3. SKILLS TAXONOMY & PROFICIENCY MATRIX', 15, y);
    y += 6;

    if (skills.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No skills cataloged yet.', 15, y + 4);
      y += 10;
    } else {
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('SKILL NAME', 18, y + 5);
      doc.text('CATEGORY', 80, y + 5);
      doc.text('PROFICIENCY', 125, y + 5);
      doc.text('SCORE', 165, y + 5);
      y += 8;

      skills.forEach((s) => {
        y = checkPageBreak(doc, y, 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(s.name, 18, y + 4);

        doc.setTextColor(100, 116, 139);
        doc.text(s.category, 80, y + 4);
        doc.text(s.proficiency, 125, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`${s.score || 75}%`, 165, y + 4);

        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 6, 195, y + 6);
        y += 7;
      });
      y += 4;
    }

    // SECTION 4: Engineering Projects
    y = checkPageBreak(doc, y, 40);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('4. VERIFIED ENGINEERING PROJECTS', 15, y);
    y += 6;

    if (projects.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No projects cataloged yet.', 15, y + 4);
      y += 10;
    } else {
      projects.forEach((proj) => {
        y = checkPageBreak(doc, y, 25);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 22, 2, 2, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, y, 180, 22, 2, 2, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(proj.title, 19, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(37, 99, 235);
        doc.text(`[${proj.status}] • Level: ${proj.difficulty}`, 135, y + 6);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        const desc = proj.description.length > 110 ? proj.description.substring(0, 107) + '...' : proj.description;
        doc.text(desc, 19, y + 12);

        const tech = (proj.techStack || []).join(' • ');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Stack: ${tech}`, 19, y + 18);

        if (proj.githubUrl) {
          doc.setTextColor(37, 99, 235);
          doc.text(`GitHub: ${proj.githubUrl}`, 120, y + 18);
        }
        y += 26;
      });
    }

    // SECTION 5: Achievements & Certifications
    if (achievements.length > 0) {
      y = checkPageBreak(doc, y, 30);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('5. ACHIEVEMENTS & CERTIFICATIONS', 15, y);
      y += 6;

      achievements.forEach((ach) => {
        y = checkPageBreak(doc, y, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${ach.title}`, 18, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        const achSub = `Issuer: ${ach.issuer} | Category: ${ach.category} | Date: ${ach.issueDate || ach.date || 'Verified'}`;
        doc.text(achSub, 23, y + 10);
        y += 12;
      });
      y += 4;
    }

    // SECTION 6: AI Career Insights
    if (aiInsights) {
      y = checkPageBreak(doc, y, 35);
      doc.setTextColor(30, 58, 138);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('6. AI CAREER INSIGHTS & RECOMMENDATIONS', 15, y);
      y += 6;

      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(15, y, 180, 24, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 64, 175);
      doc.text('HIGHEST IMPACT CAREER ACTION:', 19, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 58, 138);
      doc.text(aiInsights.highestImpactAction || 'Publish full-stack production application with CI/CD and unit tests.', 19, y + 12);

      doc.setFont('helvetica', 'bold');
      doc.text('PRIMARY CAREER RISK / GAP:', 19, y + 18);
      doc.setFont('helvetica', 'normal');
      const riskText = (aiInsights.careerRisks && aiInsights.careerRisks[0]) || 'Ensure consistent problem-solving on medium-difficulty algorithmic problems.';
      doc.text(riskText, 66, y + 18);

      y += 30;
    }

    // Add headers and footers to all pages
    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'PROFILE REPORT', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student_Twin').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Student_Digital_Twin_Report.pdf`);
  } catch (err) {
    console.error('Failed to generate Student Twin Profile Report PDF:', err);
    throw new Error('PDF export failed.');
  }
}

/* =========================================================================
   2. AI-GENERATED RESUME -> PDF
   ========================================================================= */
export interface ResumeBuilderData {
  profile: UserProfile;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  careerGoal?: CareerGoal;
  customSummary?: string;
  selectedProjects?: string[]; // project IDs
  selectedSkills?: string[]; // skill IDs
  isDemo?: boolean;
}

export async function exportAIResumePDF(data: ResumeBuilderData): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { profile, skills, projects, achievements, careerGoal, customSummary, selectedProjects, selectedSkills, isDemo } = data;

    let y = 20;

    // Header: Student Name & Contact Info
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text((profile.fullName || 'Student Name').toUpperCase(), 105, y, { align: 'center' });
    y += 5.5;

    // Contact Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const contactLine = [
      profile.email,
      profile.githubUrl ? `GitHub: ${profile.githubUrl.replace('https://', '')}` : null,
      profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl.replace('https://', '')}` : null,
    ].filter(Boolean).join('  |  ');
    doc.text(contactLine, 105, y, { align: 'center' });
    y += 4.5;

    // Divider Line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 6;

    // SECTION: PROFESSIONAL SUMMARY / CAREER OBJECTIVE
    const summary = customSummary || profile.bio || `Ambitious and disciplined Computer Science student targeting ${careerGoal?.targetRole || 'Software / AI Engineering'} roles. Proficient in building robust scalable applications, implementing clean architectures, and solving complex algorithmic challenges.`;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text('CAREER OBJECTIVE & PROFESSIONAL SUMMARY', 15, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    y = addWrappedText(doc, summary, 15, y, 180, 4.2);
    y += 5;

    // SECTION: EDUCATION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text('EDUCATION', 15, y);
    y += 4.5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(profile.institution || 'University Institute of Engineering & Technology', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Expected Graduation: ${profile.graduationYear || '2027'}`, 195, y, { align: 'right' });
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const degreeLine = `${profile.degree ? profile.degree + ' in ' : 'B.Tech in '}${profile.major || 'Computer Science & Engineering'} • Current Standing: ${profile.year || '2nd Year'}`;
    doc.text(degreeLine, 15, y);
    y += 6;

    // SECTION: TECHNICAL SKILLS
    y = checkPageBreak(doc, y, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text('TECHNICAL SKILLS', 15, y);
    y += 4.5;

    const filteredSkills = selectedSkills && selectedSkills.length > 0
      ? skills.filter(s => selectedSkills.includes(s.id))
      : skills;

    const grouped: Record<string, string[]> = {};
    filteredSkills.forEach(s => {
      const cat = s.category || 'General Technical';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s.name);
    });

    Object.entries(grouped).forEach(([cat, list]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${cat}: `, 15, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const text = list.join(', ');
      y = addWrappedText(doc, text, 52, y, 142, 4.2);
      y += 1.5;
    });
    y += 4;

    // SECTION: ENGINEERING PROJECTS
    y = checkPageBreak(doc, y, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 58, 138);
    doc.text('KEY ENGINEERING PROJECTS', 15, y);
    y += 4.5;

    const filteredProjects = selectedProjects && selectedProjects.length > 0
      ? projects.filter(p => selectedProjects.includes(p.id))
      : projects;

    filteredProjects.forEach(proj => {
      y = checkPageBreak(doc, y, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(proj.title, 15, y);

      const techStr = (proj.techStack || []).join(', ');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`[${techStr}]`, 195, y, { align: 'right' });
      y += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      y = addWrappedText(doc, proj.description, 18, y, 175, 4.2);

      if (proj.githubUrl) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(37, 99, 235);
        doc.text(`Source Code: ${proj.githubUrl}`, 18, y);
        y += 3.5;
      }
      y += 2.5;
    });

    // SECTION: ACHIEVEMENTS & CERTIFICATIONS
    if (achievements.length > 0) {
      y = checkPageBreak(doc, y, 25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 58, 138);
      doc.text('HONORS & CERTIFICATIONS', 15, y);
      y += 4.5;

      achievements.forEach(ach => {
        y = checkPageBreak(doc, y, 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${ach.title}`, 15, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`— ${ach.issuer} (${ach.issueDate || ach.date || 'Verified'})`, 195, y, { align: 'right' });
        y += 4.2;
      });
    }

    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Resume.pdf`);
  } catch (err) {
    console.error('Failed to export AI Resume PDF:', err);
    throw new Error('Resume PDF export failed.');
  }
}

/* =========================================================================
   3. RESUME ANALYZER -> PDF REPORT
   ========================================================================= */
export async function exportResumeAnalysisPDF(
  profile: UserProfile,
  analysis: ResumeAnalysisResult,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('RESUME ATS AUDIT & RECRUITER ANALYSIS', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Target Role Benchmark: ${analysis.matchRole}`, 15, y);
    y += 8;

    // ATS Score Card
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(15, y, 180, 26, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('ATS COMPATIBILITY SCORE', 22, y + 8);
    doc.setFontSize(20);
    doc.text(`${analysis.atsScore}/100`, 22, y + 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Tier: ${analysis.readinessTier}`, 90, y + 12);
    doc.text(`Identified Skills: ${analysis.detectedSkills.length} | Missing Keywords: ${analysis.missingKeywords.length}`, 90, y + 18);
    y += 32;

    // Missing Keywords
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('CRITICAL MISSING ATS KEYWORDS', 15, y);
    y += 5;

    doc.setFillColor(254, 242, 242);
    doc.roundedRect(15, y, 180, 18, 2, 2, 'F');
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(15, y, 180, 18, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(185, 28, 28);
    const keywordsText = analysis.missingKeywords.join('  •  ') || 'None detected (Well optimized for ATS)';
    doc.text(keywordsText, 20, y + 10);
    y += 24;

    // Strengths
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('DETECTED RESUME STRENGTHS', 15, y);
    y += 5;

    analysis.strengths.forEach(st => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`✓ ${st}`, 18, y + 4);
      y += 6;
    });
    y += 4;

    // Weaknesses / Gaps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('IDENTIFIED WEAKNESSES & RISKS', 15, y);
    y += 5;

    analysis.weaknesses.forEach(wk => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(153, 27, 27);
      doc.text(`⚠ ${wk}`, 18, y + 4);
      y += 6;
    });
    y += 4;

    // Actionable Improvements
    y = checkPageBreak(doc, y, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('ACTIONABLE RECRUITER POLISH RECOMMENDATIONS', 15, y);
    y += 5;

    analysis.improvements.forEach((imp, idx) => {
      y = checkPageBreak(doc, y, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(37, 99, 235);
      doc.text(`${idx + 1}.`, 18, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      y = addWrappedText(doc, imp, 24, y + 4, 168, 4.2);
      y += 2;
    });

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'RESUME ANALYSIS', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Resume_ATS_Analysis.pdf`);
  } catch (err) {
    console.error('Failed to export Resume Analysis PDF:', err);
    throw new Error('Resume Analysis PDF export failed.');
  }
}

/* =========================================================================
   4. RESUME TRACKING RECORD -> PDF
   ========================================================================= */
export async function exportResumeTrackingPDF(
  profile: UserProfile,
  history: ResumeTrackingEntry[],
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('RESUME AUDIT TRACKING & ITERATION RECORD', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Total Audits Tracked: ${history.length}`, 15, y);
    y += 10;

    if (history.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, y, 180, 25, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, 180, 25, 2, 2, 'D');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text('No previous tracking data available.', 105, y + 14, { align: 'center' });
    } else {
      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 7, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('DATE', 18, y + 5);
      doc.text('VERSION / TITLE', 45, y + 5);
      doc.text('ATS SCORE', 105, y + 5);
      doc.text('PREV SCORE', 135, y + 5);
      doc.text('CHANGE', 165, y + 5);
      y += 8;

      history.forEach(entry => {
        y = checkPageBreak(doc, y, 22);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(entry.date, 18, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.text(entry.versionTitle.substring(0, 26), 45, y + 4);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(`${entry.atsScore}%`, 110, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(entry.previousScore !== undefined ? `${entry.previousScore}%` : '—', 140, y + 4);

        const diff = entry.previousScore !== undefined ? entry.atsScore - entry.previousScore : 0;
        if (diff > 0) {
          doc.setTextColor(22, 101, 52);
          doc.text(`+${diff}%`, 168, y + 4);
        } else if (diff < 0) {
          doc.setTextColor(185, 28, 28);
          doc.text(`${diff}%`, 168, y + 4);
        } else {
          doc.setTextColor(100, 116, 139);
          doc.text('0%', 168, y + 4);
        }

        // Mini improvements summary
        if (entry.keyImprovements && entry.keyImprovements.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          doc.setTextColor(71, 85, 105);
          doc.text(`Top fix: ${entry.keyImprovements[0].substring(0, 90)}`, 45, y + 9);
        }

        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 12, 195, y + 12);
        y += 14;
      });
    }

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'RESUME TRACKING RECORD', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Resume_Tracking_Record.pdf`);
  } catch (err) {
    console.error('Failed to export Resume Tracking PDF:', err);
    throw new Error('Resume Tracking PDF export failed.');
  }
}

/* =========================================================================
   5. STUDENT STATISTICS -> PDF
   ========================================================================= */
export async function exportStudentStatisticsPDF(data: PDFExportData): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const { profile, skills, projects, achievements, careerGoal, readinessScore, profileCompletion, aiInsights, isDemo } = data;

    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('STUDENT DIGITAL TWIN — COMPREHENSIVE STATISTICS', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Active Student: ${profile.fullName || 'Student'} • ${profile.institution || 'Engineering Institute'}`, 15, y);
    y += 10;

    // 4 Top Stats Cards
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const statsCards = [
      { label: 'Overall Readiness', val: `${readinessScore.overall}%`, desc: readinessScore.level },
      { label: 'Profile Completion', val: `${profileCompletion || 85}%`, desc: 'Verified Profile' },
      { label: 'Skills Cataloged', val: `${skills.length}`, desc: `${skills.filter(s => s.proficiency === 'Advanced' || s.proficiency === 'Expert').length} High Proficiency` },
      { label: 'Engineering Projects', val: `${projects.length}`, desc: `${completedProjects} Completed` },
    ];

    statsCards.forEach((c, idx) => {
      const cx = 15 + idx * 46;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(cx, y, 42, 22, 2, 2, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, y, 42, 22, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, cx + 4, y + 6);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(37, 99, 235);
      doc.text(c.val, cx + 4, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(c.desc, cx + 4, y + 19);
    });

    y += 30;

    // SECTION: 6-DIMENSIONAL COMPETENCY RADAR BREAKDOWN
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('1. COMPETENCY DIMENSION SCORES & BENCHMARKS', 15, y);
    y += 6;

    const cats = [
      { name: 'Core Programming & Syntax', score: readinessScore.categories.programming, target: 85 },
      { name: 'Data Structures & Algorithms', score: readinessScore.categories.dsa, target: 80 },
      { name: 'AI/ML & Systems Architecture', score: readinessScore.categories.aiMl, target: 75 },
      { name: 'Project Portfolio Execution', score: readinessScore.categories.projects, target: 85 },
      { name: 'Professional Communication', score: readinessScore.categories.communication, target: 70 },
      { name: 'Campus Placement Preparation', score: readinessScore.categories.careerPrep, target: 90 },
    ];

    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('EVALUATION DIMENSION', 18, y + 5);
    doc.text('SCORE', 110, y + 5);
    doc.text('TARGET', 145, y + 5);
    doc.text('STATUS', 175, y + 5);
    y += 8;

    cats.forEach(c => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(c.name, 18, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`${c.score}%`, 112, y + 4);

      doc.setTextColor(100, 116, 139);
      doc.text(`${c.target}%`, 147, y + 4);

      const met = c.score >= c.target;
      doc.setTextColor(met ? 22 : 185, met ? 101 : 28, met ? 52 : 28);
      doc.text(met ? '✓ Target Met' : `-${c.target - c.score}% Gap`, 175, y + 4);

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 6, 195, y + 6);
      y += 7;
    });

    y += 10;

    // SECTION: SKILLS DISTRIBUTION BY CATEGORY
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text('2. SKILL TAXONOMY METRICS', 15, y);
    y += 6;

    const skillCats = ['Languages', 'Frameworks', 'Developer Tools', 'AI & Machine Learning', 'Core CS Fundamentals', 'Soft Skills'];
    skillCats.forEach((sc, idx) => {
      const matching = skills.filter(s => s.category === sc);
      const avgScore = matching.length > 0 ? Math.round(matching.reduce((acc, curr) => acc + (curr.score || 75), 0) / matching.length) : 0;
      
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(sc, 18, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`${matching.length} Skills Cataloged`, 95, y + 4);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(`Avg: ${avgScore}%`, 165, y + 4);

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 6, 195, y + 6);
      y += 7;
    });

    y += 8;

    // SECTION: AI INSIGHTS HIGHLIGHT
    if (aiInsights) {
      y = checkPageBreak(doc, y, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 58, 138);
      doc.text('3. AI CAREER FORECAST & ACTIONS', 15, y);
      y += 6;

      doc.setFillColor(239, 246, 255);
      doc.roundedRect(15, y, 180, 22, 2, 2, 'F');
      doc.setDrawColor(191, 219, 254);
      doc.roundedRect(15, y, 180, 22, 2, 2, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 64, 175);
      doc.text('PRIMARY RECOMMENDATION:', 19, y + 6);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 58, 138);
      doc.text(aiInsights.highestImpactAction || 'Focus on system design fundamentals and publish production repositories.', 19, y + 12);
      doc.text(`Target Compensation: ${careerGoal?.targetCompensationINR || '₹18,00,000 / yr'} • Target Role: ${careerGoal?.targetRole || 'AI/ML Engineer'}`, 19, y + 17);
      y += 28;
    }

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'STUDENT STATISTICS', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Student_Twin_Statistics.pdf`);
  } catch (err) {
    console.error('Failed to export Statistics PDF:', err);
    throw new Error('Statistics PDF export failed.');
  }
}

/* =========================================================================
   6. CAREER ROADMAP -> PDF
   ========================================================================= */
export async function exportCareerRoadmapPDF(
  profile: UserProfile,
  careerGoal: CareerGoal,
  roadmap: Roadmap306090Result,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('30 / 60 / 90-DAY CAREER ROADMAP', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Target Role: ${careerGoal.targetRole || 'Software / AI Engineer'} • Target CTC: ${careerGoal.targetCompensationINR || '₹18,00,000 / yr'}`, 15, y);
    y += 10;

    const sprints = [
      { key: 'day30', title: '30-Day Sprint: Core Foundation & Gaps', sprint: roadmap.day30 },
      { key: 'day60', title: '60-Day Sprint: Project & Architecture Depth', sprint: roadmap.day60 },
      { key: 'day90', title: '90-Day Sprint: Interview & Placement Ready', sprint: roadmap.day90 },
    ];

    sprints.forEach((sp) => {
      y = checkPageBreak(doc, y, 45);

      doc.setFillColor(30, 58, 138);
      doc.roundedRect(15, y, 180, 9, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(sp.title.toUpperCase(), 20, y + 6);
      y += 12;

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Sprint Focus: ${sp.sprint.focus}`, 18, y);
      y += 5;

      sp.sprint.milestones.forEach((m, mIdx) => {
        y = checkPageBreak(doc, y, 15);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(15, y, 180, 14, 1.5, 1.5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(15, y, 180, 14, 1.5, 1.5, 'D');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`${mIdx + 1}. ${m.title}`, 19, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`[${m.category}]`, 195, y + 5, { align: 'right' });

        doc.setTextColor(71, 85, 105);
        const detailPreview = m.detail.length > 105 ? m.detail.substring(0, 102) + '...' : m.detail;
        doc.text(detailPreview, 19, y + 10);

        y += 17;
      });

      y += 4;
    });

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'CAREER ROADMAP', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_30_60_90_Career_Roadmap.pdf`);
  } catch (err) {
    console.error('Failed to export Career Roadmap PDF:', err);
    throw new Error('Career Roadmap PDF export failed.');
  }
}

/* =========================================================================
   7. AI REPORTS -> PDF (Project, Syllabus, Internship, GitHub, Insights)
   ========================================================================= */

// Project Analysis PDF
export async function exportProjectAnalysisPDF(
  profile: UserProfile,
  analysis: any,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('ENGINEERING PROJECT DEPTH & ARCHITECTURE AUDIT', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Project: ${analysis.projectTitle || 'Project'}`, 15, y);
    y += 10;

    // Score Banner
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(15, y, 180, 26, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TECHNICAL DEPTH SCORE', 22, y + 8);
    doc.setFontSize(20);
    doc.text(`${analysis.technicalDepthScore || 0}/100`, 22, y + 19);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Complexity Rating: ${analysis.complexityRating || 'Moderate'}`, 85, y + 10);
    doc.text(`Resume Impact: ${analysis.rating || 'Evaluated'}`, 85, y + 15);
    if (analysis.analysisDate) {
      doc.text(`Audit Date: ${new Date(analysis.analysisDate).toLocaleDateString('en-US')}`, 85, y + 20);
    }
    y += 33;

    // Category Breakdown (if available)
    if (analysis.categoryScores) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text('EVALUATION CATEGORY BREAKDOWN', 15, y);
      y += 6;

      const cats = [
        { label: 'Architecture & System Design', score: analysis.categoryScores.architectureSystemDesign, max: 20 },
        { label: 'Technical Complexity', score: analysis.categoryScores.technicalComplexity, max: 20 },
        { label: 'Technology Stack', score: analysis.categoryScores.technologyStack, max: 15 },
        { label: 'Data & Database Architecture', score: analysis.categoryScores.dataBackendDatabase, max: 15 },
        { label: 'Security & Authentication', score: analysis.categoryScores.securityAuthentication, max: 10 },
        { label: 'Scalability & Performance', score: analysis.categoryScores.scalabilityPerformance, max: 10 },
        { label: 'Testing & Reliability', score: analysis.categoryScores.testingReliability, max: 5 },
        { label: 'Deployment & DevOps', score: analysis.categoryScores.deploymentDevops, max: 5 },
      ];

      doc.setFontSize(8);
      cats.forEach((cat, idx) => {
        const isLeft = idx % 2 === 0;
        const xPos = isLeft ? 18 : 105;
        const currentY = y + Math.floor(idx / 2) * 5.5;

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${cat.label}:`, xPos, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(37, 99, 235);
        doc.text(`${cat.score}/${cat.max}`, xPos + 60, currentY);
      });

      y += Math.ceil(cats.length / 2) * 5.5 + 4;
    }

    // Real-World Value & Resume Impact
    if (analysis.realWorldValue || analysis.resumeImpact || analysis.resumeImpactValue) {
      y = checkPageBreak(doc, y, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text('REAL-WORLD VALUE & RECRUITER POSITIONING', 15, y);
      y += 5;

      if (analysis.realWorldValue) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('Real-World Utility: ', 18, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        y = addWrappedText(doc, analysis.realWorldValue, 48, y + 4, 144, 4.2);
        y += 2;
      }

      const impactTxt = analysis.resumeImpact || analysis.resumeImpactValue;
      if (impactTxt) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text('Resume Impact: ', 18, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        y = addWrappedText(doc, impactTxt, 48, y + 4, 144, 4.2);
        y += 4;
      }
    }

    // Evaluated Tech
    if (Array.isArray(analysis.technologiesEvaluated) && analysis.technologiesEvaluated.length > 0) {
      y = checkPageBreak(doc, y, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text('TECHNOLOGIES EVALUATED & INDUSTRY DEMAND', 15, y);
      y += 5;

      analysis.technologiesEvaluated.forEach((t: any) => {
        y = checkPageBreak(doc, y, 8);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${t.name}: `, 18, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`${t.relevance} (Demand: ${t.industryDemand})`, 50, y + 4);
        y += 6;
      });
      y += 4;
    }

    // Missing Production Upgrades
    const missing = analysis.missingProductionUpgrades || analysis.missingImprovements || [];
    if (Array.isArray(missing) && missing.length > 0) {
      y = checkPageBreak(doc, y, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(180, 83, 9);
      doc.text('MISSING PRODUCTION UPGRADES', 15, y);
      y += 5;

      missing.forEach((imp: string) => {
        y = checkPageBreak(doc, y, 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(146, 64, 14);
        y = addWrappedText(doc, `⚠ ${imp}`, 18, y + 4, 174, 4.2);
        y += 2;
      });
      y += 4;
    }

    // Actionable Recommendations
    const recs = analysis.actionableRecommendations || [];
    if (Array.isArray(recs) && recs.length > 0) {
      y = checkPageBreak(doc, y, 25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 58, 138);
      doc.text('ACTIONABLE RECRUITER POLISH RECOMMENDATIONS', 15, y);
      y += 5;

      recs.forEach((rec: string, idx: number) => {
        y = checkPageBreak(doc, y, 10);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        doc.text(`${idx + 1}.`, 18, y + 4);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        y = addWrappedText(doc, rec, 24, y + 4, 168, 4.2);
        y += 2;
      });
    }

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'PROJECT DEPTH AUDIT', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (analysis.projectTitle || 'Project').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Project_Analysis.pdf`);
  } catch (err) {
    console.error('Failed to export Project Analysis PDF:', err);
    throw new Error('Project Analysis PDF export failed.');
  }
}

// Syllabus Analysis PDF
export async function exportSyllabusAnalysisPDF(
  profile: UserProfile,
  analysis: SyllabusAnalysisResult,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('ACADEMIC SYLLABUS & INDUSTRY ALIGNMENT AUDIT', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Course: ${analysis.courseTitle}`, 15, y);
    y += 10;

    // Score Banner
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('CAREER RELEVANCE RATING', 22, y + 8);
    doc.setFontSize(18);
    doc.text(`${analysis.careerRelevanceScore}%`, 22, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Total Units Analyzed: ${analysis.totalModules}`, 85, y + 11);
    doc.text(`Industry Skill Gaps Detected: ${analysis.skillGaps.length}`, 85, y + 17);
    y += 30;

    // Modules
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('CURRICULUM UNITS & INDUSTRY APPLICATION', 15, y);
    y += 5;

    analysis.modules.forEach(m => {
      y = checkPageBreak(doc, y, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(m.unit, 18, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`[Priority: ${m.importance}]`, 195, y + 4, { align: 'right' });
      y += 4.5;

      doc.setTextColor(71, 85, 105);
      doc.text(`Topics: ${m.topics.join(', ')}`, 22, y + 4);
      y += 4.5;
      doc.text(`Industry Application: ${m.industryApplication}`, 22, y + 4);
      y += 7;
    });

    // Skill Gaps
    y = checkPageBreak(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('ACADEMIC CURRICULUM GAPS (STUDY OUTSIDE CLASS)', 15, y);
    y += 5;

    analysis.skillGaps.forEach(gap => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text(`⚠ ${gap}`, 18, y + 4);
      y += 6;
    });

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'SYLLABUS AUDIT', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (analysis.courseTitle || 'Syllabus').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Syllabus_Audit.pdf`);
  } catch (err) {
    console.error('Failed to export Syllabus Analysis PDF:', err);
    throw new Error('Syllabus Analysis PDF export failed.');
  }
}

// Internship Readiness PDF
export async function exportInternshipReadinessPDF(
  profile: UserProfile,
  analysis: InternshipReadinessResult,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('INTERNSHIP & CAMPUS PLACEMENT READINESS REPORT', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Target Role: ${analysis.targetRole}`, 15, y);
    y += 10;

    // Score Banner
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('INTERNSHIP READINESS PROBABILITY', 22, y + 8);
    doc.setFontSize(18);
    doc.text(`${analysis.readinessPercentage}%`, 22, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Tier: ${analysis.statusTier}`, 90, y + 12);
    doc.text(`Identified Blockers: ${analysis.blockers.length}`, 90, y + 17);
    y += 30;

    // Multi-role match percentages
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('ROLE MATCH BENCHMARKS', 15, y);
    y += 5;

    analysis.roleMatches.forEach(rm => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(rm.role, 18, y + 4);

      doc.setTextColor(37, 99, 235);
      doc.text(`${rm.matchPercent}% Match`, 160, y + 4);

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 6, 195, y + 6);
      y += 7;
    });
    y += 4;

    // Recommended Actions
    y = checkPageBreak(doc, y, 25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('PRIORITY ACTION PLAN (P0 / P1 / P2)', 15, y);
    y += 5;

    analysis.recommendedActions.forEach(act => {
      y = checkPageBreak(doc, y, 10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(act.priority === 'P0' ? 185 : 37, act.priority === 'P0' ? 28 : 99, act.priority === 'P0' ? 28 : 235);
      doc.text(`[${act.priority}]`, 18, y + 4);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(act.action, 32, y + 4);

      doc.setTextColor(100, 116, 139);
      doc.text(`(${act.timeEstimate})`, 195, y + 4, { align: 'right' });
      y += 6;
    });

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'INTERNSHIP READINESS', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Internship_Readiness.pdf`);
  } catch (err) {
    console.error('Failed to export Internship Readiness PDF:', err);
    throw new Error('Internship Readiness PDF export failed.');
  }
}

// GitHub Readiness PDF
export async function exportGitHubReadinessPDF(
  profile: UserProfile,
  analysis: GitHubReadinessAnalysis | GitHubReadinessResult,
  githubUrl: string,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('GITHUB REPOSITORY & CODE READINESS AUDIT', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Repository Link: ${githubUrl}`, 15, y);
    y += 10;

    // Score Banner
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('OVERALL GITHUB READINESS SCORE', 22, y + 8);
    doc.setFontSize(18);
    doc.text(`${analysis.overallScore}%`, 22, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Profile Strength: ${analysis.profileStrength}`, 90, y + 12);
    if ('categories' in analysis) {
      doc.text(
        `Projects: ${analysis.categories.projectQuality}/25 | README: ${analysis.categories.documentation}/20`,
        90,
        y + 17
      );
    } else {
      doc.text(`Project Quality: ${analysis.projectQuality}% | README Depth: ${analysis.readmeQuality}%`, 90, y + 17);
    }
    y += 30;

    // Checklist
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('RECRUITER SCREENING CHECKLIST', 15, y);
    y += 5;

    analysis.checklist.forEach((chk) => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(chk.item, 18, y + 4);

      doc.setFont('helvetica', 'bold');
      if (chk.passed) {
        doc.setTextColor(22, 101, 52);
        doc.text('✓ Passed', 170, y + 4);
      } else {
        doc.setTextColor(185, 28, 28);
        doc.text('Action Needed', 160, y + 4);
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 6, 195, y + 6);
      y += 7;
    });
    y += 4;

    // Recommendations
    y = checkPageBreak(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('HIGH-YIELD REPOSITORY RECOMMENDATIONS', 15, y);
    y += 5;

    analysis.recommendations.forEach((rec) => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${rec}`, 18, y + 4);
      y += 6;
    });

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'GITHUB AUDIT', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_GitHub_Readiness_Audit.pdf`);
  } catch (err) {
    console.error('Failed to export GitHub Readiness PDF:', err);
    throw new Error('GitHub Readiness PDF export failed.');
  }
}

// LinkedIn Readiness PDF
export async function exportLinkedInReadinessPDF(
  profile: UserProfile,
  analysis: LinkedInReadinessAnalysis,
  profileUrl: string,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('LINKEDIN PROFILE & RECRUITER READINESS AUDIT', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Profile: ${profileUrl}`, 15, y);
    y += 10;

    // Score Banner
    doc.setFillColor(10, 102, 194); // LinkedIn Blue #0A66C2
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('OVERALL LINKEDIN RECRUITER READINESS', 22, y + 8);
    doc.setFontSize(18);
    doc.text(`${analysis.overallScore}%`, 22, y + 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Readiness Tier: ${analysis.readinessTier}`, 90, y + 12);
    doc.text(
      `Headline: ${analysis.categories.headlinePositioning}/15 | Skills: ${analysis.categories.skillsTechnicalStack}/15 | Projects: ${analysis.categories.projectsPortfolio}/15`,
      90,
      y + 17
    );
    y += 30;

    // Checklist
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 102, 194);
    doc.text('RECRUITER VISIBILITY & SEARCH CHECKLIST', 15, y);
    y += 5;

    analysis.checklist.forEach((chk) => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(chk.item, 18, y + 4);

      doc.setFont('helvetica', 'bold');
      if (chk.passed) {
        doc.setTextColor(22, 101, 52);
        doc.text('✓ Passed', 170, y + 4);
      } else {
        doc.setTextColor(185, 28, 28);
        doc.text('Action Needed', 160, y + 4);
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(15, y + 6, 195, y + 6);
      y += 7;
    });
    y += 4;

    // Recommendations
    y = checkPageBreak(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 102, 194);
    doc.text('HIGH-IMPACT LINKEDIN PROFILE OPTIMIZATIONS', 15, y);
    y += 5;

    analysis.recommendations.forEach((rec) => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${rec}`, 18, y + 4);
      y += 6;
    });

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'LINKEDIN AUDIT', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_LinkedIn_Readiness_Audit.pdf`);
  } catch (err) {
    console.error('Failed to export LinkedIn Readiness PDF:', err);
    throw new Error('LinkedIn Readiness PDF export failed.');
  }
}

// AI Career Insights PDF
export async function exportAICareerInsightsPDF(
  profile: UserProfile,
  insights: AIInsightsResult,
  careerGoal: CareerGoal,
  readinessScore: ReadinessScore,
  isDemo: boolean = false
): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 30;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('AI CAREER INTELLIGENCE & INSIGHTS DOSSIER', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Candidate: ${profile.fullName || 'Student'} • Target Role: ${careerGoal.targetRole || 'AI/ML Engineer'}`, 15, y);
    y += 10;

    // Highlight Banner
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('HIGHEST IMPACT CAREER ACTION', 22, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    y = addWrappedText(doc, insights.highestImpactAction, 22, y + 13, 166, 4.2);
    y += 12;

    // Strong Areas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('CONFIRMED TECHNICAL STRENGTHS', 15, y);
    y += 5;

    insights.strongAreas.forEach(st => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(22, 101, 52);
      doc.text(`✓ ${st}`, 18, y + 4);
      y += 6;
    });
    y += 4;

    // Needs Improvement
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('HIGH PRIORITY SKILL & PORTFOLIO GAPS', 15, y);
    y += 5;

    insights.needsImprovement.forEach(gap => {
      y = checkPageBreak(doc, y, 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(185, 28, 28);
      doc.text(`⚠ ${gap}`, 18, y + 4);
      y += 6;
    });
    y += 4;

    // Recommended Next Step & Career Risk
    y = checkPageBreak(doc, y, 25);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 24, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text('IMMEDIATE RECOMMENDED STEP:', 19, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(insights.recommendedNextStep, 19, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text('CRITICAL RISK TO MITIGATE:', 19, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(insights.careerRisk, 70, y + 18);

    const numPages = doc.getNumberOfPages();
    for (let p = 1; p <= numPages; p++) {
      doc.setPage(p);
      addOfficialHeader(doc, 'AI CAREER INSIGHTS', isDemo);
    }
    addOfficialFooters(doc, isDemo);

    const safeName = (profile.fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_AI_Career_Insights.pdf`);
  } catch (err) {
    console.error('Failed to export AI Career Insights PDF:', err);
    throw new Error('AI Career Insights PDF export failed.');
  }
}
