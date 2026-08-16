import React, { useState } from 'react';
import { useStudentTwin } from '../../context/StudentTwinContext';
import {
  BookOpen,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  ListOrdered,
  Clock,
  Compass,
  Download,
} from 'lucide-react';
import { analyzeSyllabusContent, SyllabusAnalysisResult } from '../../lib/aiCareerEngine';
import { exportSyllabusAnalysisPDF } from '../../lib/pdfExport';

export const AISyllabusAnalyzer: React.FC = () => {
  const { profile } = useStudentTwin();
  const [syllabusText, setSyllabusText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SyllabusAnalysisResult | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    setErrorState(null);
    try {
      await exportSyllabusAnalysisPDF(profile, result);
    } catch (err) {
      setErrorState('Could not export Syllabus Analysis PDF. Please retry.');
    } finally {
      setIsExporting(false);
    }
  };

  const defaultSyllabus = `DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING (AI/ML)
COURSE SYLLABUS: APPLIED ARTIFICIAL INTELLIGENCE & NEURAL SYSTEMS
Semester: 4th Semester | Marwadi University

Unit 1: Introduction to Machine Learning Paradigms
- Supervised vs Unsupervised Learning, Linear Regression, Logistic Regression, Loss Functions, Gradient Descent Optimization.

Unit 2: Neural Networks & Deep Learning Foundations
- Multi-Layer Perceptrons, Activation Functions (ReLU, Softmax), Backpropagation, Convolutional Neural Networks (CNNs), Sequence Models (RNNs, LSTMs).

Unit 3: Modern Transformer Architectures & LLM Fundamentals
- Attention Mechanisms, Self-Attention, Positional Embeddings, BERT, GPT Architectures, Fine-Tuning Protocols.

Unit 4: Model Deployment & Production Pipelines
- REST API Model Serving (FastAPI), Containerization (Docker), Model Quantization, Cloud Inference Infrastructure.`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorState(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setSyllabusText(content || defaultSyllabus);
    };
    reader.onerror = () => {
      setErrorState('Could not read uploaded syllabus file. Please paste syllabus text.');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    const content = syllabusText.trim() || defaultSyllabus;
    setIsAnalyzing(true);
    setErrorState(null);

    setTimeout(() => {
      try {
        const analyzed = analyzeSyllabusContent(content);
        setResult(analyzed);
        setIsAnalyzing(false);
      } catch (err) {
        setIsAnalyzing(false);
        setErrorState('Syllabus analysis failed. Please try again.');
      }
    }, 750);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Syllabus & Curriculum Analyzer
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              CURRICULUM OS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Extract high-yield topics, detect missing industry skill gaps, and generate optimized study priorities from your college syllabus.
          </p>
        </div>

        {result && (
          <button
            id="export-syllabus-analysis-pdf-btn"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <BookOpen className="w-4 h-4" />
            <span>{isExporting ? 'Exporting PDF...' : 'Download Syllabus Analysis PDF'}</span>
          </button>
        )}
      </div>

      {/* Upload and Paste Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-950/40">
          <UploadCloud className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mb-2" />
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {fileName ? `Uploaded: ${fileName}` : 'Upload Syllabus (.txt / .pdf / .doc)'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Analyze semester subjects or course modules
          </p>

          <label className="mt-4 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-sm">
            <span>Choose Syllabus File</span>
            <input
              id="syllabus-file-upload-input"
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Or Paste Syllabus Text
            </span>
            <button
              onClick={() => setSyllabusText(defaultSyllabus)}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Load Sample CSE AI/ML Syllabus
            </button>
          </div>
          <textarea
            id="syllabus-paste-textarea"
            rows={5}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            placeholder="Paste syllabus text or course topics here..."
            className="w-full flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Action Trigger */}
      <div className="flex justify-end">
        <button
          id="run-syllabus-analysis-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Academic Topics...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Syllabus Breakdown</span>
            </>
          )}
        </button>
      </div>

      {errorState && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorState}</span>
          </div>
          <button onClick={handleAnalyze} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Result Presentation */}
      {result && (
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6">
          {/* Header Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                COURSE AUDIT COMPLETE
              </span>
              <h3 className="text-base sm:text-lg font-bold mt-1">{result.courseTitle}</h3>
              <p className="text-xs text-slate-300 mt-1">
                {result.totalModules} modules parsed • High placement alignment
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-300 uppercase font-bold">Career Relevance</p>
                <p className="text-2xl font-black text-emerald-400">{result.careerRelevanceScore}%</p>
              </div>
            </div>
          </div>

          {/* Module Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Topic Breakdown & Industry Applications
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.modules.map((mod, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{mod.unit}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      mod.importance === 'Critical'
                        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-900'
                        : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200 dark:border-indigo-900'
                    }`}>
                      {mod.importance} Yield
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mod.topics.map((t, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                    <strong>Industry Use:</strong> {mod.industryApplication}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gaps & Study Priorities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                Detected Academic vs Industry Skill Gaps
              </span>
              <ul className="space-y-2">
                {result.skillGaps.map((gap, idx) => (
                  <li key={idx} className="text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Recommended Learning Order
              </span>
              <div className="space-y-2">
                {result.recommendedLearningOrder.map((order, idx) => (
                  <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{order}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
