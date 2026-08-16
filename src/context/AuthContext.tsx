import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, fallbackAuth, AuthUser } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Supabase getSession error:', error);
          }
          if (data?.session && isMounted) {
            const sbUser = data.session.user;
            setUser({
              id: sbUser.id,
              email: sbUser.email || '',
              user_metadata: sbUser.user_metadata || {},
            });
            setSession({ access_token: data.session.access_token });
          }
        } else {
          // Check fallback stored session
          const localSession = fallbackAuth.getStoredSession();
          if (localSession && isMounted) {
            setUser(localSession.user);
            setSession({ access_token: localSession.access_token });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Supabase subscription if configured
    if (isSupabaseConfigured && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, sbSession: Session | null) => {
          if (sbSession) {
            setUser({
              id: sbSession.user.id,
              email: sbSession.user.email || '',
              user_metadata: sbSession.user.user_metadata || {},
            });
            setSession({ access_token: sbSession.access_token });
          } else {
            setUser(null);
            setSession(null);
          }
          setLoading(false);
        }
      );

      return () => {
        isMounted = false;
        authListener.subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });
        if (error) return { error: new Error(error.message) };
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: { full_name: fullName.trim(), ...data.user.user_metadata },
          });
          if (data.session) {
            setSession({ access_token: data.session.access_token });
          }
        }
        return { error: null };
      } else {
        const res = await fallbackAuth.signUp(email, password, fullName);
        if (res.error) return { error: res.error };
        if (res.user) {
          setUser(res.user);
          setSession({ access_token: 'local_token_' + res.user.id });
        }
        return { error: null };
      }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return { error: new Error(error.message) };
        if (data.user && data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            user_metadata: data.user.user_metadata || {},
          });
          setSession({ access_token: data.session.access_token });
        }
        return { error: null };
      } else {
        const res = await fallbackAuth.signInWithPassword(email, password);
        if (res.error) return { error: res.error };
        if (res.session) {
          setUser(res.session.user);
          setSession({ access_token: res.session.access_token });
        }
        return { error: null };
      }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error: Error | null }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) return { error: new Error(error.message) };
        return { error: null };
      } else {
        const res = await fallbackAuth.signInWithOAuth('google');
        if (res.error) return { error: res.error };
        const localSession = fallbackAuth.getStoredSession();
        if (localSession) {
          setUser(localSession.user);
          setSession({ access_token: localSession.access_token });
        }
        return { error: null };
      }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      } else {
        await fallbackAuth.signOut();
      }
    } catch (err) {
      console.error('SignOut error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error: Error | null }> => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { error: new Error(error.message) };
        return { error: null };
      } else {
        return await fallbackAuth.resetPasswordForEmail(email);
      }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
