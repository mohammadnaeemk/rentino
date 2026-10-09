"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
        <AlertTriangle className="h-8 w-8 animate-pulse text-danger" />
      </span>

      <h1 className="mt-5 font-display text-3xl font-bold">
        مشکلی پیش آمد
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        هنگام بارگذاری این صفحه خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کنید یا به
        صفحه اصلی بازگردید.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-muted">
          کد مرجع: <bdi>{error.digest}</bdi>
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCw className="h-4 w-4" /> تلاش دوباره
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> بازگشت به خانه
          </Link>
        </Button>
      </div>

      <p className="mt-8 text-xs text-muted">
        هنوز مشکل دارید؟{" "}
        <Link href="/contact" className="font-medium text-primary hover:underline">
          تماس با پشتیبانی
        </Link>
      </p>
    </div>
  );
}
