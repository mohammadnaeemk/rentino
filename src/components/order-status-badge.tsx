import { Badge } from "@/components/ui/badge";
import type { RentalStatus } from "@/types";

const map: Record<RentalStatus, { variant: "warning" | "info" | "success" | "destructive" | "secondary"; label: string }> = {
  PLACED: { variant: "warning", label: "Placed" },
  CONFIRMED: { variant: "info", label: "Confirmed" },
  PAID: { variant: "secondary", label: "Paid" },
  PICKED_UP: { variant: "success", label: "Picked up" },
  RETURNED: { variant: "secondary", label: "Returned" },
  CANCELLED: { variant: "destructive", label: "Cancelled" },
};

export function OrderStatusBadge({ status }: { status: RentalStatus }) {
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}
