"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isWriter: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isAdmin: false,
  isWriter: false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      setProfile(data as UserProfile);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }

  function translateAuthError(msg: string): string {
    const map: Record<string, string> = {
      "Invalid login credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      "Email not confirmed": "البريد الإلكتروني غير مُكَدّس",
      "User already registered": "هذا البريد الإلكتروني مسجّل بالفعل",
      "Password should be at least 6 characters": "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
      "Unable to validate email address: invalid format": "صيغة البريد الإلكتروني غير صحيحة",
      "Signup requires a valid password": "يُرجى إدخال كلمة مرور صالحة",
      "Email rate limit exceeded": "تم تجاوز الحد المسموح من المحاولات. يُرجى المحاولة لاحقاً",
    };
    for (const [key, val] of Object.entries(map)) {
      if (msg.toLowerCase().includes(key.toLowerCase())) return val;
    }
    return msg || "حدث خطأ غير متوقع";
  }

  async function signIn(email: string, password: string) {
    try {
      const res = await fetch("/api/auth/auto-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();

      if (result.error) {
        return { error: translateAuthError(result.error) };
      }

      if (result.access_token && result.refresh_token) {
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
      }

      return {};
    } catch {
      return { error: "حدث خطأ غير متوقع" };
    }
  }

  async function signUp(email: string, password: string, username: string) {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const result = await res.json();

      if (result.error) {
        return { error: translateAuthError(result.error) };
      }

      if (result.access_token && result.refresh_token) {
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        return {};
      }

      return { error: result.message || "تم إنشاء الحساب بنجاح. يُرجى تسجيل الدخول." };
    } catch {
      return { error: "حدث خطأ غير متوقع" };
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        isAdmin: profile?.role === "admin",
        isWriter: profile?.role === "writer" || profile?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
