import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, supabaseUrl, fallbackAuth, AuthUser } from '../lib/supabase';
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
      const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';
      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.getSession();
          console.log('[Supabase Auth Debug] initAuth getSession():', {
            runtimeSupabaseUrl: runtimeUrl,
            hasSession: Boolean(data?.session),
            userId: data?.session?.user?.id || null,
            error: error ? { message: error.message, status: error.status, code: (error as any).code } : null,
          });

          if (error) {
            console.error('[Supabase Auth Error] getSession failed:', {
              message: error.message,
              status: error.status,
              code: (error as any).code,
              runtimeSupabaseUrl: runtimeUrl,
            });
          }

          if (data?.session?.user && isMounted) {
            const sbUser = data.session.user;
            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || '',
              user_metadata: sbUser.user_metadata || {},
            };
            setUser(authUser);
            setSession({ access_token: data.session.access_token });
          }
        } else {
          // Only use local fallback when Supabase is NOT configured
          const localSession = fallbackAuth.getStoredSession();
          if (localSession && isMounted) {
            setUser(localSession.user);
            setSession({ access_token: localSession.access_token });
          }
        }
      } catch (err) {
        console.error('[Auth Init Error]:', err);
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
          console.log('[Supabase Auth Debug] onAuthStateChange event:', {
            event,
            runtimeSupabaseUrl: supabaseUrl,
            userId: sbSession?.user?.id || null,
            hasSession: Boolean(sbSession),
            hasAccessToken: Boolean(sbSession?.access_token),
          });

          if (sbSession?.user) {
            const sbUser = sbSession.user;
            const authUser: AuthUser = {
              id: sbUser.id,
              email: sbUser.email || '',
              user_metadata: sbUser.user_metadata || {},
            };
            setUser(authUser);
            setSession({ access_token: sbSession.access_token });
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
          }
          if (isMounted) {
            setLoading(false);
          }
        }
      );

      return () => {
        isMounted = false;
        authListener?.subscription?.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Debug] Executing supabase.auth.signUp:', {
          email: cleanEmail,
          runtimeSupabaseUrl: runtimeUrl,
        });

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          console.error('[Supabase Auth Error] signUp failed:', {
            message: error.message,
            status: error.status,
            code: (error as any).code,
            name: error.name,
            runtimeSupabaseUrl: runtimeUrl,
          });
          return { error: new Error(error.message) };
        }

        // Supabase returns empty identities when an account with that email already exists
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          console.warn('[Supabase Auth Warning] User already registered with this email:', cleanEmail);
          return { error: new Error('An account with this email already exists. Please log in using your password.') };
        }

        if (data.user) {
          console.log('[Supabase Auth Debug] signUp created user:', {
            userId: data.user.id,
            email: data.user.email,
            hasSession: Boolean(data.session),
            emailConfirmedAt: (data.user as any).email_confirmed_at,
            runtimeSupabaseUrl: runtimeUrl,
          });

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            user_metadata: { full_name: cleanName, ...data.user.user_metadata },
          };
          setUser(authUser);

          if (data.session) {
            setSession({ access_token: data.session.access_token });
          } else {
            console.warn('[Supabase Auth Warning] signUp did not return an active session. If email confirmation is enabled in your Supabase project settings, the user must confirm email before logging in again with signInWithPassword.');
          }
        }
        return { error: null };
      } else {
        // Fallback ONLY when Supabase keys are not configured
        const res = await fallbackAuth.signUp(cleanEmail, password, cleanName);
        if (res.error) return { error: res.error };
        if (res.user) {
          setUser(res.user);
          setSession({ access_token: 'local_token_' + res.user.id });
        }
        return { error: null };
      }
    } catch (e) {
      console.error('[Auth Exception] signUp caught error:', e);
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Debug] Executing supabase.auth.signInWithPassword:', {
          email: cleanEmail,
          runtimeSupabaseUrl: runtimeUrl,
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          console.error('[Supabase Auth Error] signInWithPassword failed:', {
            message: error.message,
            status: error.status,
            code: (error as any).code,
            name: error.name,
            runtimeSupabaseUrl: runtimeUrl,
          });
          return { error: new Error(error.message) };
        }

        if (data.user && data.session) {
          console.log('[Supabase Auth Debug] signInWithPassword SUCCESS:', {
            authenticatedUserId: data.user.id,
            email: data.user.email,
            hasSession: Boolean(data.session),
            runtimeSupabaseUrl: runtimeUrl,
          });

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            user_metadata: data.user.user_metadata || {},
          };
          setUser(authUser);
          setSession({ access_token: data.session.access_token });
        }
        return { error: null };
      } else {
        // Fallback ONLY when Supabase keys are not configured
        const res = await fallbackAuth.signInWithPassword(cleanEmail, password);
        if (res.error) return { error: res.error };
        if (res.session) {
          setUser(res.session.user);
          setSession({ access_token: res.session.access_token });
        }
        return { error: null };
      }
    } catch (e) {
      console.error('[Auth Exception] signIn caught error:', e);
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<{ error: Error | null }> => {
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';
    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Debug] Executing signInWithOAuth (Google):', {
          runtimeSupabaseUrl: runtimeUrl,
        });
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) {
          console.error('[Supabase Auth Error] Google OAuth failed:', {
            message: error.message,
            status: error.status,
            code: (error as any).code,
            runtimeSupabaseUrl: runtimeUrl,
          });
          return { error: new Error(error.message) };
        }
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
      console.error('[Auth Exception] Google OAuth error:', e);
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';
    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Debug] Executing supabase.auth.signOut:', {
          runtimeSupabaseUrl: runtimeUrl,
        });
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('[Supabase Auth Error] signOut failed:', {
            message: error.message,
            status: error.status,
            code: (error as any).code,
            runtimeSupabaseUrl: runtimeUrl,
          });
        }
      } else {
        await fallbackAuth.signOut();
      }
    } catch (err) {
      console.error('[Auth Exception] SignOut error:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          console.error('[Supabase Auth] resetPassword error:', error);
          return { error: new Error(error.message) };
        }
        return { error: null };
      } else {
        return await fallbackAuth.resetPasswordForEmail(cleanEmail);
      }
    } catch (e) {
      console.error('[Auth] Unexpected resetPassword error:', e);
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
