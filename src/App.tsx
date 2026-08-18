import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudentTwinProvider } from './context/StudentTwinContext';
import { PublicView, ActiveTab } from './types';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { DemoPage } from './pages/DemoPage';

// Authenticated Dashboard Pages
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { MyProfilePage } from './pages/dashboard/MyProfilePage';
import { StudentProfilesPage } from './pages/dashboard/StudentProfilesPage';
import { SkillsPage } from './pages/dashboard/SkillsPage';
import { ProjectsPage } from './pages/dashboard/ProjectsPage';
import { AchievementsPage } from './pages/dashboard/AchievementsPage';
import { CareerGoalsPage } from './pages/dashboard/CareerGoalsPage';
import { ProgressAnalyticsPage } from './pages/dashboard/ProgressAnalyticsPage';
import { AICareerHubPage } from './pages/dashboard/AICareerHubPage';
import { SubscriptionUpgradePage } from './pages/dashboard/SubscriptionUpgradePage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Loading Spinner Component
const AppLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
    <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
      Booting Digital Twin OS...
    </p>
  </div>
);

// Main Content Router
const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (loading) {
    return <AppLoadingSpinner />;
  }

  // Authenticated Dashboard Experience
  if (user) {
    return (
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
        {activeTab === 'profile' && <MyProfilePage />}
        {activeTab === 'student-profiles' && <StudentProfilesPage />}
        {activeTab === 'skills' && <SkillsPage />}
        {activeTab === 'projects' && <ProjectsPage />}
        {activeTab === 'achievements' && <AchievementsPage />}
        {activeTab === 'goals' && <CareerGoalsPage />}
        {activeTab === 'analytics' && <ProgressAnalyticsPage setActiveTab={setActiveTab} />}
        
        {/* AI Career OS Tools */}
        {activeTab === 'ai-assistant' && <AICareerHubPage initialTool="assistant" />}
        {activeTab === 'ai-resume-builder' && <AICareerHubPage initialTool="resume-builder" />}
        {activeTab === 'ai-resume-analyzer' && <AICareerHubPage initialTool="resume" />}
        {activeTab === 'ai-syllabus-analyzer' && <AICareerHubPage initialTool="syllabus" />}
        {activeTab === 'ai-project-analyzer' && <AICareerHubPage initialTool="project" />}
        {activeTab === 'ai-career-roadmap' && <AICareerHubPage initialTool="roadmap" />}
        
        {/* Career & Readiness */}
        {activeTab === 'internship-readiness' && <AICareerHubPage initialTool="internship" />}
        {activeTab === 'career-simulator' && <AICareerHubPage initialTool="simulator" />}
        {activeTab === 'github-readiness' && <AICareerHubPage initialTool="github" />}
        {activeTab === 'linkedin-readiness' && <AICareerHubPage initialTool="linkedin" />}
        
        {/* AI Hub Direct */}
        {activeTab === 'ai-hub' && <AICareerHubPage />}
        
        {/* System */}
        {activeTab === 'subscription' && <SubscriptionUpgradePage />}
        {activeTab === 'settings' && <SettingsPage />}
      </DashboardLayout>
    );
  }

  // Public Landing / Auth / Try Demo Experience
  if (publicView === 'demo') {
    return <DemoPage setCurrentView={setPublicView} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar currentView={publicView} setCurrentView={setPublicView} />

      <main className="flex-1">
        {publicView === 'landing' && <LandingPage setCurrentView={setPublicView} />}
        {publicView === 'login' && <LoginPage setCurrentView={setPublicView} />}
        {publicView === 'signup' && <SignUpPage setCurrentView={setPublicView} />}
      </main>

      <Footer setCurrentView={setPublicView} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StudentTwinProvider>
          <AppContent />
        </StudentTwinProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
