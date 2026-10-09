import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import type { GearItem } from "@/types";

const availabilityVariant: Record<
  GearItem["availability"],
  "success" | "destructive" | "warning"
> = {
  AVAILABLE: "success",
  RENTED: "destructive",
  MAINTENANCE: "warning",
};

const availabilityLabel: Record<GearItem["availability"], string> = {
  AVAILABLE: "Available",
  RENTED: "Booked out",
  MAINTENANCE: "In service",
};

export function GearCard({ gear }: { gear: GearItem }) {
  const specEntries = Object.entries(gear.specs).slice(0, 2);

  return (
    <Card className="group flex h-full flex-col overflow-hidden py-0 transition-shadow hover:shadow-md">
      <Link
        href={`/gear/${gear.slug}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-muted"
      >
        <Image
          src={gear.images[0]}
          alt={gear.title}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge
          variant={availabilityVariant[gear.availability]}
          className={
            gear.availability === "AVAILABLE"
              ? "absolute left-3 top-3 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
              : "absolute left-3 top-3"
          }
        >
          {gear.availability === "AVAILABLE" && (
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
          {availabilityLabel[gear.availability]}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">
            {gear.brand} · {gear.category?.name}
          </p>
          <Link
            href={`/gear/${gear.slug}`}
            className="font-display text-base font-semibold leading-snug hover:text-primary"
          >
            {gear.title}
          </Link>
        </div>

        <StarRating rating={gear.rating} count={gear.reviewCount} />

        <div className="flex flex-wrap gap-1.5">
          {specEntries.map(([key, value]) => (
            <span key={key} className="exif-chip">
              {key}: {value}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <span className="font-display text-lg font-semibold">
              ${gear.pricePerDay}
            </span>
            <span className="text-sm text-muted"> /day</span>
          </div>
          <Link
            href={`/gear/${gear.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View details →
          </Link>
        </div>
      </div>
    </Card>
  );
}
