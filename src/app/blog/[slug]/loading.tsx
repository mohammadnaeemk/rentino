import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b border-border" />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* Back to Blog */}
          <Skeleton className="h-4 w-28" />

          {/* Header */}
          <header className="mx-auto mt-10 max-w-3xl text-center">
            {/* Category */}
            <Skeleton className="mx-auto h-6 w-20 rounded-full" />

            {/* Title */}
            <Skeleton className="mx-auto mt-6 h-12 w-4/5 sm:h-14" />
            <Skeleton className="mx-auto mt-3 h-12 w-3/5 sm:h-14" />

            {/* Excerpt */}
            <Skeleton className="mx-auto mt-7 h-5 w-4/5" />
            <Skeleton className="mx-auto mt-2 h-5 w-3/5" />

            {/* Author + Date */}
            <div className="mt-7 flex items-center justify-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-1.5 w-1.5 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </header>

          {/* Cover Image */}
          <div className="mx-auto mt-12 max-w-4xl sm:mt-14">
            <Skeleton className="aspect-video w-full rounded-2xl" />
          </div>

          {/* Content */}
          <div className="mx-auto mt-12 max-w-3xl space-y-4 sm:mt-16">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[95%]" />

            <Skeleton className="mt-6 h-5 w-full" />
            <Skeleton className="h-5 w-[90%]" />
            <Skeleton className="h-5 w-[75%]" />

            <Skeleton className="mt-6 h-5 w-full" />
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-5 w-2/3" />
          </div>

          {/* Bottom Navigation */}
          <div className="mx-auto mt-16 max-w-3xl border-t border-border pt-8 sm:mt-20">
            <Skeleton className="h-4 w-32" />
          </div>
        </article>
      </main>

      {/* Footer placeholder */}
      <div className="h-24 border-t border-border" />
    </div>
  );
}
