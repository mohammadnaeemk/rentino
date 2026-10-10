import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, RentalStatus } from "@prisma/client";
import { Paginated, buildMeta } from "../common/interfaces/paginated";
import { runSerializable } from "../common/utils/serializable";
import { PrismaService } from "../prisma/prisma.service";
import { CreateReviewDto } from "./dto/review.dto";
import { ReviewDto, toReviewDto } from "./review.serializer";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(customerId: string, dto: CreateReviewDto): Promise<ReviewDto> {
    const gearItemId = dto.gearItemId ?? dto.gearId;
    if (!gearItemId) {
      throw new BadRequestException("شناسه کالا نامعتبر است");
    }

    const gear = await this.prisma.gearItem.findUnique({
      where: { id: gearItemId },
      select: { id: true },
    });
    if (!gear) {
      throw new NotFoundException("کالا یافت نشد");
    }

    const rented = await this.prisma.rentalOrderItem.findFirst({
      where: {
        gearItemId,
        rentalOrder: {
          customerId,
          status: { not: RentalStatus.CANCELLED },
        },
      },
      select: { id: true },
    });
    if (!rented) {
      throw new ForbiddenException(
        "برای ثبت نظر باید ابتدا این کالا را اجاره کرده باشید",
      );
    }

    const existing = await this.prisma.review.findUnique({
      where: { gearItemId_customerId: { gearItemId, customerId } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("شما قبلاً برای این کالا نظر ثبت کرده‌اید");
    }

    return runSerializable(this.prisma, async (tx) => {
      const review = await tx.review.create({
        data: {
          gearItemId,
          customerId,
          rating: dto.rating,
          comment: dto.comment,
        },
        include: { customer: { select: { name: true, avatarUrl: true } } },
      });

      await this.refreshGearRating(tx, gearItemId);

      return toReviewDto(review);
    });
  }

  async findByGear(
    gearItemId: string,
    page: number,
    limit: number,
  ): Promise<Paginated<ReviewDto>> {
    const where = { gearItemId };
    const [total, reviews] = await this.prisma.$transaction([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: { select: { name: true, avatarUrl: true } } },
      }),
    ]);

    return new Paginated(
      reviews.map(toReviewDto),
      buildMeta(total, page, limit),
    );
  }

  async listAll(page: number, limit: number): Promise<Paginated<ReviewDto>> {
    const [total, reviews] = await this.prisma.$transaction([
      this.prisma.review.count(),
      this.prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: { select: { name: true, avatarUrl: true } } },
      }),
    ]);

    return new Paginated(
      reviews.map(toReviewDto),
      buildMeta(total, page, limit),
    );
  }

  /** Recomputes the denormalized `avgRating` / `reviewCount` on a listing. */
  async refreshGearRating(
    tx: Prisma.TransactionClient,
    gearItemId: string,
  ): Promise<void> {
    const aggregate = await tx.review.aggregate({
      where: { gearItemId },
      _avg: { rating: true },
      _count: { _all: true },
    });

    await tx.gearItem.update({
      where: { id: gearItemId },
      data: {
        avgRating: Number((aggregate._avg.rating ?? 0).toFixed(2)),
        reviewCount: aggregate._count._all,
      },
    });
  }
}
