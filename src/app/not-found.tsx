import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      {/* Icon */}
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/10" />

        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <Compass className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </span>
      </span>

      {/* Error Code */}
      <span className="mt-5 font-mono text-xs uppercase tracking-[0.18em] text-stone-400">
        Error 404
      </span>

      {/* Heading */}
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">
        The trail ends here
      </h1>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm leading-6 text-stone-500">
        We couldn&apos;t find the page you&apos;re looking for. It may have been
        moved, renamed, or never existed.
      </p>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/gear">
            <Search className="h-4 w-4" />
            Browse gear
          </Link>
        </Button>
      </div>
    </div>
  );
}
