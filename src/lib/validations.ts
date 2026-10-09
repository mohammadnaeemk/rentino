import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "PROVIDER"], {
      message: "Select an account type",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const gearFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Select a category"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  pricePerDay: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .min(1, "Add at least one image URL"),
  specs: z.array(
    z.object({
      key: z.string().min(1, "Spec name required"),
      value: z.string().min(1, "Spec value required"),
    }),
  ),
});

export type GearFormInput = z.infer<typeof gearFormSchema>;

export const rentalOrderSchema = z
  .object({
    gearId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).default(1),
    startDate: z.date({ message: "Pick a start date" }),
    endDate: z.date({ message: "Pick a return date" }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "Return date must be after the start date",
    path: ["endDate"],
  });

export type RentalOrderInput = z.infer<typeof rentalOrderSchema>;

export const reviewSchema = z.object({
  gearId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Say at least a little about your experience"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  avatarUrl: z
    .union([z.string().url("Must be a valid URL"), z.literal("")])
    .optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),

  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt must be less than 500 characters"),

  content: z.string().min(1, "Content is required"),

  coverImage: z.string().trim().optional().or(z.literal("")),

  category: z.string().min(1, "Category is required"),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
