export type Role = "CUSTOMER" | "PROVIDER" | "ADMIN";

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;

  // both supported
  avatarUrl?: string | null;
  avatar?: string | null;

  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;

  description?: string | null;
  createdAt?: string;
}

export type GearAvailability = "AVAILABLE" | "RENTED" | "MAINTENANCE";

export interface GearItem {
  id: string;
  title: string;
  slug: string;
  brand: string;
  categoryId: string;
  category?: Category;
  providerId: string;
  provider?: Pick<User, "id" | "name" | "avatarUrl">;
  description: string;
  images: string[];
  pricePerDay: number;
  specs: Record<string, string>; // e.g. { aperture: "f/1.4", focalLength: "35mm", iso: "100-51200" }
  availability: GearAvailability;
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export type RentalStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";

export interface RentalOrderItem {
  gearId: string;
  gear?: Pick<GearItem, "id" | "title" | "images" | "pricePerDay">;
  quantity: number;
}

export interface RentalOrder {
  id: string;
  customerId: string;
  items: RentalOrderItem[];
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
  createdAt: string;
}

export type PaymentProvider = "STRIPE" | "SSLCOMMERZ";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Payment {
  id: string;
  transactionId: string;
  rentalOrderId: string;
  amount: number;
  method: PaymentProvider;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  gearId: string;
  customerId: string;
  customer?: Pick<User, "name" | "avatarUrl">;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
export interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  category: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; name: string; avatar?: string | null };
  related?: BlogPost[];
}
