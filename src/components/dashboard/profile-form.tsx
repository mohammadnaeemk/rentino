"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";

import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from "@/lib/validations";

export function ProfileForm() {
  const { user, loading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),

    defaultValues: {
      name: "",
      avatarUrl: "",
    },
  });

  // Sync form with authenticated user
  useEffect(() => {
    if (!user) return;

    reset({
      name: user.name ?? "",
      avatarUrl: user.avatar ?? "",
    });
  }, [user, reset]);

  const avatarUrl = watch("avatarUrl");
  const name = watch("name");

  async function onSubmit(data: ProfileUpdateInput) {
    try {
      const payload: {
        name: string;
        avatar?: string;
      } = {
        name: data.name.trim(),
      };

      if (data.avatarUrl?.trim()) {
        payload.avatar = data.avatarUrl.trim();
      }

      await api.put("/users/me", payload);

      toast.success("Profile updated");

      reset({
        name: data.name.trim(),
        avatarUrl: data.avatarUrl?.trim() ?? "",
      });
    } catch (error) {
      console.error("Profile update failed:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Could not update profile.",
      );
    }
  }

  // ---------------------------------------------
  // Loading skeleton
  // ---------------------------------------------

  if (authLoading || !user) {
    return (
      <Card className="max-w-xl">
        <CardHeader className="space-y-2">
          <div className="h-6 w-32 animate-pulse rounded-md bg-surface-muted" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-surface-muted" />
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Avatar + URL */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-surface-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-md bg-surface-muted" />
            <div className="h-3 w-52 animate-pulse rounded bg-surface-muted" />
          </div>

          {/* Button */}
          <div className="h-10 w-28 animate-pulse rounded-md bg-surface-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Your profile</CardTitle>
        <CardDescription>Update your account information.</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl || undefined} alt={name || "User"} />

              <AvatarFallback className="text-lg">
                {name ? name.slice(0, 2).toUpperCase() : "?"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1.5">
              <Label htmlFor="avatarUrl">Avatar URL</Label>

              <Input
                id="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
                {...register("avatarUrl")}
              />

              {errors.avatarUrl && (
                <p className="text-xs text-danger">
                  {errors.avatarUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>

            <Input id="name" {...register("name")} />

            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>

            <Input id="email" type="email" value={user.email ?? ""} disabled />

            <p className="text-xs text-muted">
              Email address cannot be changed.
            </p>
          </div>

          {/* Submit */}
          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
