import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
    email: z.string().email("یک ایمیل معتبر وارد کنید"),
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
      .regex(/[A-Z]/, "حداقل یک حرف بزرگ انگلیسی داشته باشد")
      .regex(/[0-9]/, "حداقل یک عدد داشته باشد"),
    confirmPassword: z.string(),
    role: z.enum(["CUSTOMER", "PROVIDER"], {
      message: "نوع حساب را انتخاب کنید",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمزهای عبور یکسان نیستند",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("یک ایمیل معتبر وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const gearFormSchema = z.object({
  title: z.string().min(3, "عنوان باید حداقل ۳ کاراکتر باشد"),
  brand: z.string().min(1, "برند را وارد کنید"),
  categoryId: z.string().min(1, "یک دسته‌بندی انتخاب کنید"),
  description: z.string().min(20, "توضیحات باید حداقل ۲۰ کاراکتر باشد"),
  pricePerDay: z.coerce.number().positive("قیمت باید بیشتر از صفر باشد"),
  stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد"),
  images: z
    .array(z.string().url("هر تصویر باید یک آدرس معتبر باشد"))
    .min(1, "حداقل یک آدرس تصویر وارد کنید"),
  specs: z.array(
    z.object({
      key: z.string().min(1, "نام مشخصه را وارد کنید"),
      value: z.string().min(1, "مقدار مشخصه را وارد کنید"),
    }),
  ),
});

export type GearFormInput = z.infer<typeof gearFormSchema>;

export const rentalOrderSchema = z
  .object({
    gearId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).default(1),
    startDate: z.date({ message: "تاریخ شروع را انتخاب کنید" }),
    endDate: z.date({ message: "تاریخ بازگشت را انتخاب کنید" }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "تاریخ بازگشت باید بعد از تاریخ شروع باشد",
    path: ["endDate"],
  });

export type RentalOrderInput = z.infer<typeof rentalOrderSchema>;

export const reviewSchema = z.object({
  gearId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "کمی درباره تجربه‌تان بنویسید"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "نام باید حداقل ۲ حرف باشد"),
  avatarUrl: z
    .union([z.string().url("باید یک آدرس معتبر باشد"), z.literal("")])
    .optional(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export const contactSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  email: z.string().email("یک ایمیل معتبر وارد کنید"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const blogFormSchema = z.object({
  title: z
    .string()
    .min(1, "عنوان را وارد کنید")
    .max(200, "عنوان باید کمتر از ۲۰۰ کاراکتر باشد"),

  excerpt: z
    .string()
    .min(1, "خلاصه را وارد کنید")
    .max(500, "خلاصه باید کمتر از ۵۰۰ کاراکتر باشد"),

  content: z.string().min(1, "محتوا را وارد کنید"),

  coverImage: z.string().trim().optional().or(z.literal("")),

  category: z.string().min(1, "دسته‌بندی را انتخاب کنید"),
});

export type BlogFormValues = z.infer<typeof blogFormSchema>;
