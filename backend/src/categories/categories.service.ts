import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Category, Prisma } from "@prisma/client";
import { slugify } from "../common/utils/slug";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";

/** Category shape returned to the frontend (`src/types/index.ts`). */
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  createdAt: string;
}

function toCategoryDto(category: Category): CategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? null,
    description: category.description ?? null,
    createdAt: category.createdAt.toISOString(),
  };
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryDto[]> {
    const categories = await this.prisma.category.findMany({
      orderBy: { createdAt: "asc" },
    });
    return categories.map(toCategoryDto);
  }

  async create(dto: CreateCategoryDto): Promise<CategoryDto> {
    const slug = await this.uniqueSlug(
      dto.slug ?? slugify(dto.name, "category"),
    );

    const category = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        slug,
        icon: dto.icon ?? null,
        description: dto.description ?? null,
      },
    });
    return toCategoryDto(category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDto> {
    await this.ensureExists(id);

    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name !== undefined) {
      data.name = dto.name.trim();
    }
    if (dto.slug !== undefined) {
      data.slug = await this.uniqueSlug(slugify(dto.slug, "category"), id);
    }
    if (dto.icon !== undefined) {
      data.icon = dto.icon;
    }
    if (dto.description !== undefined) {
      data.description = dto.description;
    }

    const category = await this.prisma.category.update({ where: { id }, data });
    return toCategoryDto(category);
  }

  async remove(id: string): Promise<null> {
    await this.ensureExists(id);

    const gearCount = await this.prisma.gearItem.count({
      where: { categoryId: id },
    });
    if (gearCount > 0) {
      throw new ConflictException(
        "این دسته‌بندی دارای آگهی است و قابل حذف نیست",
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return null;
  }

  private async ensureExists(id: string): Promise<void> {
    const exists = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException("دسته‌بندی یافت نشد");
    }
  }

  /** Returns a slug that is unique, appending `-2`, `-3`, … when needed. */
  private async uniqueSlug(base: string, ignoreId?: string): Promise<string> {
    let candidate = base;
    let counter = 2;

    for (;;) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing || existing.id === ignoreId) {
        return candidate;
      }

      candidate = `${base}-${counter}`;
      counter += 1;
    }
  }
}
