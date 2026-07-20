import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Glp1State } from '../types';

interface AuthContextValue {
  session: Session | null;
  initializing: boolean;
  /** undefined = still loading, null = user has no GLP-1 profile yet */
  glp1State: Glp1State | null | undefined;
  refreshGlp1State: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [glp1State, setGlp1State] = useState<Glp1State | null | undefined>(
    undefined,
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  const refreshGlp1State = useCallback(async () => {
    if (!userId) {
      setGlp1State(undefined);
      return;
    }
    const { data } = await supabase
      .from('user_glp1_state')
      .select('injection_day, appetite_level, week_in_cycle, protein_goal_grams')
      .eq('user_id', userId)
      .maybeSingle();
    setGlp1State((data as Glp1State | null) ?? null);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setGlp1State(undefined);
      return;
    }
    setGlp1State(undefined);
    refreshGlp1State();
  }, [userId, refreshGlp1State]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, initializing, glp1State, refreshGlp1State, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
