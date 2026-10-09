"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Aperture, User, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { useAuth } from "@/lib/auth-context";
import { ApiRequestError } from "@/lib/api";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" },
  });

  const role = watch("role");

  async function onSubmit(data: RegisterInput) {
    setServerError(null);
    try {
      await registerUser(data);
      toast.success("حساب ساخته شد — به رنتینو خوش آمدید!");
      router.push(`/dashboard/${data.role.toLowerCase()}`);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : "خطا در برقراری ارتباط با سرور. دوباره تلاش کنید.";
      setServerError(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold">
          <Aperture className="h-6 w-6 text-primary" strokeWidth={1.75} />
          رنتینو
        </Link>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold">ساخت حساب کاربری</h1>
          <p className="mt-1 text-sm text-muted">کالا اجاره کنید یا کالای خودتان را برای دیگران ثبت کنید.</p>

          {serverError && (
            <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {serverError}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="نوع حساب">
            <button
              type="button"
              role="radio"
              aria-checked={role === "CUSTOMER"}
              onClick={() => setValue("role", "CUSTOMER")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm transition-colors",
                role === "CUSTOMER" ? "border-primary bg-primary/10" : "border-border hover:bg-surface-muted"
              )}
            >
              <User className="h-4 w-4" /> مشتری
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={role === "PROVIDER"}
              onClick={() => setValue("role", "PROVIDER")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-md border p-3 text-sm transition-colors",
                role === "PROVIDER" ? "border-primary bg-primary/10" : "border-border hover:bg-surface-muted"
              )}
            >
              <Store className="h-4 w-4" /> تأمین‌کننده
            </button>
          </div>
          {errors.role && <p className="mt-1 text-xs text-danger">{errors.role.message}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">نام کامل</Label>
              <Input id="name" placeholder="مثلاً: سارا محمدی" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" type="email" dir="ltr" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" type="password" dir="ltr" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <Input id="confirmPassword" type="password" dir="ltr" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              ساخت حساب
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            قبلاً حساب دارید؟{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              ورود
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
