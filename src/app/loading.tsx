import { Aperture } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9999] flex min-h-screen flex-col items-center justify-center bg-background"
    >
      {/* Loader */}
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer ring */}
        <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-border border-t-primary" />

        {/* Inner brand circle */}
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <Aperture className="h-5 w-5 animate-pulse" />
        </span>
      </div>

      {/* Brand / Loading text */}
      <div className="mt-6 flex flex-col items-center">
        <p className="font-display text-sm font-semibold text-foreground">
          در حال بارگذاری رنتینو
        </p>

        <div className="mt-2 flex items-center gap-1 text-xs text-muted">
          <span>در حال آماده‌سازی</span>

          <span className="flex gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-muted" />
          </span>
        </div>
      </div>

      {/* Subtle loading bar */}
      <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/2 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>

      {/* Screen-reader text */}
      <span className="sr-only">در حال بارگذاری، لطفاً منتظر بمانید…</span>
    </div>
  );
}
