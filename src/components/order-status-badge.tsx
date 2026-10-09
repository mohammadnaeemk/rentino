import { Badge } from "@/components/ui/badge";
import { rentalStatusLabel } from "@/lib/labels";
import type { RentalStatus } from "@/types";

const map: Record<
  RentalStatus,
  { variant: "warning" | "info" | "success" | "destructive" | "secondary" }
> = {
  PLACED: { variant: "warning" },
  CONFIRMED: { variant: "info" },
  PAID: { variant: "secondary" },
  PICKED_UP: { variant: "success" },
  RETURNED: { variant: "secondary" },
  CANCELLED: { variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: RentalStatus }) {
  const { variant } = map[status];
  return <Badge variant={variant}>{rentalStatusLabel[status]}</Badge>;
}
