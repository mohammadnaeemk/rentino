import { RentalStatus } from "@prisma/client";

export type RentalActor = "CUSTOMER" | "PROVIDER" | "SYSTEM";

/**
 * The rental lifecycle. A transition is only valid when it appears in the
 * table for the acting party — everything else is rejected server-side.
 *
 *   PLACED ──confirm──▶ CONFIRMED ──pay──▶ PAID ──hand over──▶ PICKED_UP ──return──▶ RETURNED
 *      │                    │
 *      └────── cancel ──────┘  (customer or provider)
 *
 * Payment may also settle a PLACED order directly (the customer pays before
 * the provider confirms).
 */
const TRANSITIONS: Record<
  RentalStatus,
  Partial<Record<RentalActor, RentalStatus[]>>
> = {
  PLACED: {
    PROVIDER: [RentalStatus.CONFIRMED, RentalStatus.CANCELLED],
    CUSTOMER: [RentalStatus.CANCELLED],
    SYSTEM: [RentalStatus.PAID],
  },
  CONFIRMED: {
    PROVIDER: [RentalStatus.CANCELLED],
    CUSTOMER: [RentalStatus.CANCELLED],
    SYSTEM: [RentalStatus.PAID],
  },
  PAID: {
    PROVIDER: [RentalStatus.PICKED_UP],
  },
  PICKED_UP: {
    PROVIDER: [RentalStatus.RETURNED],
  },
  RETURNED: {},
  CANCELLED: {},
};

export function canTransition(
  from: RentalStatus,
  to: RentalStatus,
  actor: RentalActor,
): boolean {
  return (TRANSITIONS[from]?.[actor] ?? []).includes(to);
}

export function allowedTransitions(
  from: RentalStatus,
  actor: RentalActor,
): RentalStatus[] {
  return TRANSITIONS[from]?.[actor] ?? [];
}

/** Statuses whose rentals still hold a listing on the requested dates. */
export const BLOCKING_STATUSES: RentalStatus[] = [
  RentalStatus.PLACED,
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
];

/** Statuses that count against the listing's `availableStock`. */
export const RESERVING_STATUSES: RentalStatus[] = [
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
];
