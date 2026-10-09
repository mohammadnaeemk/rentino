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
      toast.success("Account created — welcome to LensLoop!");
      router.push(`/dashboard/${data.role.toLowerCase()}`);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Something went wrong. Try again.";
      setServerError(message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-display text-lg font-semibold">
          <Aperture className="h-6 w-6 text-primary" strokeWidth={1.75} />
          LensLoop
        </Link>

        <div className="rounded-lg border border-border bg-background p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Rent gear, or list your own for others to book.</p>

          {serverError && (
            <p className="mt-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {serverError}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
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
              <User className="h-4 w-4" /> Customer
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
              <Store className="h-4 w-4" /> Provider
            </button>
          </div>
          {errors.role && <p className="mt-1 text-xs text-danger">{errors.role.message}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Jane Rahman" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
              {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input id="confirmPassword" type="password" placeholder="••••••••" {...register("confirmPassword")} />
              {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
