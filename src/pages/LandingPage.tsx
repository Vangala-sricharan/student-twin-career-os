import React, { useState } from 'react';
import { PublicView } from '../types';
import {
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  GitBranch,
  Layers,
  CheckCircle2,
  Sparkles,
  Terminal,
  BrainCircuit,
  Award,
  ChevronRight,
  Play,
  UserPlus,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  setCurrentView: (view: PublicView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentView }) => {
  const [activeTabFeature, setActiveTabFeature] = useState<'skills' | 'projects' | 'readiness' | 'roadmap'>('readiness');

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-12 md:pt-20 lg:pt-28">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-500/15 via-indigo-500/15 to-cyan-400/15 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span>AI-Powered Engineering Career Readiness OS</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Model, Monitor & Accelerate Your{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Student Digital Twin
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Bridge the gap between engineering college curriculum and tier-1 tech careers. Your Digital Twin continuously tracks technical competencies, benchmarks repositories, and simulates real industry readiness.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="hero-build-twin-btn"
              onClick={() => setCurrentView('signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5"
            >
              <UserPlus className="w-5 h-5" />
              <span>Build Your Student Twin</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              id="hero-try-demo-btn"
              onClick={() => setCurrentView('demo')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 text-indigo-500" />
              <span>Try Demo</span>
            </button>

            <button
              id="hero-login-btn"
              onClick={() => setCurrentView('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span>Already registered? Log In</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Supabase Auth & Session Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <span>Isolated User Digital Twin State</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Multi-Dimensional Readiness Modeling</span>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DIGITAL TWIN ARCHITECTURE PREVIEW */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            Digital Twin Architecture
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How Your Engineering Twin Models Reality
          </h3>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Your Digital Twin isn't just a static resume. It is a live computational state machine representing your technical stack, architecture proficiency, and career velocity.
          </p>
        </div>

        {/* Feature Visualizer Box */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Visualizer Tabs */}
          <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-2 gap-2">
            {[
              { id: 'readiness' as const, label: 'Readiness Engine', icon: BarChart3 },
              { id: 'skills' as const, label: 'Skill Taxonomy', icon: Terminal },
              { id: 'projects' as const, label: 'Project Benchmarking', icon: GitBranch },
              { id: 'roadmap' as const, label: 'Career Trajectory', icon: Compass },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTabFeature === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`arch-tab-${tab.id}-btn`}
                  onClick={() => setActiveTabFeature(tab.id)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Visualizer Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            {activeTabFeature === 'readiness' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    Live Score Computation
                  </span>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Multi-Dimensional Engineering Readiness Metric
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Evaluates four core pillars: Technical Skills Coverage, Production Portfolio Complexity, Career Goal Alignment, and Verified Credentials. No subjective guesswork.
                  </p>
                  <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Quantitative weighted formula scaled from 0% to 100%</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Dynamic level progression: Early Stage → Developing → Career Ready → Elite</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Actionable breakdown showing exact steps to unlock the next tier</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Readiness Model</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">Career Ready Score</p>
                    </div>
                    <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">78%</span>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Skills Coverage (Core CS & Languages)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">85%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Project Portfolio & Repositories</span>
                        <span className="font-semibold text-slate-900 dark:text-white">72%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '72%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Industry Goal Alignment</span>
                        <span className="font-semibold text-slate-900 dark:text-white">80%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-600 dark:text-slate-400">Verifications & Achievements</span>
                        <span className="font-semibold text-slate-900 dark:text-white">70%</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTabFeature === 'skills' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    6-Category Taxonomy
                  </span>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Structured Engineering Competency Tracking
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Organize your knowledge base across Languages, Frameworks, Core Engineering & CS, DevOps & Cloud, Tools & Databases, and Collaborative Soft Skills.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">Proficiency Matrix</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Beginner to Expert</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">Verification Badges</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">Validated competencies</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-4">Sample Skill Matrix</p>
                  <div className="flex flex-wrap gap-2.5">
                    {['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'System Design', 'Algorithms', 'AWS', 'GraphQL', 'CI/CD Pipelines'].map((sk, idx) => (
                      <span
                        key={sk}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          idx % 2 === 0
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTabFeature === 'projects' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                    Production Portfolio
                  </span>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Verified Code Repositories & Deployments
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Showcase real engineering craftsmanship with direct links to GitHub repositories, live demo URLs, architecture summaries, and tech stack declarations.
                  </p>
                  <button
                    onClick={() => setCurrentView('signup')}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Start tracking your engineering projects</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">Distributed Task Scheduler</h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Completed
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      High-throughput job queue engine built in TypeScript & Redis.
                    </p>
                    <div className="flex gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                      <span className="text-blue-600 dark:text-blue-400">GitHub Repo</span> • <span className="text-emerald-600 dark:text-emerald-400">Live URL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTabFeature === 'roadmap' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                    Goal-Oriented Trajectory
                  </span>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Simulate Milestones Toward Your Dream Engineering Role
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Set target roles (e.g. AI Engineer, Full-Stack Architect), dream companies, timeline deadlines, and check off milestone challenges.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase">Milestone Progress</p>
                  {[
                    { text: 'Complete Core Systems & Algorithm Mastery', done: true },
                    { text: 'Ship 2 Production-Grade Full-Stack Applications', done: true },
                    { text: 'Contribute to Open Source or Win Hackathon', done: false },
                    { text: 'Mock Technical Interview Simulations', done: false },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${m.done ? 'bg-emerald-500 text-white' : 'border border-slate-300 dark:border-slate-600'}`}>
                        {m.done && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={m.done ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>{m.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MAJOR BENEFITS SECTION */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            Why Student Digital Twin
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built Exclusively for Engineering Students
          </h3>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Replace chaotic spreadsheets, outdated resumes, and disconnected project repos with one unified digital career engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Target,
              title: 'Skill Gap Analysis',
              desc: 'Pinpoint the exact technologies and frameworks required for your target engineering job before graduation.',
              color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
            },
            {
              icon: GitBranch,
              title: 'Repository Benchmarking',
              desc: 'Elevate your GitHub projects from toy scripts to production-grade architecture with verifiable live URLs.',
              color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900',
            },
            {
              icon: BrainCircuit,
              title: 'Career Milestone Simulator',
              desc: 'Step-by-step roadmap to guide you through DSA practice, system design, and hackathon achievements.',
              color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900',
            },
            {
              icon: Award,
              title: 'Verified Engineering Twin',
              desc: 'A permanent digital twin you own—scoped strictly to your authenticated Supabase user identity.',
              color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
            },
          ].map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${benefit.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{benefit.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING SECTION IN INR (₹) */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            Pricing Plans (INR)
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparent Pricing for Every Engineering Journey
          </h3>
          <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            All prices are billed in Indian Rupees (₹) with zero hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Plan 1: Starter */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Student Starter
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹0</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ forever free</span>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Core Digital Twin features for any engineering student starting out.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Digital Twin Profile</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Up to 15 Skills & 5 Projects</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Baseline Readiness Score Metric</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Supabase Cloud Auth</span>
                </li>
              </ul>
            </div>

            <button
              id="pricing-starter-btn"
              onClick={() => setCurrentView('signup')}
              className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2: Pro (Featured) */}
          <div className="relative bg-gradient-to-b from-blue-900/10 via-slate-900/5 to-transparent dark:from-blue-950/60 dark:to-slate-900 rounded-3xl p-8 border-2 border-blue-600 shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Career Pro Twin
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹299</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ month (or ₹1,499/yr)</span>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Advanced readiness analytics, deep project benchmarking, and priority simulations.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Unlimited Skills & Projects</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Advanced Readiness Simulator</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Target Company Gap Analyzer</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Verified Skill Credentials</span>
                </li>
              </ul>
            </div>

            <button
              id="pricing-pro-btn"
              onClick={() => setCurrentView('signup')}
              className="mt-8 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all"
            >
              Build Pro Student Twin
            </button>
          </div>

          {/* Plan 3: Campus Enterprise */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Campus Enterprise
              </span>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹14,999</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ cohort / year</span>
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Institutional deployment for engineering colleges, placement cells, and universities.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Cohort-wide Readiness Analytics</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Placement Cell Admin Console</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Custom Curriculum Mapping</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Dedicated Support & SLA</span>
                </li>
              </ul>
            </div>

            <button
              id="pricing-enterprise-btn"
              onClick={() => setCurrentView('signup')}
              className="mt-8 w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-sm transition-colors"
            >
              Contact Campus Advisory
            </button>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Build Your Engineering Career Digital Twin?
            </h3>
            <p className="text-blue-100 text-base sm:text-lg">
              Start modeling your skills, projects, and career milestones in under 2 minutes. Free forever for students.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                id="cta-build-twin-btn"
                onClick={() => setCurrentView('signup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-base shadow-lg hover:bg-blue-50 transition-all"
              >
                <UserPlus className="w-5 h-5" />
                <span>Build Your Student Twin</span>
              </button>
              <button
                id="cta-demo-btn"
                onClick={() => setCurrentView('demo')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-blue-700/60 hover:bg-blue-700 text-white font-semibold text-base border border-blue-400/40 transition-all"
              >
                <Play className="w-4 h-4" />
                <span>Try Demo</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
