import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { formatToman } from "@/lib/format";
import { availabilityLabel } from "@/lib/labels";
import type { GearItem } from "@/types";

const availabilityVariant: Record<
  GearItem["availability"],
  "success" | "destructive" | "warning"
> = {
  AVAILABLE: "success",
  RENTED: "destructive",
  MAINTENANCE: "warning",
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
          className="absolute start-3 top-3"
        >
          {gear.availability === "AVAILABLE" && (
            <span className="me-1.5 h-1.5 w-1.5 rounded-full bg-success" />
          )}
          {availabilityLabel[gear.availability]}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs text-muted">
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
              {formatToman(gear.pricePerDay)}
            </span>
            <span className="text-sm text-muted"> / روز</span>
          </div>
          <Link
            href={`/gear/${gear.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            مشاهده جزئیات
          </Link>
        </div>
      </div>
    </Card>
  );
}
