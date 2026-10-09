import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1 text-sm", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < Math.round(rating) ? "fill-primary text-primary" : "fill-transparent text-border"
            )}
          />
        ))}
      </div>
      <span className="font-medium">{rating.toFixed(1)}</span>
      {typeof count === "number" && <span className="text-muted">({count})</span>}
    </div>
  );
}
