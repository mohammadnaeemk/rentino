import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toFaDigits } from "@/lib/format";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-semibold">پرداخت موفق</h1>
        <p className="mt-2 text-sm text-muted">
          {order
            ? `سفارش ${toFaDigits(order)} تأیید شد.`
            : "سفارش شما تأیید شد."}{" "}
          رسید پرداخت به ایمیل شما ارسال شد.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/customer">رفتن به پنل کاربری</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/gear">جستجوی کالای بیشتر</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
