import { UserProfile, Skill, Project, Achievement, CareerGoal, SubscriptionPlan } from '../types';
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
  ): Promise<void> {
    if (!userId || userId === 'guest_user') return;
    try {
      // 1. Update local cache
      localStorage.setItem(`${USER_PLAN_PREFIX}${userId}`, plan);
      
      // 2. Also update in cloud payload if it exists
      const existing = await this.getUserData(userId);
      if (existing) {
        existing.plan = plan;
        localStorage.setItem(`${CLOUD_STORAGE_PREFIX}${userId}`, JSON.stringify(existing));
      }

      // 3. Persist authoritative subscription state to Supabase
      if (isSupabaseConfigured && supabase) {
        const subscriptionRecord = {
          user_id: userId,
          plan,
          billing_period: billingPeriod,
          price,
          subscription_status: 'active',
          payment_reference: 'DEMO_UPI_VERIFIED_' + Date.now(),
          updated_at: new Date().toISOString(),
        };

        // Update user metadata in Supabase Auth
        await supabase.auth.updateUser({
          data: {
            student_twin_plan: plan,
            student_twin_subscription: subscriptionRecord,
          },
        });

        // Safely update subscriptions / profiles table if they exist
        try {
          await supabase.from('subscriptions').upsert(subscriptionRecord);
        } catch {}

        try {
          await supabase.from('profiles').update({ plan }).eq('id', userId);
        } catch {}
      }
    } catch (e) {
      console.error('Failed to set user plan in cloudStore', e);
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
};
