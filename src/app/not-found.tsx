import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      {/* Icon */}
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />

        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
          <Compass className="h-8 w-8 text-primary" />
        </span>
      </span>

      {/* Error Code */}
      <span className="mt-5 font-mono text-xs text-muted">
        خطای ۴۰۴
      </span>

      {/* Heading */}
      <h1 className="mt-2 font-display text-3xl font-bold">
        صفحه پیدا نشد
      </h1>

      {/* Description */}
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
        صفحه‌ای که دنبالش بودید پیدا نشد. ممکن است جابه‌جا شده، تغییر نام داده یا
        هرگز وجود نداشته باشد.
      </p>

      {/* Actions */}
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            بازگشت به خانه
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/gear">
            <Search className="h-4 w-4" />
            جستجوی کالا
          </Link>
        </Button>
      </div>
    </div>
  );
}
