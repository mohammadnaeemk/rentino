import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, RentalStatus } from "@prisma/client";
import { Paginated, buildMeta } from "../common/interfaces/paginated";
import { nightsBetween, parseCalendarDate } from "../common/utils/dates";
import { runSerializable } from "../common/utils/serializable";
import { PrismaService } from "../prisma/prisma.service";
import { recomputeAvailability } from "./availability";
import { CreateRentalDto, AdminRentalQueryDto } from "./dto/rental.dto";
import { BLOCKING_STATUSES, canTransition } from "./rental-status";
import {
  RentalOrderDto,
  RentalOrderWithRelations,
  toRentalOrderDto,
} from "./rental.serializer";

const RENTAL_INCLUDE = {
  items: { include: { gearItem: true } },
  payment: true,
  customer: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
} satisfies Prisma.RentalOrderInclude;

@Injectable()
export class RentalsService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // Customer: create + list
  // -------------------------------------------------------------------------

  async create(
    customerId: string,
    dto: CreateRentalDto,
  ): Promise<RentalOrderDto> {
    const start = parseCalendarDate(dto.startDate);
    const end = parseCalendarDate(dto.endDate);
    if (!start || !end) {
      throw new BadRequestException("تاریخ‌های انتخابی معتبر نیستند");
    }

    const days = nightsBetween(start, end);
    if (days < 1) {
      throw new BadRequestException(
        "تاریخ بازگشت باید بعد از تاریخ تحویل باشد",
      );
    }

    const normalized = dto.items.map((item) => ({
      gearItemId: item.gearItemId ?? item.gearId,
      quantity: item.quantity ?? 1,
    }));

    if (normalized.some((item) => !item.gearItemId)) {
      throw new BadRequestException("شناسه کالا نامعتبر است");
    }

    const uniqueIds = new Set(normalized.map((item) => item.gearItemId!));
    if (uniqueIds.size !== normalized.length) {
      throw new BadRequestException("کالای تکراری در سفارش مجاز نیست");
    }

    return runSerializable(this.prisma, async (tx) => {
      const gearRows = await tx.gearItem.findMany({
        where: { id: { in: [...uniqueIds] } },
      });
      const gearById = new Map(gearRows.map((gear) => [gear.id, gear]));

      const orderItems: {
        gearItemId: string;
        quantity: number;
        pricePerDay: number;
        subtotal: number;
      }[] = [];

      for (const item of normalized) {
        const gear = gearById.get(item.gearItemId!);
        if (!gear || !gear.isActive) {
          throw new BadRequestException("کالای انتخابی در دسترس نیست");
        }

        // Double-booking guard: sum quantities already held on overlapping days.
        const overlapping = await tx.rentalOrderItem.findMany({
          where: {
            gearItemId: gear.id,
            rentalOrder: {
              status: { in: BLOCKING_STATUSES },
              startDate: { lt: end },
              endDate: { gt: start },
            },
          },
          select: { quantity: true },
        });
        const alreadyBooked = overlapping.reduce(
          (sum, row) => sum + row.quantity,
          0,
        );

        if (alreadyBooked + item.quantity > gear.stock) {
          throw new ConflictException(
            `«${gear.name}» در بازهٔ انتخاب‌شده در دسترس نیست`,
          );
        }

        orderItems.push({
          gearItemId: gear.id,
          quantity: item.quantity,
          pricePerDay: gear.pricePerDay,
          subtotal: days * gear.pricePerDay * item.quantity,
        });
      }

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.subtotal,
        0,
      );

      const order = await tx.rentalOrder.create({
        data: {
          customerId,
          startDate: start,
          endDate: end,
          totalAmount,
          notes: dto.notes?.trim() || null,
          items: { create: orderItems },
        },
        include: RENTAL_INCLUDE,
      });

      return toRentalOrderDto(order);
    });
  }

  async listForCustomer(
    customerId: string,
    page: number,
    limit: number,
  ): Promise<Paginated<RentalOrderDto>> {
    const where: Prisma.RentalOrderWhereInput = { customerId };
    const [total, orders] = await this.prisma.$transaction([
      this.prisma.rentalOrder.count({ where }),
      this.prisma.rentalOrder.findMany({
        where,
        include: RENTAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return new Paginated(
      orders.map((order) =>
        toRentalOrderDto(order as RentalOrderWithRelations),
      ),
      buildMeta(total, page, limit),
    );
  }

  async findForCustomer(
    customerId: string,
    orderId: string,
  ): Promise<RentalOrderDto> {
    const order = await this.prisma.rentalOrder.findFirst({
      where: { id: orderId, customerId },
      include: RENTAL_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException("سفارش یافت نشد");
    }
    return toRentalOrderDto(order);
  }

  // -------------------------------------------------------------------------
  // Provider
  // -------------------------------------------------------------------------

  async listForProvider(
    providerId: string,
    page: number,
    limit: number,
  ): Promise<Paginated<RentalOrderDto>> {
    // Orders containing at least one of this provider's listings. (Current
    // booking flow creates one order per listing, so orders are single-provider
    // in practice; status changes require full ownership.)
    const where: Prisma.RentalOrderWhereInput = {
      items: { some: { gearItem: { providerId } } },
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.rentalOrder.count({ where }),
      this.prisma.rentalOrder.findMany({
        where,
        include: RENTAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return new Paginated(
      orders.map((order) =>
        toRentalOrderDto(order as RentalOrderWithRelations),
      ),
      buildMeta(total, page, limit),
    );
  }

  async updateStatusByProvider(
    providerId: string,
    orderId: string,
    status: RentalStatus,
  ): Promise<RentalOrderDto> {
    return runSerializable(this.prisma, async (tx) => {
      const order = await tx.rentalOrder.findUnique({
        where: { id: orderId },
        include: { items: { include: { gearItem: true } } },
      });
      if (!order) {
        throw new NotFoundException("سفارش یافت نشد");
      }

      const ownsAll =
        order.items.length > 0 &&
        order.items.every((item) => item.gearItem.providerId === providerId);
      if (!ownsAll) {
        throw new ForbiddenException("این سفارش مربوط به کالاهای شما نیست");
      }

      if (!canTransition(order.status, status, "PROVIDER")) {
        throw new ConflictException(
          `تغییر وضعیت از «${order.status}» به «${status}» مجاز نیست`,
        );
      }

      const updated = await tx.rentalOrder.update({
        where: { id: orderId },
        data: { status },
        include: RENTAL_INCLUDE,
      });

      await recomputeAvailability(
        tx,
        order.items.map((item) => item.gearItemId),
      );

      return toRentalOrderDto(updated);
    });
  }

  // -------------------------------------------------------------------------
  // Customer cancellation
  // -------------------------------------------------------------------------

  async cancelByCustomer(
    customerId: string,
    orderId: string,
  ): Promise<RentalOrderDto> {
    return runSerializable(this.prisma, async (tx) => {
      const order = await tx.rentalOrder.findFirst({
        where: { id: orderId, customerId },
        include: { items: true },
      });
      if (!order) {
        throw new NotFoundException("سفارش یافت نشد");
      }

      if (!canTransition(order.status, RentalStatus.CANCELLED, "CUSTOMER")) {
        throw new ConflictException("این سفارش در وضعیت فعلی قابل لغو نیست");
      }

      const updated = await tx.rentalOrder.update({
        where: { id: orderId },
        data: { status: RentalStatus.CANCELLED },
        include: RENTAL_INCLUDE,
      });

      await recomputeAvailability(
        tx,
        order.items.map((item) => item.gearItemId),
      );

      return toRentalOrderDto(updated);
    });
  }

  // -------------------------------------------------------------------------
  // Admin
  // -------------------------------------------------------------------------

  async listForAdmin(
    query: AdminRentalQueryDto,
  ): Promise<Paginated<RentalOrderDto>> {
    const where: Prisma.RentalOrderWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.customerId ? { customerId: query.customerId } : {}),
    };

    const [total, orders] = await this.prisma.$transaction([
      this.prisma.rentalOrder.count({ where }),
      this.prisma.rentalOrder.findMany({
        where,
        include: RENTAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip: query.skip,
        take: query.limit,
      }),
    ]);

    return new Paginated(
      orders.map((order) =>
        toRentalOrderDto(order as RentalOrderWithRelations, {
          includeCustomerEmail: true,
        }),
      ),
      buildMeta(total, query.page, query.limit),
    );
  }

  async getOrderOrThrow(orderId: string): Promise<RentalOrderWithRelations> {
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: RENTAL_INCLUDE,
    });
    if (!order) {
      throw new NotFoundException("سفارش یافت نشد");
    }
    return order;
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------
}
