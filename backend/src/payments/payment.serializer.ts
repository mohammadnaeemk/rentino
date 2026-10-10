import { Payment, PaymentStatus } from "@prisma/client";

/** Payment shape returned to the frontend (`src/types/index.ts`). */
export interface PaymentDto {
  id: string;
  rentalOrderId: string;
  userId: string;
  transactionId: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export function toPaymentDto(payment: Payment): PaymentDto {
  return {
    id: payment.id,
    rentalOrderId: payment.rentalOrderId,
    userId: payment.userId,
    transactionId: payment.transactionId,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
    createdAt: payment.createdAt.toISOString(),
  };
}
