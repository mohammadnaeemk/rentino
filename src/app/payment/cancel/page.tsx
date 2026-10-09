import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md text-center">
        <XCircle className="mx-auto h-14 w-14 text-danger" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-semibold">Payment cancelled</h1>
        <p className="mt-2 text-sm text-muted">
          No charge was made. You can retry the payment any time from your rental history.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard/customer/orders">Back to my rentals</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
