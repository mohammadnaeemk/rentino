"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { api, ApiRequestError } from "@/lib/api";
import type { LoginInput, RegisterInput } from "@/lib/validations";
import type { User } from "@/types";
import { toast } from "sonner";

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken?: string;
  };
}

interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<void>;
  googleLogin: (idToken: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // HYDRATE CURRENT USER
  // =====================================================

  async function hydrate() {
    try {
      const response = await api.get<MeResponse>("/auth/me");

      setUser(response.data);
    } catch (error) {
      setUser(null);

      if (process.env.NODE_ENV === "development") {
        console.log("Auth hydration failed:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL AUTH CHECK
  // =====================================================

  useEffect(() => {
    hydrate();
  }, []);

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  async function login(input: LoginInput): Promise<User> {
    const response = await api.post<AuthResponse>("/auth/login", input, {
      auth: false,
    });

    const loggedInUser = response.data.user;

    setUser(loggedInUser);

    return loggedInUser;
  }

  // =====================================================
  // REGISTER
  // =====================================================

  async function register(input: RegisterInput) {
    const { confirmPassword, ...rest } = input;

    void confirmPassword;

    const response = await api.post<AuthResponse>("/auth/register", rest, {
      auth: false,
    });

    setUser(response.data.user);
  }

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  async function googleLogin(idToken: string): Promise<User> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          idToken,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new ApiRequestError(
        data.message || "Google login failed",
        response.status,
      );
    }

    const googleUser = data.data.user as User;

    // IMPORTANT:
    // Update AuthProvider state immediately
    setUser(googleUser);

    return googleUser;
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {
    try {
      await api.post("/auth/logout");

      setUser(null);

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);

      // Clear local state even if backend logout fails
      setUser(null);

      toast.error("Logout failed. Please try again.");
    }
  }

  // =====================================================
  // CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
