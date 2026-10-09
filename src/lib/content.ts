import type { Category, GearItem, Review, RentalStatus, User } from "@/types";

// Content and platform aggregates are intentionally empty until corresponding
// backend endpoints are supplied. The application must never render fabricated
// records as if they came from the API.
export const categories: Category[] = [];
export const gearItems: GearItem[] = [];
export const reviews: Review[] = [];
export const testimonials: { name: string; role: string; quote: string }[] = [];
export const blogPosts: { slug: string; title: string; excerpt: string; date: string }[] = [];
export const platformStats: { label: string; value: string }[] = [];
export const rentalOrders: { id: string; gearTitle: string; customerName: string; startDate: string; endDate: string; totalAmount: number; status: RentalStatus }[] = [];
export const paymentHistory: { id: string; transactionId: string; orderId: string; amount: number; method: string; status: "COMPLETED" | "PENDING" | "FAILED"; paidAt: string | null }[] = [];
export const bookingsByCategory: { name: string; value: number }[] = [];
export const platformUsers: User[] = [];
