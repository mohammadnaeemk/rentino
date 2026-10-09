import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md text-center">
        <XCircle className="mx-auto h-14 w-14 text-danger" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-semibold">پرداخت لغو شد</h1>
        <p className="mt-2 text-sm text-muted">
          مبلغی از حساب شما کسر نشد. هر زمان خواستید می‌توانید از بخش اجاره‌های من
          پرداخت را دوباره انجام دهید.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/customer/orders">بازگشت به اجاره‌های من</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">بازگشت به خانه</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
