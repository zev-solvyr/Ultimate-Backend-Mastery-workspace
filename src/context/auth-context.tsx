"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type SyncState = "synced" | "syncing" | "offline" | "error";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  syncState: SyncState;
  lastSyncedAt: string | null;
  setSyncState: (state: SyncState) => void;
  setLastSyncedAt: (timestamp: string) => void;
  signIn: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, pass: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  syncState: "offline",
  lastSyncedAt: null,
  setSyncState: () => {},
  setLastSyncedAt: () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncState, setSyncState] = useState<SyncState>("offline");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      setSyncState("offline");
      return;
    }

    const supabase = createClient();

    // Fetch active session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setSyncState("synced");
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setSyncState("synced");
      } else {
        setSyncState("offline");
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signIn = async (email: string, pass: string) => {
    if (!isConfigured) return { error: new Error("Supabase environment variables are not configured yet.") };
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (!error) {
      setSyncState("syncing");
    }
    return { error };
  };

  const signUp = async (email: string, pass: string) => {
    if (!isConfigured) return { error: new Error("Supabase environment variables are not configured yet.") };
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password: pass });
    return { error };
  };

  const signOut = async () => {
    if (!isConfigured) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSyncState("offline");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured,
        syncState,
        lastSyncedAt,
        setSyncState,
        setLastSyncedAt,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
