import { Injectable, NotFoundException } from "@nestjs/common";
import { Paginated, buildMeta } from "../common/interfaces/paginated";
import { PrismaService } from "../prisma/prisma.service";
import { PublicUser, toPublicUser } from "./user.serializer";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { AdminUpdateUserDto } from "./dto/admin-update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.avatarUrl !== undefined
          ? { avatarUrl: dto.avatarUrl ? dto.avatarUrl : null }
          : {}),
      },
    });
    return toPublicUser(user);
  }

  async listUsers(page: number, limit: number): Promise<Paginated<PublicUser>> {
    const skip = (page - 1) * limit;
    const [total, users] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return new Paginated(
      users.map(toPublicUser),
      buildMeta(total, page, limit),
    );
  }

  async adminUpdateUser(
    id: string,
    dto: AdminUpdateUserDto,
  ): Promise<PublicUser> {
    await this.ensureExists(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.role !== undefined ? { role: dto.role } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      },
    });
    return toPublicUser(user);
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException("کاربر یافت نشد");
    }
  }
}
