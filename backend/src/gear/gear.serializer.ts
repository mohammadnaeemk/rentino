import { Category, GearItem, Prisma, User } from "@prisma/client";
import { jsonValueToString } from "../common/utils/json";

/** Gear shape returned to the frontend (`src/lib/gear.ts` `ApiGear`). */
export interface GearDto {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  images: string[];
  pricePerDay: number;
  stock: number;
  availableStock: number;
  specifications: Record<string, string>;
  isActive: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    email?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export type GearWithRelations = GearItem & {
  category?: Category | null;
  provider?: Pick<User, "id" | "name" | "email" | "avatarUrl"> | null;
};

function toSpecifications(
  value: Prisma.JsonValue | null,
): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, val]) => [
      key,
      jsonValueToString(val),
    ]),
  );
}

/**
 * Serializes a gear item for the API.
 *
 * `includeProviderEmail` is only ever true for admin-scoped responses — public
 * responses must never leak a provider's email.
 */
export function toGearDto(
  gear: GearWithRelations,
  options: { includeProviderEmail?: boolean } = {},
): GearDto {
  return {
    id: gear.id,
    providerId: gear.providerId,
    categoryId: gear.categoryId,
    name: gear.name,
    slug: gear.slug,
    description: gear.description,
    brand: gear.brand ?? null,
    images: gear.images,
    pricePerDay: gear.pricePerDay,
    stock: gear.stock,
    availableStock: gear.availableStock,
    specifications: toSpecifications(gear.specifications),
    isActive: gear.isActive,
    avgRating: gear.avgRating,
    reviewCount: gear.reviewCount,
    createdAt: gear.createdAt.toISOString(),
    updatedAt: gear.updatedAt.toISOString(),
    ...(gear.provider
      ? {
          provider: {
            id: gear.provider.id,
            name: gear.provider.name,
            avatarUrl: gear.provider.avatarUrl ?? null,
            ...(options.includeProviderEmail
              ? { email: gear.provider.email }
              : {}),
          },
        }
      : {}),
    ...(gear.category
      ? {
          category: {
            id: gear.category.id,
            name: gear.category.name,
            slug: gear.category.slug,
            icon: gear.category.icon ?? null,
            description: gear.category.description ?? null,
            createdAt: gear.category.createdAt.toISOString(),
            updatedAt: gear.category.updatedAt.toISOString(),
          },
        }
      : {}),
  };
}
