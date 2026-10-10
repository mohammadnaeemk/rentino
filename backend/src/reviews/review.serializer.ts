import { Review } from "@prisma/client";

/** Review shape returned to the frontend (`src/types/index.ts`). */
export interface ReviewDto {
  id: string;
  gearId: string;
  customerId: string;
  customer?: { name: string; avatarUrl: string | null };
  rating: number;
  comment: string;
  createdAt: string;
}

type ReviewWithCustomer = Review & {
  customer?: { name: string; avatarUrl: string | null } | null;
};

export function toReviewDto(review: ReviewWithCustomer): ReviewDto {
  return {
    id: review.id,
    gearId: review.gearItemId,
    customerId: review.customerId,
    ...(review.customer
      ? {
          customer: {
            name: review.customer.name,
            avatarUrl: review.customer.avatarUrl ?? null,
          },
        }
      : {}),
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}
