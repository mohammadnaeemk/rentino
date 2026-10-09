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
import type { Role } from "@/types";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { login, googleLogin, demoLogin } = useAuth();

  const router = useRouter();
  const params = useSearchParams();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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

      toast.success("خوش آمدید!");

      const next = params.get("next");

      router.replace(
        next?.startsWith("/") ? next : `/dashboard/${user.role.toLowerCase()}`,
      );
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "خطا در برقراری ارتباط با سرور. دوباره تلاش کنید.";

      setServerError(message);
    }
  }

  // =====================================================
  // DEMO LOGIN (no backend required)
  // =====================================================

  async function handleDemoLogin(role: Role) {
    setServerError(null);

    const user = await demoLogin(role);

    toast.success("ورود آزمایشی انجام شد");

    const next = params.get("next");

    router.replace(
      next?.startsWith("/") ? next : `/dashboard/${user.role.toLowerCase()}`,
    );
  }

  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  async function handleGoogleSuccess(credential: string) {
    setServerError(null);

    try {
      const user = await googleLogin(credential);

      toast.success("ورود با گوگل انجام شد");

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
            : "ورود با گوگل ناموفق بود. دوباره تلاش کنید.";

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
          رنتینو
        </Link>

        {/* LOGIN CARD */}

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold">
            ورود به حساب کاربری
          </h1>

          <p className="mt-1 text-sm text-muted">
            کالا رزرو کنید یا آگهی‌هایتان را مدیریت کنید.
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
              <Label htmlFor="email">ایمیل</Label>

              <Input
                id="email"
                type="email"
                dir="ltr"
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
              <Label htmlFor="password">رمز عبور</Label>

              <Input
                id="password"
                type="password"
                dir="ltr"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              ورود
            </Button>
          </form>

          {/* DEMO LOGIN */}

          <div className="my-5 flex items-center gap-3">
            <Separator className="flex-1" />

            <span className="text-xs text-muted">یا نسخه آزمایشی</span>

            <Separator className="flex-1" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleDemoLogin("CUSTOMER")}
            >
              مشتری
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleDemoLogin("PROVIDER")}
            >
              تأمین‌کننده
            </Button>

            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
            >
              مدیر
            </Button>
          </div>

          {/* GOOGLE LOGIN (only when a client id is configured) */}

          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <>
              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1" />

                <span className="text-xs text-muted">یا ادامه با</span>

                <Separator className="flex-1" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (!credentialResponse.credential) {
                      const message =
                        "ورود با گوگل ناموفق بود؛ اعتبارنامه‌ای دریافت نشد.";

                      setServerError(message);
                      toast.error(message);

                      return;
                    }

                    handleGoogleSuccess(credentialResponse.credential);
                  }}
                  onError={() => {
                    const message = "ورود با گوگل ناموفق بود. دوباره تلاش کنید.";

                    setServerError(message);
                    toast.error(message);
                  }}
                  width="100%"
                />
              </div>
            </>
          )}

          {/* REGISTER */}

          <p className="mt-6 text-center text-sm text-muted">
            حساب ندارید؟{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              ساخت حساب
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
