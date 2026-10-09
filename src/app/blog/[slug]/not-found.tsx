import Link from "next/link";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPostNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <FileX className="h-14 w-14 text-stone-400" />
      <h1 className="mt-4 font-display text-2xl font-bold">
        Article not found
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500">
        This post may have been unpublished or the link is outdated.
      </p>
      <Button asChild className="mt-6">
        <Link href="/blog">Back to journal</Link>
      </Button>
    </div>
  );
}
