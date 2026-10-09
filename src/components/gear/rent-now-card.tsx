"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { api, ApiRequestError } from "@/lib/api";
import { formatToman, formatDays } from "@/lib/format";
import type { GearItem } from "@/types";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

export function RentNowCard({ gear }: { gear: GearItem }) {
  const { user } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const diff =
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      86_400_000;
    return diff > 0 ? Math.ceil(diff) : 0;
  }, [startDate, endDate]);

  const total = days * gear.pricePerDay;
  const disabled = gear.availability !== "AVAILABLE" || days === 0;

  async function handleRent() {
    if (!user) {
      toast.info("برای ثبت رزرو ابتدا وارد حساب خود شوید");
      router.push(`/login?next=/gear/${gear.slug}`);
      return;
    }

    if (!startDate || !endDate || days <= 0) {
      toast.error("لطفاً تاریخ‌های معتبری برای اجاره انتخاب کنید.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/rentals", {
        startDate: new Date(`${startDate}T10:00:00`).toISOString(),
        endDate: new Date(`${endDate}T10:00:00`).toISOString(),
        notes: "",
        items: [
          {
            gearItemId: gear.id,
            quantity: 1,
          },
        ],
      });

      toast.success(
        `درخواست اجاره برای ${formatDays(days)} ثبت شد — در انتظار تأیید تأمین‌کننده.`,
      );

      router.push("/dashboard/customer");
    } catch (error) {
      console.error("Rental creation error:", error);

      toast.error(
        error instanceof ApiRequestError
          ? error.message
          : "ثبت درخواست اجاره ممکن نشد.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="sticky top-24">
      <CardContent className="p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-display text-2xl font-semibold">
              {formatToman(gear.pricePerDay)}
            </span>
            <span className="text-sm text-muted"> / روز</span>
          </div>
          {gear.availability !== "AVAILABLE" && (
            <span className="text-xs font-medium text-danger">
              در حال حاضر ناموجود
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="start" className="flex items-center gap-1 text-xs">
              <CalendarDays className="h-3.5 w-3.5" /> تحویل
            </Label>
            <Input
              id="start"
              type="date"
              min={todayISO()}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value >= endDate) setEndDate("");
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end" className="flex items-center gap-1 text-xs">
              <CalendarDays className="h-3.5 w-3.5" /> بازگشت
            </Label>
            <Input
              id="end"
              type="date"
              min={startDate || todayISO()}
              value={endDate}
              disabled={!startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {days > 0 && (
          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>
                {formatToman(gear.pricePerDay)} × {formatDays(days)}
              </span>
              <span>{formatToman(total)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>جمع کل</span>
              <span>{formatToman(total)}</span>
            </div>
          </div>
        )}

        <Button
          className="mt-4 w-full"
          size="lg"
          disabled={disabled}
          loading={submitting}
          onClick={handleRent}
        >
          {gear.availability === "AVAILABLE" ? "رزرو کنید" : "ناموجود"}
        </Button>
        <p className="mt-2 text-center text-xs text-muted">
          تا زمانی که تأمین‌کننده تأیید نکند، مبلغی از شما کسر نمی‌شود.
        </p>
      </CardContent>
    </Card>
  );
}
