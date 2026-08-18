import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, supabaseUrl, fallbackAuth, AuthUser } from '../lib/supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null; requiresVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
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

  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<{ error: Error | null; requiresVerification?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Diagnostic] signUp request:', {
          supabaseRuntimeUrl: runtimeUrl,
          email: cleanEmail,
        });

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: 'https://student-twin-career-os.vercel.app',
            data: {
              full_name: cleanName,
            },
          },
        });

        if (error) {
          console.error('[Supabase Auth Diagnostic] signUp error:', {
            supabaseRuntimeUrl: runtimeUrl,
            email: cleanEmail,
            message: error.message,
            status: error.status,
            code: (error as any).code,
          });
          return { error: new Error(error.message), requiresVerification: false };
        }

        // Supabase returns empty identities when an account with that email already exists
        if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
          console.warn('[Supabase Auth Diagnostic] User already exists with email:', cleanEmail);
          return { error: new Error('An account with this email already exists. Please log in using your password.'), requiresVerification: false };
        }

        if (data.user) {
          console.log('[Supabase Auth Diagnostic] signUp result:', {
            supabaseRuntimeUrl: runtimeUrl,
            authenticatedUserId: data.user.id,
            email: data.user.email,
            hasSession: Boolean(data.session),
            emailConfirmedAt: (data.user as any).email_confirmed_at || null,
          });

          if (data.session) {
            // Real session exists
            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || cleanEmail,
              user_metadata: { full_name: cleanName, ...data.user.user_metadata },
            };
            setUser(authUser);
            setSession({ access_token: data.session.access_token });
            return { error: null, requiresVerification: false };
          } else {
            // Email confirmation is required by Supabase! DO NOT set React user or pretend authenticated.
            console.log('[Supabase Auth Diagnostic] Signup succeeded but email verification is required before login.');
            return { error: null, requiresVerification: true };
          }
        }
        return { error: null, requiresVerification: false };
      } else {
        // Fallback ONLY when Supabase keys are not configured
        const res = await fallbackAuth.signUp(cleanEmail, password, cleanName);
        if (res.error) return { error: res.error, requiresVerification: false };
        if (res.user) {
          setUser(res.user);
          setSession({ access_token: 'local_token_' + res.user.id });
        }
        return { error: null, requiresVerification: false };
      }
    } catch (e) {
      console.error('[Supabase Auth Diagnostic] signUp exception:', e);
      return { error: e instanceof Error ? e : new Error(String(e)), requiresVerification: false };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Diagnostic] signInWithPassword request:', {
          supabaseRuntimeUrl: runtimeUrl,
          email: cleanEmail,
        });

        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          console.error('[Supabase Auth Diagnostic] signInWithPassword error:', {
            supabaseRuntimeUrl: runtimeUrl,
            email: cleanEmail,
            message: error.message,
            status: error.status,
            code: (error as any).code,
          });

          const msgLower = (error.message || '').toLowerCase();
          const errCode = ((error as any).code || '').toLowerCase();

          if (
            msgLower.includes('email not confirmed') ||
            msgLower.includes('not verified') ||
            msgLower.includes('email_not_confirmed') ||
            errCode === 'email_not_confirmed'
          ) {
            return { error: new Error('Please verify your email before signing in.') };
          }

          if (
            msgLower.includes('invalid login credentials') ||
            msgLower.includes('invalid credentials') ||
            errCode === 'invalid_credentials'
          ) {
            return { error: new Error('Invalid login credentials') };
          }

          return { error: new Error(error.message) };
        }

        if (data.user && data.session) {
          console.log('[Supabase Auth Diagnostic] signInWithPassword SUCCESS:', {
            supabaseRuntimeUrl: runtimeUrl,
            authenticatedUserId: data.user.id,
            email: data.user.email,
            hasSession: Boolean(data.session),
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
      console.error('[Supabase Auth Diagnostic] signIn exception:', e);
      return { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }, []);

  const resendVerificationEmail = useCallback(async (email: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    const runtimeUrl = isSupabaseConfigured ? supabaseUrl : 'local-fallback';

    try {
      if (isSupabaseConfigured && supabase) {
        console.log('[Supabase Auth Diagnostic] resendVerificationEmail request:', {
          supabaseRuntimeUrl: runtimeUrl,
          email: cleanEmail,
        });

        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: 'https://student-twin-career-os.vercel.app',
          },
        });

        if (error) {
          console.error('[Supabase Auth Diagnostic] resendVerificationEmail error:', {
            supabaseRuntimeUrl: runtimeUrl,
            email: cleanEmail,
            message: error.message,
            status: error.status,
            code: (error as any).code,
          });
          return { error: new Error(error.message) };
        }

        console.log('[Supabase Auth Diagnostic] resendVerificationEmail SUCCESS');
        return { error: null };
      } else {
        return { error: null };
      }
    } catch (e) {
      console.error('[Supabase Auth Diagnostic] resendVerificationEmail exception:', e);
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
        resendVerificationEmail,
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
