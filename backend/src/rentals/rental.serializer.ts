import {
  GearItem,
  Payment,
  RentalOrder,
  RentalOrderItem,
  User,
} from "@prisma/client";
import { toPaymentDto, PaymentDto } from "../payments/payment.serializer";
import { toDateOnly } from "../common/utils/dates";

/**
 * Compact gear view embedded in an order. Includes several aliases
 * (`name`/`title`, `images`/`image`) because the frontend's order pages read
 * different keys on different screens.
 */
export interface GearSummaryDto {
  id: string;
  name: string;
  title: string;
  slug: string;
  brand: string | null;
  images: string[];
  image: string | null;
  pricePerDay: number;
  stock: number;
  availableStock: number;
  isActive: boolean;
}

export interface RentalItemDto {
  id: string;
  rentalOrderId: string;
  gearItemId: string;
  gearId: string;
  quantity: number;
  pricePerDay: number;
  subtotal: number;
  gearItem: GearSummaryDto;
  gear: GearSummaryDto;
}

export interface RentalCustomerDto {
  id: string;
  name: string;
  avatarUrl: string | null;
  email?: string;
}

export interface RentalOrderDto {
  id: string;
  customerId: string;
  status: RentalOrder["status"];
  startDate: string;
  endDate: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: RentalItemDto[];
  gearTitle: string;
  customer: RentalCustomerDto | null;
  customerName: string | null;
  payment: PaymentDto | null;
}

export type RentalOrderWithRelations = RentalOrder & {
  items: (RentalOrderItem & { gearItem: GearItem })[];
  payment?: Payment | null;
  customer?: Pick<User, "id" | "name" | "email" | "avatarUrl"> | null;
};

function toGearSummary(gear: GearItem): GearSummaryDto {
  return {
    id: gear.id,
    name: gear.name,
    title: gear.name,
    slug: gear.slug,
    brand: gear.brand ?? null,
    images: gear.images,
    image: gear.images[0] ?? null,
    pricePerDay: gear.pricePerDay,
    stock: gear.stock,
    availableStock: gear.availableStock,
    isActive: gear.isActive,
  };
}

export function toRentalOrderDto(
  order: RentalOrderWithRelations,
  options: { includeCustomerEmail?: boolean } = {},
): RentalOrderDto {
  const items: RentalItemDto[] = order.items.map((item) => {
    const gearSummary = toGearSummary(item.gearItem);
    return {
      id: item.id,
      rentalOrderId: item.rentalOrderId,
      gearItemId: item.gearItemId,
      gearId: item.gearItemId,
      quantity: item.quantity,
      pricePerDay: item.pricePerDay,
      subtotal: item.subtotal,
      gearItem: gearSummary,
      gear: gearSummary,
    };
  });

  return {
    id: order.id,
    customerId: order.customerId,
    status: order.status,
    startDate: toDateOnly(order.startDate),
    endDate: toDateOnly(order.endDate),
    totalAmount: order.totalAmount,
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items,
    gearTitle: items[0]?.gearItem.name ?? "",
    customer: order.customer
      ? {
          id: order.customer.id,
          name: order.customer.name,
          avatarUrl: order.customer.avatarUrl ?? null,
          ...(options.includeCustomerEmail
            ? { email: order.customer.email }
            : {}),
        }
      : null,
    customerName: order.customer?.name ?? null,
    payment: order.payment ? toPaymentDto(order.payment) : null,
  };
}
