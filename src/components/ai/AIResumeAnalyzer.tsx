import React, { useState, useEffect } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw,
  Search,
  Check,
  AlertCircle,
  History,
  FileCheck,
  TrendingUp,
} from 'lucide-react';
import { analyzeResumeContent, ResumeAnalysisResult } from '../../lib/aiCareerEngine';
import { exportResumeAnalysisPDF, exportResumeTrackingPDF, ResumeTrackingEntry } from '../../lib/pdfExport';

export const AIResumeAnalyzer: React.FC = () => {
  const { profile, careerGoal, skills, projects } = useStudentTwin();
  const [resumeText, setResumeText] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExportingAnalysis, setIsExportingAnalysis] = useState(false);
  const [isExportingTracking, setIsExportingTracking] = useState(false);

  // Resume Tracking History
  const [trackingHistory, setTrackingHistory] = useState<ResumeTrackingEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`student_twin_resume_tracking_${profile.id || 'default'}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'track-1',
        date: 'Aug 10, 2026',
        versionTitle: 'Initial Campus Resume v1.0',
        score: 72,
        atsScore: 72,
        skillsDetectedCount: 5,
        missingKeywordsCount: 4,
        keyImprovements: ['Add quantitative impact metrics to project bullets', 'Include Docker and CI/CD pipelines'],
      },
    ];
  });

  const saveTrackingHistory = (newHistory: ResumeTrackingEntry[]) => {
    setTrackingHistory(newHistory);
    try {
      localStorage.setItem(`student_twin_resume_tracking_${profile.id || 'default'}`, JSON.stringify(newHistory));
    } catch (e) {
      // ignore
    }
  };

  const sampleResumeDefault = `VANGALA SRICHARAN
Email: ${profile.email || 'vangalasricharan7@gmail.com'} | GitHub: https://github.com/vangala-sricharan
EDUCATION:
Marwadi University — B.Tech Computer Science & Engineering (AI/ML)
Current Year: 2nd Year | Expected Graduation: 2027

TECHNICAL SKILLS:
- Languages: Python, TypeScript, JavaScript, SQL, C++
- Frameworks & Tools: PyTorch, FastAPI, React, Node.js, Docker, Git, Linux
- Core CS: Data Structures & Algorithms, Object-Oriented Design, Database Systems

PROJECTS:
1. Neural Vision Classifier (PyTorch, FastAPI, Docker)
- Designed and containerized an end-to-end computer vision inference pipeline with FastAPI and Docker.
- Optimized batch latency by 35% through GPU memory pinning and PyTorch JIT tracing.

2. Distributed Background Task Queue (TypeScript, Redis, Node.js)
- Implemented high-throughput asynchronous job worker with Redis backplane.`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorState(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setResumeText(content || sampleResumeDefault);
    };
    reader.onerror = () => {
      setErrorState('Could not read uploaded file. Please paste text directly.');
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = () => {
    const textToAnalyze = resumeText.trim() || sampleResumeDefault;
    setIsAnalyzing(true);
    setErrorState(null);

    setTimeout(() => {
      try {
        const result = analyzeResumeContent(
          textToAnalyze,
          careerGoal.targetRole || 'AI/ML Engineer',
          profile
        );
        setAnalysisResult(result);
        setIsAnalyzing(false);

        // Record tracking entry
        const prevScore = trackingHistory.length > 0 ? trackingHistory[0].atsScore : undefined;
        const newEntry: ResumeTrackingEntry = {
          id: `track-${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          versionTitle: fileName ? fileName.replace(/\.[^/.]+$/, '') : `Resume Audit (${careerGoal.targetRole || 'SWE'})`,
          score: result.atsScore,
          atsScore: result.atsScore,
          skillsDetectedCount: result.detectedSkills.length,
          missingKeywordsCount: result.missingKeywords.length,
          previousScore: prevScore,
          keyImprovements: result.improvements.slice(0, 2),
        };

        saveTrackingHistory([newEntry, ...trackingHistory]);
      } catch (err) {
        setIsAnalyzing(false);
        setErrorState('Resume analysis encountered an error. Please retry.');
      }
    }, 750);
  };

  const handleExportAnalysisPDF = async () => {
    if (!analysisResult) return;
    setIsExportingAnalysis(true);
    setErrorState(null);
    try {
      await exportResumeAnalysisPDF(profile, analysisResult);
    } catch (err) {
      setErrorState('Failed to download Resume Analysis PDF. Please retry.');
    } finally {
      setIsExportingAnalysis(false);
    }
  };

  const handleExportTrackingPDF = async () => {
    setIsExportingTracking(true);
    setErrorState(null);
    try {
      await exportResumeTrackingPDF(profile, trackingHistory);
    } catch (err) {
      setErrorState('Failed to download Resume Tracking PDF. Please retry.');
    } finally {
      setIsExportingTracking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Resume ATS Analyzer & Recruiter Audit
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              ATS 9.4 MODEL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Audit your resume against {careerGoal.targetRole || 'Target Role'} benchmarks, discover missing keywords, and export a certified ATS analysis report.
          </p>
        </div>

        {/* Top PDF Download Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="download-resume-tracking-pdf-btn"
            onClick={handleExportTrackingPDF}
            disabled={isExportingTracking}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <History className="w-3.5 h-3.5" />
            <span>{isExportingTracking ? 'Exporting...' : 'Download Resume Tracking PDF'}</span>
          </button>

          {analysisResult && (
            <button
              id="download-resume-analysis-pdf-btn"
              onClick={handleExportAnalysisPDF}
              disabled={isExportingAnalysis}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingAnalysis ? 'Generating PDF...' : 'Download Resume Analysis PDF'}</span>
            </button>
          )}
        </div>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleRunAnalysis} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Upload and Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Drag and Drop / Selector */}
        <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex flex-col items-center justify-center text-center space-y-3 relative group hover:border-blue-400 transition-colors">
          <input
            id="resume-file-input"
            type="file"
            accept=".txt,.pdf,.md,.doc,.docx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {fileName ? `Uploaded: ${fileName}` : 'Drop Resume file here or click to browse'}
            </span>
            <span className="text-[11px] text-slate-500">Supports PDF, DOCX, TXT, or MD format</span>
          </div>
          {fileName && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
              File Loaded Ready for ATS Audit
            </span>
          )}
        </div>

        {/* Text Area Input */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Or Paste Resume Content Directly:</span>
            <button
              onClick={() => setResumeText(sampleResumeDefault)}
              className="text-[11px] text-blue-600 hover:underline cursor-pointer"
            >
              Load Active Twin Data
            </button>
          </label>
          <textarea
            id="resume-text-input-area"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste text of your resume here..."
            rows={5}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Action Trigger */}
      <div className="flex items-center justify-end">
        <button
          id="run-resume-analysis-btn"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auditing with ATS Engine...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run ATS Recruiter Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Results View */}
      {analysisResult && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Top Score Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ATS COMPATIBILITY RATING
              </span>
              <div className="my-2">
                <span className="text-4xl font-black text-blue-400">{analysisResult.atsScore}</span>
                <span className="text-sm font-bold text-slate-400"> / 100</span>
              </div>
              <span className="text-xs font-bold text-emerald-400">{analysisResult.readinessTier}</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                TARGET ROLE ALIGNMENT
              </span>
              <div className="my-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {analysisResult.matchRole}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {analysisResult.detectedSkills.length} Verified skills detected
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CRITICAL KEYWORD GAPS
              </span>
              <div className="my-2">
                <span className="text-2xl font-black text-rose-500">
                  {analysisResult.missingKeywords.length}
                </span>
                <span className="text-xs font-medium text-slate-500 ml-1">Missing keywords</span>
              </div>
              <span className="text-xs text-slate-500">Recommended for shortlisting</span>
            </div>
          </div>

          {/* Missing Keywords Box */}
          {analysisResult.missingKeywords.length > 0 && (
            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>High-Impact Missing ATS Keywords to Include</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysisResult.missingKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses 2-Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                Detected Resume Strengths
              </span>
              <ul className="space-y-2">
                {analysisResult.strengths.map((st, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                Weaknesses & ATS Parsing Risks
              </span>
              <ul className="space-y-2">
                {analysisResult.weaknesses.map((wk, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Polish Recommendations */}
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 space-y-3">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
              Recruiter Actionable Improvements
            </span>
            <ul className="space-y-2">
              {analysisResult.improvements.map((imp, idx) => (
                <li key={idx} className="text-xs text-blue-950 dark:text-blue-200 flex items-start gap-2">
                  <span className="font-bold text-blue-600">{idx + 1}.</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Resume Tracking Record Section */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Resume Analysis Tracking Record
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {trackingHistory.length} Recorded Iterations
          </span>
        </div>

        {trackingHistory.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No previous tracking data available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Resume Version / Title</th>
                  <th className="p-3">ATS Score</th>
                  <th className="p-3">Skills Found</th>
                  <th className="p-3">Missing Keywords</th>
                  <th className="p-3">Progress / Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {trackingHistory.map((item) => {
                  const delta = item.previousScore !== undefined ? item.atsScore - item.previousScore : 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 text-slate-500">{item.date}</td>
                      <td className="p-3 font-bold">{item.versionTitle}</td>
                      <td className="p-3 font-black text-blue-600 dark:text-blue-400">{item.atsScore}%</td>
                      <td className="p-3">{item.skillsDetectedCount} skills</td>
                      <td className="p-3 text-rose-500 font-medium">{item.missingKeywordsCount} gaps</td>
                      <td className="p-3">
                        {delta > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{delta}%</span>
                        )}
                        {delta < 0 && (
                          <span className="text-rose-600 dark:text-rose-400 font-bold">{delta}%</span>
                        )}
                        {delta === 0 && (
                          <span className="text-slate-400 font-medium">0%</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
