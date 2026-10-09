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
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rust-500/10">
        <AlertTriangle className="h-8 w-8 animate-pulse text-rust-500" />
      </span>

      <h1 className="mt-5 font-display text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        An unexpected error occurred while loading this page. Try again, or head
        back to the homepage.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-stone-400">
          Reference ID: {error.digest}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>
          <RotateCw className="h-4 w-4" /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Home className="h-4 w-4" /> Back to home
          </Link>
        </Button>
      </div>

      <p className="mt-8 text-xs text-stone-400">
        Still stuck?{" "}
        <Link
          href="/contact"
          className="font-medium text-forest-700 hover:underline dark:text-forest-300"
        >
          Contact support
        </Link>
      </p>
    </div>
  );
}
