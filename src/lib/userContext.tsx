import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";
export type Goal = "lose" | "maintain" | "gain";
export type Diet = "none" | "vegetarian" | "vegan" | "keto";

export type UserDoc = {
  _id: Id<"users">;
  email: string;
  name: string;
  onboardingComplete: boolean;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: Activity;
  goal: Goal;
  weeklyGoalKg: number;
  dietPreference?: Diet;
  goalCalories: number;
  goalProtein: number;
  goalCarbs: number;
  goalFat: number;
  goalWaterMl: number;
  createdAt: number;
};

type Ctx = {
  user: UserDoc | null;
  loading: boolean;
};

const UserContext = createContext<Ctx>({ user: null, loading: true });

/**
 * Device-scoped account: the app stores the user's email locally and
 * auto-creates the account server-side. No passwords in this first edition —
 * the device is the credential, matching the Cal AI mobile feel.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const read = () => setEmail(localStorage.getItem("calai_email"));
    read();
    setBooted(true);
    window.addEventListener("calai_email_changed", read);
    return () => window.removeEventListener("calai_email_changed", read);
  }, []);

  const user = useQuery(api.users.getByEmail, email ? { email } : "skip");
  const startIfNeeded = useMutation(api.users.startIfNeeded);

  useEffect(() => {
    if (!email) return;
    startIfNeeded({ email }).catch(() => {
      /* reactive query will surface state; retry happens on next focus */
    });
  }, [email, startIfNeeded]);

  const value: Ctx = {
    user: (user as UserDoc | undefined) ?? null,
    loading: !booted || (!!email && user === undefined),
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

export function getStoredEmail(): string | null {
  return localStorage.getItem("calai_email");
}

export function setStoredEmail(email: string) {
  localStorage.setItem("calai_email", email.trim().toLowerCase());
  window.dispatchEvent(new Event("calai_email_changed"));
}

export function signOutLocal() {
  localStorage.removeItem("calai_email");
  window.dispatchEvent(new Event("calai_email_changed"));
}
