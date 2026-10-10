import { Prisma } from "@prisma/client";
import { RESERVING_STATUSES } from "./rental-status";

/**
 * Recomputes `availableStock` for each listing as
 * `stock − quantity held by active rentals` (CONFIRMED / PAID / PICKED_UP).
 *
 * Deterministic and idempotent — call it after any status transition so the
 * display value never drifts. Actual double-booking prevention is done by the
 * date-overlap check at booking time.
 */
export async function recomputeAvailability(
  tx: Prisma.TransactionClient,
  gearItemIds: string[],
): Promise<void> {
  for (const id of new Set(gearItemIds)) {
    const gear = await tx.gearItem.findUnique({
      where: { id },
      select: { stock: true },
    });
    if (!gear) {
      continue;
    }

    const aggregated = await tx.rentalOrderItem.aggregate({
      where: {
        gearItemId: id,
        rentalOrder: { status: { in: RESERVING_STATUSES } },
      },
      _sum: { quantity: true },
    });

    const reserved = aggregated._sum.quantity ?? 0;
    await tx.gearItem.update({
      where: { id },
      data: { availableStock: Math.max(0, gear.stock - reserved) },
    });
  }
}
