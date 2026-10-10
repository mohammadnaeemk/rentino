import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentStatus, RentalStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { API_PREFIX } from "../common/constants";
import { Paginated, buildMeta } from "../common/interfaces/paginated";
import { runSerializable } from "../common/utils/serializable";
import { PrismaService } from "../prisma/prisma.service";
import { recomputeAvailability } from "../rentals/availability";
import { canTransition } from "../rentals/rental-status";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { PaymentDto, toPaymentDto } from "./payment.serializer";
import { SimulationContext } from "./simulated-gateway";

/** Every payment in this build is simulated — no real gateway is contacted. */
const SIMULATED_METHOD = "SIMULATED";

export interface CreatePaymentResult {
  payment: PaymentDto;
  redirectUrl: string;
}

@Injectable()
export class PaymentsService {
  private readonly apiPublicUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.apiPublicUrl =
      config.get<string>("API_PUBLIC_URL") ?? "http://localhost:8000";
  }

  /** Creates (or resets) a PENDING payment and returns the mock-gateway URL. */
  async createPayment(
    userId: string,
    dto: CreatePaymentDto,
  ): Promise<CreatePaymentResult> {
    const order = await this.prisma.rentalOrder.findUnique({
      where: { id: dto.rentalOrderId },
      include: { payment: true },
    });

    if (!order || order.customerId !== userId) {
      throw new NotFoundException("سفارش یافت نشد");
    }
    if (order.status === RentalStatus.PAID) {
      throw new ConflictException("این سفارش قبلاً پرداخت شده است");
    }
    if (
      order.status === RentalStatus.CANCELLED ||
      order.status === RentalStatus.RETURNED
    ) {
      throw new ConflictException("این سفارش قابل پرداخت نیست");
    }

    let paymentId: string;

    if (order.payment) {
      if (order.payment.status === PaymentStatus.COMPLETED) {
        throw new ConflictException("پرداخت این سفارش قبلاً انجام شده است");
      }
      const reset = await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: PaymentStatus.PENDING,
          amount: order.totalAmount,
          method: SIMULATED_METHOD,
          transactionId: this.newTransactionId(),
          paidAt: null,
        },
      });
      paymentId = reset.id;
    } else {
      const created = await this.prisma.payment.create({
        data: {
          rentalOrderId: order.id,
          userId,
          transactionId: this.newTransactionId(),
          amount: order.totalAmount,
          method: SIMULATED_METHOD,
          status: PaymentStatus.PENDING,
        },
      });
      paymentId = created.id;
    }

    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: { id: paymentId },
    });

    return {
      payment: toPaymentDto(payment),
      redirectUrl: `${this.apiPublicUrl}/${API_PREFIX}/payments/simulate/${paymentId}`,
    };
  }

  async listForUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<Paginated<PaymentDto>> {
    const where = { userId };
    const [total, payments] = await this.prisma.$transaction([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return new Paginated(
      payments.map(toPaymentDto),
      buildMeta(total, page, limit),
    );
  }

  /** Marks the payment COMPLETED and moves the order to PAID. */
  async complete(
    paymentId: string,
    userId: string,
  ): Promise<{ orderId: string }> {
    return runSerializable(this.prisma, async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { rentalOrder: { include: { items: true } } },
      });

      if (!payment || payment.userId !== userId) {
        throw new NotFoundException("پرداخت یافت نشد");
      }
      if (payment.status === PaymentStatus.COMPLETED) {
        return { orderId: payment.rentalOrderId };
      }
      if (payment.status === PaymentStatus.FAILED) {
        throw new ConflictException("این پرداخت ناموفق بوده است");
      }

      const order = payment.rentalOrder;
      if (!canTransition(order.status, RentalStatus.PAID, "SYSTEM")) {
        throw new ConflictException("این سفارش در وضعیت فعلی قابل پرداخت نیست");
      }

      await tx.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
      });
      await tx.rentalOrder.update({
        where: { id: order.id },
        data: { status: RentalStatus.PAID },
      });
      await recomputeAvailability(
        tx,
        order.items.map((item) => item.gearItemId),
      );

      return { orderId: order.id };
    });
  }

  /** Marks the payment FAILED. The order keeps its current status. */
  async cancel(
    paymentId: string,
    userId: string,
  ): Promise<{ orderId: string }> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment || payment.userId !== userId) {
      throw new NotFoundException("پرداخت یافت نشد");
    }

    if (payment.status === PaymentStatus.PENDING) {
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return { orderId: payment.rentalOrderId };
  }

  async getSimulationContext(
    paymentId: string,
  ): Promise<SimulationContext | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) {
      return null;
    }

    return {
      paymentId: payment.id,
      orderId: payment.rentalOrderId,
      amountRial: payment.amount,
      amountToman: Math.round(payment.amount / 10),
      status: payment.status,
    };
  }

  private newTransactionId(): string {
    return `SIM-${randomUUID().split("-")[0].toUpperCase()}`;
  }
}
