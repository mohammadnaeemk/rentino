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
import type { Role, User } from "@/types";
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
  demoLogin: (role: Role) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo users: a real backend is not available yet, so the demo
// login buttons sign in with these in-memory accounts only.
const demoUsers: Record<Role, User> = {
  CUSTOMER: {
    id: "demo-customer",
    name: "کاربر نمونه",
    email: "customer@rentino.ir",
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  PROVIDER: {
    id: "demo-provider",
    name: "تأمین‌کننده نمونه",
    email: "provider@rentino.ir",
    role: "PROVIDER",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
  ADMIN: {
    id: "demo-admin",
    name: "مدیر رنتینو",
    email: "admin@rentino.ir",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  },
};

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  // DEMO LOGIN (no backend)
  // =====================================================

  async function demoLogin(role: Role): Promise<User> {
    const demoUser = demoUsers[role];

    setUser(demoUser);

    return demoUser;
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

      toast.success("با موفقیت خارج شدید");
    } catch (error) {
      console.error("Logout failed:", error);

      // Clear local state even if backend logout fails
      setUser(null);

      toast.error("خروج ناموفق بود. دوباره تلاش کنید.");
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
        demoLogin,
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
