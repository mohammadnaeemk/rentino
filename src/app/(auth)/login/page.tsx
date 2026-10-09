"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Aperture } from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { loginSchema, type LoginInput } from "@/lib/validations";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login, googleLogin } = useAuth();

  const router = useRouter();
  const params = useSearchParams();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // =====================================================
  // NORMAL LOGIN
  // =====================================================

  async function onSubmit(data: LoginInput) {
    setServerError(null);

    try {
      const user = await login(data);

      toast.success("Welcome back!");

      const next = params.get("next");

      router.replace(
        next?.startsWith("/") ? next : `/dashboard/${user.role.toLowerCase()}`,
      );
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "Something went wrong. Try again.";

      setServerError(message);
    }
  }

  // =====================================================
  // DEMO LOGIN
  // =====================================================

  function fillDemo(role: "customer" | "provider" | "admin") {
    const creds = {
      customer: {
        email: "demo.customer@lensloop.app",
        password: "Demo1234@",
      },

      provider: {
        email: "demo.provider@lensloop.app",
        password: "Demo1234@",
      },

      admin: {
        email: "admin@gmail.com",
        password: "123456abc@A",
      },
    }[role];

    setValue("email", creds.email);
    setValue("password", creds.password);

    setServerError(null);

    toast.success(
      `${role.charAt(0).toUpperCase() + role.slice(1)} demo credentials filled`,
    );
  }

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  async function handleGoogleSuccess(credential: string) {
    setServerError(null);

    try {
      const user = await googleLogin(credential);

      toast.success("Google login successful!");

      const next = params.get("next");

      router.replace(
        next?.startsWith("/") ? next : `/dashboard/${user.role.toLowerCase()}`,
      );
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Google login failed. Please try again.";

      setServerError(message);
      toast.error(message);
    }
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        {/* LOGO */}

        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold"
        >
          <Aperture className="h-6 w-6 text-primary" strokeWidth={1.75} />
          LensLoop
        </Link>

        {/* LOGIN CARD */}

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold">
            Log in to your account
          </h1>

          <p className="mt-1 text-sm text-muted">
            Book gear or manage your listings.
          </p>

          {/* SERVER ERROR */}

          {serverError && (
            <p
              className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger"
              role="alert"
            >
              {serverError}
            </p>
          )}

          {/* EMAIL / PASSWORD LOGIN */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-5 space-y-4"
            noValidate
          >
            {/* Email */}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Log in
            </Button>
          </form>

          {/* DEMO LOGIN */}

          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-xs uppercase tracking-wide text-muted">
              or try a demo
            </span>

            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fillDemo("customer")}
            >
              Customer
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fillDemo("provider")}
            >
              Provider
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => fillDemo("admin")}
            >
              Admin
            </Button>
          </div>

          {/* GOOGLE LOGIN */}

          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-xs uppercase tracking-wide text-muted">
              or continue with
            </span>

            <Separator className="flex-1" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (!credentialResponse.credential) {
                  const message =
                    "Google authentication failed. No credential received.";

                  setServerError(message);
                  toast.error(message);

                  return;
                }

                handleGoogleSuccess(credentialResponse.credential);
              }}
              onError={() => {
                const message = "Google login failed. Please try again.";

                setServerError(message);
                toast.error(message);
              }}
              width="100%"
            />
          </div>

          {/* REGISTER */}

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
