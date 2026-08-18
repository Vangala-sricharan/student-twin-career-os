import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStudentTwin } from '../../context/StudentTwinContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  User,
  Users,
  Code2,
  FolderGit2,
  Award,
  Target,
  BarChart3,
  Bot,
  FileCheck2,
  FileText,
  BookOpen,
  Calendar,
  Briefcase,
  Sliders,
  Github,
  Linkedin,
  Zap,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Gauge,
  Search,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Sparkles,
  Check,
  UploadCloud,
  CloudCheck,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { FirstTimeOnboardingModal } from '../onboarding/FirstTimeOnboardingModal';
import { UpgradePaymentModal } from '../subscription/UpgradePaymentModal';

interface DashboardLayoutProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
  isDemo?: boolean;
  onExitDemo?: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  setActiveTab,
  children,
  isDemo = false,
  onExitDemo,
}) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    profile,
    skills,
    projects,
    achievements,
    careerGoal,
    readinessScore,
    students,
    activeStudentId,
    switchActiveStudent,
    cloudSyncStatus,
    uploadDataToCloud,
    plan,
    isOnboardingOpen,
    setIsOnboardingOpen,
  } = useStudentTwin();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [uploadToast, setUploadToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCloudUpload = async () => {
    const res = await uploadDataToCloud();
    if (res.success) {
      setUploadToast({ type: 'success', text: 'Data uploaded & backed up to Cloud successfully!' });
      setTimeout(() => setUploadToast(null), 4000);
    } else {
      setUploadToast({ type: 'error', text: res.error || 'Cloud sync failed.' });
      setTimeout(() => setUploadToast(null), 5000);
    }
  };

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setStudentDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Vangala Sricharan';

  const initials =
    displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'VS';

  const navSections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'student-profiles', label: 'Student Profiles', icon: Users, badge: students.length },
        { id: 'skills', label: 'Skills Matrix', icon: Code2, badge: skills.length },
        { id: 'projects', label: 'Projects', icon: FolderGit2, badge: projects.length },
        { id: 'achievements', label: 'Achievements', icon: Award, badge: achievements.length },
        { id: 'goals', label: 'Career Goals', icon: Target },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'AI CAREER OS',
      items: [
        { id: 'ai-assistant', label: 'AI Career Assistant', icon: Bot, badge: 'AI' },
        { id: 'ai-resume-builder', label: 'Resume Builder', icon: FileCheck2 },
        { id: 'ai-resume-analyzer', label: 'Resume Analyzer', icon: FileText },
        { id: 'ai-syllabus-analyzer', label: 'Syllabus Analyzer', icon: BookOpen },
        { id: 'ai-project-analyzer', label: 'Project Analyzer', icon: FolderGit2 },
        { id: 'ai-career-roadmap', label: 'AI Career Roadmap', icon: Calendar },
      ],
    },
    {
      title: 'CAREER & READINESS',
      items: [
        { id: 'internship-readiness', label: 'Internship Readiness', icon: Briefcase },
        { id: 'career-simulator', label: 'Career Simulator', icon: Sliders },
        { id: 'github-readiness', label: 'GitHub Readiness', icon: Github },
        { id: 'linkedin-readiness', label: 'LinkedIn Readiness', icon: Linkedin },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'subscription', label: 'Subscription / Upgrade', icon: Zap },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Search indexing
  const q = searchQuery.toLowerCase().trim();
  const matchingSkills = q ? skills.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) : [];
  const matchingProjects = q ? projects.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.techStack.some((t) => t.toLowerCase().includes(q))) : [];
  const matchingAchievements = q ? achievements.filter((a) => a.title.toLowerCase().includes(q) || a.issuer.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)) : [];
  const matchingGoals = q && (careerGoal?.targetRole.toLowerCase().includes(q) || careerGoal?.targetCompanies.some((c) => c.toLowerCase().includes(q))) ? [careerGoal] : [];

  const totalResults = matchingSkills.length + matchingProjects.length + matchingAchievements.length + matchingGoals.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden sticky top-0 z-40 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            id="dashboard-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer"
            aria-label="Open navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm">
              DT
            </div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm">
              Student Twin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Global Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <div
            onClick={() => setActiveTab('analytics')}
            className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{readinessScore.overall}%</span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>
        </div>
      </header>

      {/* Main Full-Height Layout Container */}
      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col justify-between sticky top-0 h-screen overflow-hidden">
          <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
            {/* Brand Header */}
            <div className="p-5 pb-3">
              <div className="flex items-center gap-2.5 mb-0.5">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-sm shadow-blue-500/20">
                  DT
                </div>
                <div>
                  <h1 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight tracking-tight">
                    Student Digital Twin
                  </h1>
                </div>
              </div>
              <div className="flex items-center justify-between pl-0.5 mt-1">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest">
                  AI Career OS
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Build 3 Final
                </span>
              </div>
            </div>

            {/* Active Student Selector / Quick Switcher Card */}
            <div className="px-3 mb-3 relative">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    Active Student Profile
                  </span>
                  <button
                    onClick={() => setActiveTab('student-profiles')}
                    className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Manage ({students.length})
                  </button>
                </div>

                <button
                  id="sidebar-active-student-switcher-btn"
                  onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                  className="w-full flex items-center justify-between p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left hover:border-blue-500/60 transition-all cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {displayName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">
                        {profile?.institution || 'Marwadi University'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                </button>
              </div>

              {/* Student Switcher Dropdown */}
              {studentDropdownOpen && (
                <div className="absolute top-full left-3 right-3 mt-1 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Switch Student Profile
                  </div>
                  {students.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        switchActiveStudent(st.id);
                        setStudentDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        st.id === activeStudentId
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <div className="truncate">{st.fullName}</div>
                        <div className="text-[9px] text-slate-400 truncate">{st.careerGoal || 'AI/ML Engineer'}</div>
                      </div>
                      {st.id === activeStudentId && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />}
                    </button>
                  ))}
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setActiveTab('student-profiles');
                        setStudentDropdownOpen(false);
                      }}
                      className="w-full text-center py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg cursor-pointer"
                    >
                      + Add New Student
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Search Trigger */}
            <div className="px-3 mb-2">
              <button
                id="sidebar-quick-search-btn"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs hover:border-blue-500/60 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5" />
                  <span>Search twin...</span>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Nav Sections */}
            <nav className="px-3 space-y-4 pb-4">
              {navSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}-btn`}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-extrabold shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                              isActive
                                ? 'bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : item.badge === 'AI'
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>

          {/* Sidebar Bottom Controls */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2 bg-white dark:bg-slate-900">
            {/* Theme Toggle Pill */}
            <div
              onClick={toggleTheme}
              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                {theme === 'light' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <button
                type="button"
                className={`w-7 h-4 rounded-full relative transition-colors ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-xs transition-transform ${
                    theme === 'dark' ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Logout / Exit Demo Button */}
            {isDemo ? (
              <button
                id="sidebar-exit-demo-btn"
                onClick={onExitDemo}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Demo</span>
              </button>
            ) : (
              <button
                id="sidebar-logout-btn"
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xl overflow-y-auto">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                      DT
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        Student Twin
                      </span>
                      <p className="text-[9px] text-blue-500 uppercase font-black tracking-wider">
                        {isDemo ? 'Demo Mode' : 'AI Career OS'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {profile?.institution || 'Marwadi University'} • {profile?.careerGoal || 'AI/ML Engineer'}
                  </p>
                </div>

                <nav className="space-y-3">
                  {navSections.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      <div className="px-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {section.title}
                      </div>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </div>
                            {item.badge !== undefined && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {isDemo ? (
                  <button
                    onClick={onExitDemo}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Exit Demo</span>
                  </button>
                ) : (
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Demo Banner when in Demo Mode */}
          {isDemo && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider">
                  TRY DEMO
                </span>
                <span className="font-bold text-amber-900 dark:text-amber-300">
                  {displayName} (Demo)
                </span>
                <span className="hidden sm:inline text-amber-800/80 dark:text-amber-300/80">
                  • Marwadi University • Isolated Demo State
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="demo-banner-exit-btn"
                  onClick={onExitDemo}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* Top Header */}
          <header className="hidden lg:flex h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                {isDemo ? (
                  <>
                    Demo Profile: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{displayName} (Demo)</span>
                  </>
                ) : (
                  <>
                    Active Student: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{displayName}</span>
                    <span className="ml-2 text-xs font-normal text-slate-400">({profile?.institution || 'Marwadi University'} • {profile?.careerGoal || 'AI/ML Engineer'})</span>
                  </>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Upload Data to Cloud Button */}
              {!isDemo && (
                <button
                  id="topbar-upload-cloud-btn"
                  disabled={cloudSyncStatus.isSyncing}
                  onClick={handleCloudUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                  title={cloudSyncStatus.lastSyncedAt ? `Last uploaded: ${new Date(cloudSyncStatus.lastSyncedAt).toLocaleTimeString()}` : 'Save and sync profile to cloud'}
                >
                  {cloudSyncStatus.isSyncing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>{cloudSyncStatus.isSyncing ? 'Uploading...' : 'Upload Data to Cloud'}</span>
                </button>
              )}

              {/* Plan Badge / Upgrade Trigger */}
              {!isDemo && (
                <button
                  id="topbar-plan-badge-btn"
                  onClick={() => setActiveTab('subscription')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border cursor-pointer transition-colors ${
                    plan === 'pro_annual' || plan === 'pro_monthly'
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400'
                  }`}
                  title="Manage Subscription Plan"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{plan === 'pro_annual' ? 'PRO ANNUAL' : plan === 'pro_monthly' ? 'PRO MONTHLY' : 'FREE (₹0)'}</span>
                </button>
              )}

              {/* Top Bar Quick Search Button */}
              <button
                id="topbar-search-btn"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs hover:border-blue-500/60 transition-all cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search twin...</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  ⌘K
                </kbd>
              </button>

              <div
                onClick={() => setActiveTab('analytics')}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                title="View Progress Analytics"
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>{readinessScore.overall}% Ready</span>
              </div>

              {isDemo && onExitDemo && (
                <button
                  id="topbar-exit-demo-btn"
                  onClick={onExitDemo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Exit Demo</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('student-profiles')}
                title="Manage Student Profiles"
                className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center shadow-xs cursor-pointer transition-all"
              >
                {initials}
              </button>
            </div>
          </header>

          {/* Cloud Upload Toast Feedback */}
          {uploadToast && (
            <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 border transition-all animate-bounce bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              {uploadToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {uploadToast.text}
              </span>
            </div>
          )}

          {/* Page Workspace Canvas */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Search Input Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-blue-600 shrink-0" />
              <input
                id="global-search-modal-input"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search skills, projects, achievements, and career goals..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Search Results */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {!searchQuery ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Quick Jump Navigation
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {navSections.flatMap((s) => s.items).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          setActiveTab(n.id);
                          setSearchOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : totalResults === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No matching items found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for terms like "Python", "Full Stack", "Hackathon", or "AWS".
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matching Skills */}
                  {matchingSkills.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Skills Matrix ({matchingSkills.length})
                      </span>
                      <div className="space-y-1.5">
                        {matchingSkills.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setActiveTab('skills');
                              setSearchOpen(false);
                            }}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-blue-500 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Code2 className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {s.name}
                              </span>
                              <span className="text-[10px] text-slate-400">({s.category})</span>
                            </div>
                            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <span>Jump to Skills</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Projects */}
                  {matchingProjects.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Projects ({matchingProjects.length})
                      </span>
                      <div className="space-y-1.5">
                        {matchingProjects.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setActiveTab('projects');
                              setSearchOpen(false);
                            }}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-indigo-500 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <FolderGit2 className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {p.title}
                              </span>
                              <span className="text-[10px] text-slate-400">({p.status})</span>
                            </div>
                            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <span>Jump to Projects</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Achievements */}
                  {matchingAchievements.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Achievements ({matchingAchievements.length})
                      </span>
                      <div className="space-y-1.5">
                        {matchingAchievements.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => {
                              setActiveTab('achievements');
                              setSearchOpen(false);
                            }}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-emerald-500 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Award className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {a.title}
                              </span>
                              <span className="text-[10px] text-slate-400">({a.issuer})</span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <span>Jump to Achievements</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Goals */}
                  {matchingGoals.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Career Goals
                      </span>
                      <div
                        onClick={() => {
                          setActiveTab('goals');
                          setSearchOpen(false);
                        }}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-purple-500 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Target className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {careerGoal?.targetRole}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <span>Jump to Goals</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* First Time Onboarding Modal for brand new authenticated users */}
      {!isDemo && (
        <FirstTimeOnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* Subscription Upgrade Modal */}
      <UpgradePaymentModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        targetPlan="pro_annual"
        billingPeriod="annual"
        onSuccess={(upgradedPlan) => {
          const label = upgradedPlan === 'pro_monthly' ? 'PRO MONTHLY (₹299/mo)' : 'PRO ANNUAL (₹1,499/yr)';
          setUploadToast({ type: 'success', text: `Simulated payment verified! Upgraded to ${label}.` });
          setTimeout(() => setUploadToast(null), 5000);
        }}
      />
    </div>
  );
};
