import {
  UserProfile,
  Skill,
  Project,
  Achievement,
  CareerGoal,
  SubscriptionPlan,
  GitHubReadinessAnalysis,
  LinkedInReadinessAnalysis,
  ProjectAnalysisRecord,
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

export interface UserCloudPayload {
  userId: string;
  profile: UserProfile;
  skills: Skill[];
  projects: Project[];
  achievements: Achievement[];
  careerGoalsList: CareerGoal[];
  activeGoalId: string;
  students: UserProfile[];
  activeStudentId: string;
  plan: SubscriptionPlan;
  hasCompletedOnboarding: boolean;
  lastUploadedAt: string;
}

const CLOUD_STORAGE_PREFIX = 'sdt_cloud_backup_v2_';
const USER_PLAN_PREFIX = 'sdt_user_plan_v2_';
const ONBOARDING_PREFIX = 'sdt_onboarding_done_v2_';
const GITHUB_ANALYSIS_PREFIX = 'sdt_github_analysis_v2_';
const LINKEDIN_ANALYSIS_PREFIX = 'sdt_linkedin_analysis_v2_';
const PROJECT_ANALYSIS_PREFIX = 'sdt_proj_analysis_v2_';

export const cloudStore = {
  // Get cloud backup for a specific authenticated user
  async getUserData(userId: string): Promise<UserCloudPayload | null> {
    if (!userId || userId === 'guest_user') return null;

    // 1. Check Supabase user metadata / cloud if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user?.id === userId && user.user_metadata?.student_twin_backup) {
          return user.user_metadata.student_twin_backup as UserCloudPayload;
        }
      } catch (err) {
        console.warn('Supabase cloud fetch notice:', err);
      }
    }

    // 2. Fallback to user-scoped persistent cloud store
    try {
      const raw = localStorage.getItem(`${CLOUD_STORAGE_PREFIX}${userId}`);
      if (raw) {
        return JSON.parse(raw) as UserCloudPayload;
      }
    } catch (e) {
      console.error('Failed to parse local cloud backup:', e);
    }

    return null;
  },

  // Upload/Save user's data to cloud
  async uploadUserData(userId: string, payload: Omit<UserCloudPayload, 'lastUploadedAt'>): Promise<{ success: boolean; error?: string; timestamp?: string }> {
    if (!userId || userId === 'guest_user') {
      return { success: false, error: 'User is not authenticated. Please log in to upload data.' };
    }

    const timestamp = new Date().toISOString();

    // Ensure we do not overwrite an upgraded plan with a stale plan from payload closure
    let authoritativePlan = payload.plan || 'free';
    try {
      const storedPlan = localStorage.getItem(`${USER_PLAN_PREFIX}${userId}`);
      if (storedPlan && ['free', 'pro_monthly', 'pro_annual', 'institution'].includes(storedPlan)) {
        if (storedPlan !== 'free') {
          authoritativePlan = storedPlan as SubscriptionPlan;
        }
      }
    } catch {}

    const fullPayload: UserCloudPayload = {
      ...payload,
      plan: authoritativePlan,
      lastUploadedAt: timestamp,
    };

    try {
      // 1. Save to user-isolated cloud storage key
      localStorage.setItem(`${CLOUD_STORAGE_PREFIX}${userId}`, JSON.stringify(fullPayload));
      localStorage.setItem(`${USER_PLAN_PREFIX}${userId}`, authoritativePlan);
      localStorage.setItem(`${ONBOARDING_PREFIX}${userId}`, fullPayload.hasCompletedOnboarding ? 'true' : 'false');

      // 2. If Supabase is active, persist into Supabase user metadata as well
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.auth.updateUser({
            data: {
              student_twin_backup: fullPayload,
              student_twin_plan: authoritativePlan,
            },
          });
          if (error) {
            console.warn('Supabase sync notice:', error.message);
          }
        } catch (supabaseErr) {
          console.warn('Supabase remote sync note:', supabaseErr);
        }
      }

      // Small simulation delay to provide clear network confirmation feedback
      await new Promise((r) => setTimeout(r, 600));

      return { success: true, timestamp };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Cloud storage error occurred.' };
    }
  },

  // Get user-specific plan (Defaults to 'free' for all new accounts)
  async getUserPlan(userId: string): Promise<SubscriptionPlan> {
    if (!userId || userId === 'guest_user') return 'free';

    // 1. Check Supabase user metadata / cloud if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user && user.id === userId) {
          const remotePlan = (user.user_metadata?.student_twin_plan || user.user_metadata?.student_twin_subscription?.plan) as string | undefined;
          if (remotePlan && ['free', 'pro_monthly', 'pro_annual', 'institution'].includes(remotePlan)) {
            // Keep local storage cache in sync
            localStorage.setItem(`${USER_PLAN_PREFIX}${userId}`, remotePlan);
            return remotePlan as SubscriptionPlan;
          } else if (remotePlan === 'pro') {
            const billingCycle = user.user_metadata?.student_twin_subscription?.billing_cycle || user.user_metadata?.student_twin_subscription?.billing_period;
            const resolved: SubscriptionPlan = billingCycle === 'monthly' ? 'pro_monthly' : 'pro_annual';
            localStorage.setItem(`${USER_PLAN_PREFIX}${userId}`, resolved);
            return resolved;
          }
        }
      } catch (err) {
        console.warn('Supabase remote plan fetch notice:', err);
      }
    }

    // 2. Check user-isolated local cache
    try {
      const stored = localStorage.getItem(`${USER_PLAN_PREFIX}${userId}`);
      if (stored && ['free', 'pro_monthly', 'pro_annual', 'institution'].includes(stored)) {
        return stored as SubscriptionPlan;
      }
    } catch {}

    return 'free';
  },

  // Set user-specific plan
  async setUserPlan(
    userId: string,
    plan: SubscriptionPlan,
    billingPeriod: 'monthly' | 'annual' = 'annual',
    price: number = 1499
  ): Promise<{ success: boolean; plan: SubscriptionPlan }> {
    if (!userId || userId === 'guest_user') {
      const err = 'User is not authenticated. Cannot persist subscription.';
      console.error('[cloudStore.setUserPlan Error]:', err);
      throw new Error(err);
    }

    const now = new Date();
    const upgradedAt = now.toISOString();
    const expiresDate = new Date(now);
    if (billingPeriod === 'monthly') {
      expiresDate.setMonth(expiresDate.getMonth() + 1);
    } else {
      expiresDate.setFullYear(expiresDate.getFullYear() + 1);
    }
    const expiresAt = expiresDate.toISOString();

    const subscriptionRecord = {
      user_id: userId,
      plan,
      billing_cycle: billingPeriod,
      billing_period: billingPeriod,
      price,
      payment_status: 'completed',
      subscription_status: 'active',
      upgraded_at: upgradedAt,
      expires_at: expiresAt,
      payment_reference: 'SIMULATED_UPI_VERIFIED_' + Date.now(),
      updated_at: upgradedAt,
    };

    try {
      // 1. Persist authoritative subscription state to Supabase
      if (isSupabaseConfigured && supabase) {
        // Existing backup payload if any
        const existing = await this.getUserData(userId);

        // 1. Update user metadata in Supabase Auth (authoritative)
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: {
            student_twin_plan: plan,
            student_twin_subscription: subscriptionRecord,
            ...(existing ? { student_twin_backup: { ...existing, plan } } : {}),
          },
        });

        if (authUpdateError) {
          console.error('[Supabase Auth updateUser Error]:', {
            message: authUpdateError.message,
            status: authUpdateError.status,
            code: (authUpdateError as any).code,
            userId,
          });
          throw new Error(`Supabase Auth Update Failed: ${authUpdateError.message}`);
        }

        // Also attempt table-level updates if subscriptions or profiles tables exist
        try {
          await supabase.from('subscriptions').upsert(subscriptionRecord);
        } catch (tableErr) {
          // Table may not exist or RLS policy, metadata is authoritative
        }
        try {
          await supabase.from('profiles').update({ plan }).eq('id', userId);
        } catch (tableErr) {
          // Table may not exist or RLS policy
        }

        // 2. Read back user metadata from Supabase to verify write
        const { data: verifyData, error: verifyError } = await supabase.auth.getUser();
        if (verifyError || !verifyData?.user) {
          console.error('[Supabase Auth getUser Verification Error]:', {
            message: verifyError?.message,
            status: verifyError?.status,
            code: (verifyError as any)?.code,
            userId,
          });
          throw new Error(`Failed to verify subscription with Supabase: ${verifyError?.message || 'User not found'}`);
        }

        const verifiedPlan = verifyData?.user?.user_metadata?.student_twin_plan;
        if (verifiedPlan !== plan) {
          const mismatchErr = `Verification failed: expected plan "${plan}", but Supabase returned "${verifiedPlan}".`;
          console.error('[Supabase Plan Verification Failed]:', mismatchErr);
          throw new Error(mismatchErr);
        }

        console.log('[Supabase Auth Subscription Persisted & Verified]:', {
          userId: verifyData.user.id,
          verifiedPlan,
          subscriptionRecord,
        });

        // 3. Keep local cache in sync only after successful backend verification
        localStorage.setItem(`${USER_PLAN_PREFIX}${userId}`, plan);
        if (existing) {
          existing.plan = plan;
          localStorage.setItem(`${CLOUD_STORAGE_PREFIX}${userId}`, JSON.stringify(existing));
        }
      } else {
        // Fallback local persistence only when Supabase is not configured
        localStorage.setItem(`${USER_PLAN_PREFIX}${userId}`, plan);
        const existing = await this.getUserData(userId);
        if (existing) {
          existing.plan = plan;
          localStorage.setItem(`${CLOUD_STORAGE_PREFIX}${userId}`, JSON.stringify(existing));
        }
      }

      return { success: true, plan };
    } catch (e) {
      console.error('[cloudStore.setUserPlan Failure]:', e);
      throw e;
    }
  },

  // Check if onboarding is completed
  hasCompletedOnboarding(userId: string): boolean {
    if (!userId || userId === 'guest_user') return false;
    try {
      return localStorage.getItem(`${ONBOARDING_PREFIX}${userId}`) === 'true';
    } catch {
      return false;
    }
  },

  // Mark onboarding completed
  setOnboardingCompleted(userId: string, completed = true): void {
    if (!userId || userId === 'guest_user') return;
    try {
      localStorage.setItem(`${ONBOARDING_PREFIX}${userId}`, completed ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set onboarding state', e);
    }
  },

  // Save Latest GitHub Readiness Analysis
  async saveLatestGithubAnalysis(
    userId: string,
    analysis: GitHubReadinessAnalysis
  ): Promise<void> {
    if (!userId || userId === 'guest_user') return;

    try {
      // 1. Save to local storage cache for the user
      localStorage.setItem(`${GITHUB_ANALYSIS_PREFIX}${userId}`, JSON.stringify(analysis));

      // 2. Persist to Supabase Auth metadata if configured
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.updateUser({
          data: {
            student_twin_github_analysis: analysis,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to persist GitHub analysis to Supabase:', err);
    }
  },

  // Get Latest GitHub Readiness Analysis
  async getLatestGithubAnalysis(
    userId: string
  ): Promise<GitHubReadinessAnalysis | null> {
    if (!userId || userId === 'guest_user') return null;

    // 1. Check Supabase metadata
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user?.id === userId && user.user_metadata?.student_twin_github_analysis) {
          const remote = user.user_metadata.student_twin_github_analysis as GitHubReadinessAnalysis;
          // Keep local cache in sync
          localStorage.setItem(`${GITHUB_ANALYSIS_PREFIX}${userId}`, JSON.stringify(remote));
          return remote;
        }
      } catch (err) {
        console.warn('Supabase remote GitHub analysis fetch note:', err);
      }
    }

    // 2. Check local storage cache
    try {
      const raw = localStorage.getItem(`${GITHUB_ANALYSIS_PREFIX}${userId}`);
      if (raw) {
        return JSON.parse(raw) as GitHubReadinessAnalysis;
      }
    } catch (e) {
      console.error('Failed to parse local GitHub analysis:', e);
    }

    return null;
  },

  // Save Latest LinkedIn Readiness Analysis
  async saveLatestLinkedinAnalysis(
    userId: string,
    analysis: LinkedInReadinessAnalysis
  ): Promise<void> {
    if (!userId || userId === 'guest_user') return;

    try {
      // 1. Save to local storage cache for the user
      localStorage.setItem(`${LINKEDIN_ANALYSIS_PREFIX}${userId}`, JSON.stringify(analysis));

      // 2. Persist to Supabase Auth metadata if configured
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.updateUser({
          data: {
            student_twin_linkedin_analysis: analysis,
          },
        });
      }
    } catch (err) {
      console.warn('Failed to persist LinkedIn analysis to Supabase:', err);
    }
  },

  // Get Latest LinkedIn Readiness Analysis
  async getLatestLinkedinAnalysis(
    userId: string
  ): Promise<LinkedInReadinessAnalysis | null> {
    if (!userId || userId === 'guest_user') return null;

    // 1. Check Supabase metadata
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user?.id === userId && user.user_metadata?.student_twin_linkedin_analysis) {
          const remote = user.user_metadata.student_twin_linkedin_analysis as LinkedInReadinessAnalysis;
          // Keep local cache in sync
          localStorage.setItem(`${LINKEDIN_ANALYSIS_PREFIX}${userId}`, JSON.stringify(remote));
          return remote;
        }
      } catch (err) {
        console.warn('Supabase remote LinkedIn analysis fetch note:', err);
      }
    }

    // 2. Check local storage cache
    try {
      const raw = localStorage.getItem(`${LINKEDIN_ANALYSIS_PREFIX}${userId}`);
      if (raw) {
        return JSON.parse(raw) as LinkedInReadinessAnalysis;
      }
    } catch (e) {
      console.error('Failed to parse local LinkedIn analysis:', e);
    }

    return null;
  },

  // Save Project Depth Analysis for specific (userId, projectId)
  async saveProjectAnalysis(
    userId: string,
    projectId: string,
    analysis: ProjectAnalysisRecord
  ): Promise<void> {
    if (!userId || !projectId) return;

    try {
      // 1. Save to local storage cache specifically keyed by userId + projectId
      localStorage.setItem(`${PROJECT_ANALYSIS_PREFIX}${userId}_${projectId}`, JSON.stringify(analysis));

      // 2. Persist to Supabase Auth metadata dictionary if configured
      if (isSupabaseConfigured && supabase && userId !== 'guest_user') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id === userId) {
          const currentMap = user.user_metadata?.student_twin_project_analyses || {};
          await supabase.auth.updateUser({
            data: {
              student_twin_project_analyses: {
                ...currentMap,
                [projectId]: analysis,
              },
            },
          });
        }
      }
    } catch (err) {
      console.warn('Failed to persist project analysis to Supabase:', err);
    }
  },

  // Get Saved Project Depth Analysis for specific (userId, projectId)
  async getProjectAnalysis(
    userId: string,
    projectId: string
  ): Promise<ProjectAnalysisRecord | null> {
    if (!userId || !projectId) return null;

    // 1. Check Supabase metadata
    if (isSupabaseConfigured && supabase && userId !== 'guest_user') {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!error && user?.id === userId && user.user_metadata?.student_twin_project_analyses?.[projectId]) {
          const remote = user.user_metadata.student_twin_project_analyses[projectId] as ProjectAnalysisRecord;
          localStorage.setItem(`${PROJECT_ANALYSIS_PREFIX}${userId}_${projectId}`, JSON.stringify(remote));
          return remote;
        }
      } catch (err) {
        console.warn('Supabase remote project analysis fetch note:', err);
      }
    }

    // 2. Check local storage cache
    try {
      const raw = localStorage.getItem(`${PROJECT_ANALYSIS_PREFIX}${userId}_${projectId}`);
      if (raw) {
        return JSON.parse(raw) as ProjectAnalysisRecord;
      }
    } catch (e) {
      console.error('Failed to parse local project analysis:', e);
    }

    return null;
  },
};

