import type { GearAvailability, GearItem } from "@/types";

export interface ApiGear {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  images: string[];
  pricePerDay: number | string;
  stock: number;
  availableStock: number;
  specifications: Record<string, string> | null;
  isActive: boolean;
  createdAt: string;
  provider?: { id: string; name: string };
  category?: { id: string; name: string; slug: string };
  avgRating?: number | null;
  reviewCount?: number;
}

export function toGearItem(gear: ApiGear): GearItem {
  const availability: GearAvailability = gear.availableStock > 0 ? "AVAILABLE" : "RENTED";
  return {
    id: gear.id,
    title: gear.name,
    slug: gear.slug,
    brand: gear.brand ?? "",
    categoryId: gear.categoryId,
    category: gear.category,
    providerId: gear.providerId,
    provider: gear.provider,
    description: gear.description,
    images: gear.images,
    pricePerDay: Number(gear.pricePerDay),
    specs: gear.specifications ?? {},
    availability,
    stock: gear.stock,
    rating: gear.avgRating ?? 0,
    reviewCount: gear.reviewCount ?? 0,
    createdAt: gear.createdAt,
  };
}
