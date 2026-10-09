import Link from "next/link";
import { FileX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPostNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <FileX className="h-14 w-14 text-muted" />
      <h1 className="mt-4 font-display text-2xl font-bold">
        نوشته یافت نشد
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        ممکن است این نوشته منتشر نشده باشد یا لینک قدیمی باشد.
      </p>
      <Button asChild className="mt-6">
        <Link href="/blog">بازگشت به وبلاگ</Link>
      </Button>
    </div>
  );
}
