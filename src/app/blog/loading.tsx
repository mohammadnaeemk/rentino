import { Skeleton } from "@/components/ui/skeleton";

export default function BlogLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navbar placeholder */}
      <div className="h-16 border-b border-border" />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div>
          <Skeleton className="h-9 w-28" />
          <Skeleton className="mt-3 h-5 w-80 max-w-full" />
        </div>

        {/* Blog Cards */}
        <div className="mt-10 space-y-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-border p-6">
              {/* Date */}
              <Skeleton className="h-3 w-28" />

              {/* Category */}
              <Skeleton className="mt-3 h-3 w-20" />

              {/* Title */}
              <Skeleton className="mt-3 h-6 w-3/4" />

              {/* Excerpt */}
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />

              {/* Author */}
              <Skeleton className="mt-5 h-3 w-24" />
            </div>
          ))}
        </div>
      </main>

      {/* Footer placeholder */}
      <div className="h-24 border-t border-border" />
    </div>
  );
}
