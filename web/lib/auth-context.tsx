"use client";
/**
 * Cal AI — Auth Context
 *
 * Uses the shared PHP API client (lib/phpApi.ts) for all auth calls.
 * Dev: http://localhost:8000 | Prod: same-origin /api (static export).
 *
 * Stores the session token in localStorage.
 * Provides useAuth() hook for all pages.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Auth } from "./phpApi";

/* ── Types ── */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  avatarUrl?: string;
  weightKg?: number;
  heightCm?: number;
  ageYears?: number;
  gender?: string;
  onboarded?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

const TOKEN_KEY = "calai_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    setToken(stored);
    setHydrated(true);
  }, []);

  // Fetch session user via API route when token changes
  useEffect(() => {
    if (!hydrated) return;

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    Auth.getSessionUser(token)
      .then((data) => {
        setUser(data.user ?? null);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [hydrated, token]);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await Auth.signUp(name, email, password);
      const t = data.token;
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await Auth.signIn(email, password);
      const t = data.token;
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
    },
    []
  );

  const signOut = useCallback(async () => {
    if (token) {
      await Auth.signOut(token).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Access auth state anywhere in the app */
export function useAuth() {
  return useContext(AuthContext);
}
