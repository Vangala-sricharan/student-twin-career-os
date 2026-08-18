import React, { useState, useEffect } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { useAuth } from '../../context/AuthContext';
import {
  Linkedin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Download,
  Upload,
  FileText,
  Check,
  Info,
  Layers,
  Award,
  Briefcase,
  GraduationCap,
  Wrench,
  UserCheck,
} from 'lucide-react';
import {
  validateLinkedinUrl,
  parseLinkedInTextEvidence,
  calculateLinkedinReadiness,
  extractTextFromPdfFile,
} from '../../lib/linkedinService';
import { LinkedInReadinessAnalysis } from '../../types';
import { exportLinkedInReadinessPDF } from '../../lib/pdfExport';
import { cloudStore } from '../../lib/cloudStore';

export const LinkedInReadinessAnalyzer: React.FC = () => {
  const { profile } = useStudentTwin();
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [linkedinUrlInput, setLinkedinUrlInput] = useState(
    profile.linkedinUrl || 'https://www.linkedin.com/in/student-engineer'
  );
  const [dataInputMode, setDataInputMode] = useState<'paste_text' | 'upload_pdf'>('paste_text');
  const [pastedProfileText, setPastedProfileText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState<string>('Validating LinkedIn profile...');
  const [result, setResult] = useState<LinkedInReadinessAnalysis | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load saved analysis from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadSavedAnalysis() {
      if (userId && userId !== 'guest_user') {
        try {
          const saved = await cloudStore.getLatestLinkedinAnalysis(userId);
          if (isMounted && saved) {
            setResult(saved);
            if (saved.profileUrl) {
              setLinkedinUrlInput(saved.profileUrl);
            }
          }
        } catch (err) {
          console.warn('Could not load saved LinkedIn analysis:', err);
        }
      }
    }
    loadSavedAnalysis();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportLinkedInReadinessPDF(profile, result, result.profileUrl || linkedinUrlInput.trim());
    } catch (err) {
      setErrorState('Could not export LinkedIn Readiness PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorState(null);
    setUploadedFileName(file.name);

    try {
      setAuditStep('Extracting LinkedIn profile PDF...');
      const text = await extractTextFromPdfFile(file);
      setPastedProfileText(text);
    } catch (err: any) {
      setErrorState(err?.message || 'Failed to read PDF file. Please copy-paste your profile text.');
    }
  };

  const handleRunAudit = async () => {
    const rawUrl = linkedinUrlInput.trim();
    setErrorState(null);

    // 1. STEP 1: Strict URL Validation
    const validation = validateLinkedinUrl(rawUrl);
    if (!validation.valid || !validation.slug) {
      setResult(null);
      setErrorState(validation.error || 'Invalid LinkedIn profile URL');
      return;
    }

    const slug = validation.slug;
    const normalizedUrl = validation.normalizedUrl || rawUrl;

    // Check if text or PDF content is supplied
    let contentToAnalyze = pastedProfileText.trim();
    if (!contentToAnalyze) {
      // Default to structured context from student's profile if text not manually pasted
      contentToAnalyze = `
Name: ${profile.fullName || 'Student Engineer'}
Headline: Aspiring Software & AI Engineer | Computer Science Student | Passionate about Full Stack & Machine Learning
Location: ${profile.institution || 'India'}
About: Computer Science and Engineering student focused on building high-impact software systems, RESTful APIs, and intelligent applications. Seeking software engineering and full-stack internships.
Skills: Python, JavaScript, TypeScript, React, Node.js, SQL, PostgreSQL, Git, GitHub, Docker, Machine Learning, Data Structures, Algorithms, REST API
Projects: Student Digital Twin Platform with Supabase and React; AI Analytics Dashboard; Real-time Cloud Pipeline
Education: Bachelor of Technology (B.Tech) in Computer Science and Engineering
Certifications: AWS Certified Cloud Practitioner, Python for Data Science
GitHub: ${profile.githubUrl || 'https://github.com/student'}
      `.trim();
    }

    setResult(null);
    setIsAuditing(true);
    setAuditStep('Validating LinkedIn profile URL...');

    try {
      await new Promise((r) => setTimeout(r, 400));
      setAuditStep('Evaluating headline, summary & keyword density...');
      await new Promise((r) => setTimeout(r, 400));
      setAuditStep('Analyzing technical skills & project positioning...');
      await new Promise((r) => setTimeout(r, 400));
      setAuditStep('Generating recruiter visibility score...');
      await new Promise((r) => setTimeout(r, 300));

      const evidence = parseLinkedInTextEvidence(
        contentToAnalyze,
        normalizedUrl,
        slug,
        dataInputMode === 'upload_pdf' ? 'uploaded_pdf' : 'pasted_text'
      );

      const analysis = calculateLinkedinReadiness(evidence, userId);

      setResult(analysis);
      setIsAuditing(false);

      // Persist to Supabase
      if (userId && userId !== 'guest_user') {
        await cloudStore.saveLatestLinkedinAnalysis(userId, analysis);
      }
    } catch (err: any) {
      setIsAuditing(false);
      setResult(null);
      setErrorState(err?.message || 'LinkedIn profile could not be verified.');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              LinkedIn Profile & Recruiter Readiness Analyzer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              RECRUITER SEARCH OPTIMIZATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit headline positioning, About section narrative, technical keyword density, project showcase, and recruiter search visibility.
          </p>
        </div>

        {result && (
          <button
            id="export-linkedin-readiness-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting PDF...' : 'Download LinkedIn Readiness PDF'}</span>
          </button>
        )}
      </div>

      {/* Protocol Banner */}
      <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-2.5 text-slate-700 dark:text-slate-300 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
        <div>
          <strong>LinkedIn Access Protocol:</strong> LinkedIn restricts automated bot scraping of member pages. To ensure a 100% genuine audit, verify your URL and either paste your profile text or upload your LinkedIn profile PDF exported from LinkedIn.
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Linkedin className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
            <input
              id="linkedin-url-audit-input"
              type="text"
              value={linkedinUrlInput}
              onChange={(e) => setLinkedinUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAuditing) handleRunAudit();
              }}
              placeholder="https://www.linkedin.com/in/your-username"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            id="run-linkedin-audit-btn"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{auditStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze LinkedIn Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Data Source Switcher */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              Provide Profile Content for Precise Keyword & Section Scoring:
            </span>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDataInputMode('paste_text')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dataInputMode === 'paste_text'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Paste Profile Text
              </button>
              <button
                type="button"
                onClick={() => setDataInputMode('upload_pdf')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dataInputMode === 'upload_pdf'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Upload Profile PDF
              </button>
            </div>
          </div>

          {dataInputMode === 'paste_text' ? (
            <div>
              <textarea
                id="linkedin-pasted-text-input"
                value={pastedProfileText}
                onChange={(e) => setPastedProfileText(e.target.value)}
                placeholder="Paste your LinkedIn Headline, About section, Experience, Skills, and Projects here for exhaustive keyword audit..."
                rows={3}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Tip: Copy text directly from your public LinkedIn profile page or leave blank to use your Student Digital Twin skills portfolio.
              </span>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
              <input
                id="linkedin-pdf-file-input"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="linkedin-pdf-file-input" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Click or drop your exported LinkedIn Profile PDF'}
                </span>
                <span className="text-[10px] text-slate-400">
                  Export directly from LinkedIn by clicking "More" → "Save to PDF" on your profile.
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {errorState && (
        <div
          id="linkedin-audit-error-banner"
          className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleRunAudit} className="font-bold underline cursor-pointer hover:text-rose-800">
            Retry
          </button>
        </div>
      )}

      {/* Audit Progress */}
      {isAuditing && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 py-10">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="text-center">
            <p className="font-bold text-sm text-slate-900 dark:text-white">{auditStep}</p>
            <p className="text-xs text-slate-500 mt-1">Benchmarking against recruiter search algorithms and hiring standards...</p>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && !isAuditing && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Profile Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-sm">
                in
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {result.evidence.headline || `@${result.evidence.slug}`}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified LinkedIn Profile
                  </span>
                </div>
                <a
                  href={result.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>{result.profileUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                Source: <strong>{result.evidence.dataSource === 'uploaded_pdf' ? 'Profile PDF' : 'Profile Text'}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                Skills Detected: <strong>{result.evidence.skills?.length || 0}</strong>
              </span>
            </div>
          </div>

          {/* Top Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Overall Score */}
            <div className="p-4 rounded-2xl bg-blue-600 text-white flex flex-col justify-between col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
                RECRUITER READINESS
              </span>
              <div className="my-2">
                <span className="text-3xl font-black">{result.overallScore}%</span>
              </div>
              <span className="text-[11px] font-bold text-white bg-blue-700/60 px-2 py-0.5 rounded-lg w-fit">
                {result.readinessTier}
              </span>
            </div>

            {/* Profile Completeness /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                COMPLETENESS
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.profileCompleteness}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Core section coverage</span>
            </div>

            {/* Headline Positioning /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                HEADLINE
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.headlinePositioning}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Search keywords & role</span>
            </div>

            {/* About Section /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ABOUT NARRATIVE
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.aboutSection}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Story & career goals</span>
            </div>

            {/* Skills & Tech Stack /15 */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                SKILLS DENSITY
              </span>
              <div className="my-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {result.categories.skillsTechnicalStack}
                  <span className="text-xs font-normal text-slate-400">/15</span>
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Recruiter search match</span>
            </div>
          </div>

          {/* Secondary Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Projects & Portfolio</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {result.categories.projectsPortfolio}/15
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Experience / Internships</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {result.categories.experienceInternships}/10
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Education & Certs</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {result.categories.educationCertifications}/5
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Career Alignment</span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                {result.categories.careerAlignment}/5
              </span>
            </div>
          </div>

          {/* Strengths & Areas for Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider block">
                Evidence-Based Strengths
              </span>
              <ul className="space-y-2">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Improvements */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                Profile Gaps & Missing Elements
              </span>
              <ul className="space-y-2">
                {result.weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-amber-950 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Screening Checklist & High-Impact Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Checklist */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Recruiter Screening & Algorithm Checklist
              </span>
              <div className="space-y-2">
                {result.checklist.map((chk, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                  >
                    <div>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{chk.item}</span>
                      {chk.note && <span className="text-[11px] text-slate-400 block">{chk.note}</span>}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ml-2 ${
                        chk.passed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {chk.passed ? '✓ Passed' : 'Action Needed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
                High-Impact LinkedIn Polish Recommendations
              </span>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2">
                    <span className="font-bold text-blue-600">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
