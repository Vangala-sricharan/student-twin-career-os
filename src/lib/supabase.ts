import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const supabaseUrl = rawUrl.replace(/\/+$/, '');
const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key' &&
  supabaseUrl.startsWith('https://')
);

// Initialize real Supabase client when configured, or fallback client
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Auth helper interface for client-first unified handling
export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
}

// Local mock auth storage for standalone local testing when Supabase keys are not yet provided
const LOCAL_AUTH_USERS_KEY = 'sdt_auth_users_db_v1';
const LOCAL_AUTH_SESSION_KEY = 'sdt_active_session_v1';

interface StoredMockUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: string;
}

export const fallbackAuth = {
  getStoredSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(LOCAL_AUTH_SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setStoredSession(session: AuthSession | null) {
    try {
      if (session) {
        localStorage.setItem(LOCAL_AUTH_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(LOCAL_AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to set session', e);
    }
  },

  getUsers(): StoredMockUser[] {
    try {
      const data = localStorage.getItem(LOCAL_AUTH_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveUser(user: StoredMockUser) {
    const users = this.getUsers().filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    users.push(user);
    localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
  },

  async signUp(email: string, password: string, fullName: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { user: null, error: new Error('User with this email already exists.') };
    }

    const newUser: StoredMockUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      email: cleanEmail,
      passwordHash: btoa(password),
      fullName: fullName.trim() || 'Student',
      createdAt: new Date().toISOString(),
    };

    this.saveUser(newUser);

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      user_metadata: {
        full_name: newUser.fullName,
      },
    };

    const session: AuthSession = {
      user: authUser,
      access_token: 'local_token_' + newUser.id,
    };

    this.setStoredSession(session);
    return { user: authUser, error: null };
  },

  async signInWithPassword(email: string, password: string): Promise<{ session: AuthSession | null; error: Error | null }> {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { session: null, error: new Error('Invalid email or password. Please check your credentials or create an account.') };
    }

    if (found.passwordHash !== btoa(password)) {
      return { session: null, error: new Error('Invalid email or password.') };
    }

    const authUser: AuthUser = {
      id: found.id,
      email: found.email,
      user_metadata: {
        full_name: found.fullName,
      },
    };

    const session: AuthSession = {
      user: authUser,
      access_token: 'local_token_' + found.id,
    };

    this.setStoredSession(session);
    return { session, error: null };
  },

  async signInWithOAuth(provider: 'google'): Promise<{ error: Error | null }> {
    await new Promise((r) => setTimeout(r, 400));
    // For local fallback when Supabase keys are not yet configured, create a clean Google auth session
    const mockEmail = 'student.google@example.edu';
    const authUser: AuthUser = {
      id: 'usr_goog_' + Math.random().toString(36).substring(2, 10),
      email: mockEmail,
      user_metadata: {
        full_name: 'Google Authenticated Student',
      },
    };
    const session: AuthSession = {
      user: authUser,
      access_token: 'google_token_' + authUser.id,
    };
    this.setStoredSession(session);
    return { error: null };
  },

  async signOut(): Promise<{ error: Error | null }> {
    this.setStoredSession(null);
    return { error: null };
  },

  async resetPasswordForEmail(email: string): Promise<{ error: Error | null }> {
    await new Promise((r) => setTimeout(r, 400));
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      // Return success anyway for security best practice
      return { error: null };
    }
    return { error: null };
  },
};
