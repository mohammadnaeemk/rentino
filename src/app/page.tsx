import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Wallet,
  CalendarClock,
  Camera,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GearCard } from "@/components/gear/gear-card";
import { StarRating } from "@/components/star-rating";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  testimonials,
  blogPosts as fallbackBlogPosts,
  gearItems as mockGearItems,
  categories as mockCategories,
} from "@/lib/content";
import { categoryIconMap } from "@/lib/category-icons";
import { toGearItem, type ApiGear } from "@/lib/gear";
import { formatJalali, formatNumber, toFaDigits } from "@/lib/format";

import type { Category, GearItem } from "@/types";

// =====================================================
// Types
// =====================================================

interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: ApiMeta;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  image?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  date?: string;
}

// =====================================================
// API Base URL
// =====================================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// =====================================================
// Generic API helper
// =====================================================

async function fetchApi<T>(endpoint: string): Promise<ApiResponse<T> | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      console.error(`API request failed: ${endpoint}`, response.status);

      return null;
    }

    const payload = await response.json();

    return payload as ApiResponse<T>;
  } catch (error) {
    console.error(`API request error: ${endpoint}`, error);

    return null;
  }
}

// =====================================================
// Home Data
// =====================================================

async function getHomeData(): Promise<{
  gear: GearItem[];
  categories: Category[];
  blogPosts: BlogPost[];
  totalGear: number;
}> {
  try {
    const [gearResponse, categoryResponse, blogResponse] = await Promise.all([
      // Public gear
      fetchApi<ApiGear[]>("/gear?page=1&limit=6"),

      // Public categories
      fetchApi<Category[]>("/categories"),

      // Public blog
      // Backend automatically returns published posts.
      fetchApi<BlogPost[]>("/blog?page=1&limit=3"),
    ]);

    const apiGear = Array.isArray(gearResponse?.data) ? gearResponse.data : [];

    const gear = apiGear
      .map((item) => {
        try {
          return toGearItem(item);
        } catch (error) {
          console.error("Failed to transform gear:", error);
          return null;
        }
      })
      .filter((item): item is GearItem => item !== null);

    const totalGear = gearResponse?.meta?.total ?? apiGear.length;

    const categories = Array.isArray(categoryResponse?.data)
      ? categoryResponse.data
      : [];

    const liveBlogPosts = Array.isArray(blogResponse?.data)
      ? blogResponse.data
      : [];

    const blogData =
      liveBlogPosts.length > 0
        ? liveBlogPosts
        : fallbackBlogPosts.map((post) => ({
            id: post.slug,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            createdAt: post.date,
            publishedAt: post.date,
          }));

    return {
      // Backend not available yet — fall back to bundled demo data.
      gear: gear.length > 0 ? gear : mockGearItems,
      categories: categories.length > 0 ? categories : mockCategories,
      blogPosts: blogData,
      totalGear: gear.length > 0 ? totalGear : mockGearItems.length,
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);

    return {
      gear: mockGearItems,
      categories: mockCategories,
      blogPosts: [],
      totalGear: mockGearItems.length,
    };
  }
}

// =====================================================
// Static Content
// =====================================================

const steps = [
  {
    frame: "۰۱",
    title: "تاریخ را انتخاب کنید",
    body: "آگهی‌های تأییدشده را ببینید و موجودی را برای روزهای موردنظرتان بررسی کنید.",
  },
  {
    frame: "۰۲",
    title: "رزرو و پرداخت امن",
    body: "با درگاه امن زرین‌پال رزرو کنید. مبلغ تا تأیید تحویل نزد رنتینو نگهداری می‌شود.",
  },
  {
    frame: "۰۳",
    title: "تحویل بگیرید و استفاده کنید",
    body: "با تأمین‌کننده هماهنگ کنید، وضعیت کالا را با هم بررسی کنید و آماده شوید.",
  },
  {
    frame: "۰۴",
    title: "بازگردانید و نظر بدهید",
    body: "کالا را سر وقت برگردانید، ودیعه آزاد می‌شود و می‌توانید نظرتان را ثبت کنید.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "فقط تأمین‌کنندگان معتبر",
    body: "هر تأمین‌کننده پیش از ثبت آگهی، احراز هویت و بررسی کیفیت کالا می‌شود.",
  },
  {
    icon: Wallet,
    title: "قیمت روزانه شفاف",
    body: "هزینه پنهانی در کار نیست؛ همان قیمت هر روز که می‌بینید پرداخت می‌کنید.",
  },
  {
    icon: CalendarClock,
    title: "موجودی لحظه‌ای",
    body: "به محض ثبت رزرو، تقویم به‌روز می‌شود تا روی آگهی ناموجود نمانید.",
  },
  {
    icon: Truck,
    title: "تحویل انعطاف‌پذیر",
    body: "تحویل حضوری در همان روز یا ارسال با پیک برای برنامه‌های فشرده.",
  },
];

const faqs = [
  {
    q: "اگر کالا در طول اجاره آسیب ببیند چه می‌شود؟",
    a: "هر رزرو شامل پوشش اولیه برای فرسودگی عادی است. خسارت تصادفی تا سقف ودیعه پوشش داده می‌شود و مازاد آن با توافق طرفین بررسی می‌شود.",
  },
  {
    q: "چقدر سریع می‌توانم کالا را تحویل بگیرم؟",
    a: "بیشتر تأمین‌کنندگان تا ۳۰ دقیقه تأیید می‌کنند و تحویل همان‌روز در شهر خود را ارائه می‌دهند.",
  },
  {
    q: "آیا می‌توانم به‌عنوان تأمین‌کننده کالای خودم را ثبت کنم؟",
    a: "بله؛ به‌عنوان تأمین‌کننده ثبت‌نام کنید، کالا را با عکس و مشخصات اضافه کنید و قیمت روزانه خودتان را تعیین کنید.",
  },
  {
    q: "چه روش‌های پرداختی پشتیبانی می‌شود؟",
    a: "پرداخت آنلاین از طریق درگاه امن زرین‌پال انجام می‌شود.",
  },
];

// =====================================================
// Home Page
// =====================================================

export default async function HomePage() {
  const { gear, categories, blogPosts, totalGear } = await getHomeData();

  const contactSheetFrames = gear.slice(0, 6);

  const availableGear = gear.filter(
    (item) => item.availability === "AVAILABLE",
  ).length;

  const platformStats = [
    { label: "آگهی فعال", value: formatNumber(totalGear) },
    { label: "موجود همین حالا", value: formatNumber(availableGear) },
    { label: "دسته‌بندی", value: formatNumber(categories.length) },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* =================================================
          Hero
      ================================================= */}

      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="exif-chip">اجاره آسان · تحویل سریع</span>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.3] sm:text-5xl lg:text-6xl">
              هر کالایی که لازم دارید،
              <br />
              فقط برای چند روز اجاره کنید.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
              خودرو، کنسول بازی، دوربین، دوچرخه و لپ‌تاپ از تأمین‌کنندگان
              معتبر — با قیمت روزانه شفاف و تحویل سریع.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/gear">
                  جستجوی کالا
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/register">تأمین‌کننده شوید</Link>
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {platformStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs text-muted">{stat.label}</dt>

                  <dd className="font-display text-2xl font-semibold">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Contact Sheet */}

          {contactSheetFrames.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {contactSheetFrames.map((item, index) => {
                const image = item.images?.[0] || "/placeholder-gear.jpg";

                return (
                  <div
                    key={item.id}
                    className={`group relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-surface-muted transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      index % 2 === 1 ? "translate-y-3" : ""
                    }`}
                  >
                    <Image
                      src={image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 16vw, 33vw"
                      className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                    />

                    <span className="absolute start-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-white">
                      {toFaDigits(String(index + 1).padStart(2, "0"))}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-surface-muted">
              <div className="text-center">
                <Camera className="mx-auto h-10 w-10 text-muted" />
                <p className="mt-3 text-sm text-muted">
                  به‌زودی آگهی‌ها اضافه می‌شوند.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          Categories
      ================================================= */}

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              مرور بر اساس دسته‌بندی
            </h2>

            <Link
              href="/gear"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              مشاهده همه ←
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat) => {
                const Icon = categoryIconMap[cat.icon ?? ""] ?? Camera;

                return (
                  <Link
                    key={cat.id}
                    href={`/gear?category=${cat.slug}`}
                    className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-5 text-center transition-colors hover:border-primary"
                  >
                    <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />

                    <span className="text-sm font-medium">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              هنوز دسته‌بندی‌ای ثبت نشده است.
            </p>
          )}
        </div>
      </section>

      {/* =================================================
          Featured Gear
      ================================================= */}

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                پیشنهاد این هفته
              </h2>

              <p className="mt-1 text-sm text-muted">
                انتخاب‌های محبوب که همین حالا موجود هستند.
              </p>
            </div>

            <Link
              href="/gear"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              مشاهده همه ←
            </Link>
          </div>

          {gear.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gear.slice(0, 6).map((item) => (
                <GearCard key={item.id} gear={item} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              در حال حاضر کالایی موجود نیست. به‌زودی سر بزنید.
            </p>
          )}
        </div>
      </section>

      {/* =================================================
          How It Works
      ================================================= */}

      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            نحوه کار
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.frame}>
                <span className="font-mono text-xs tracking-widest text-primary">
                  {step.frame}
                </span>

                <h3 className="mt-2 font-display text-lg font-semibold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm text-muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          Features
      ================================================= */}

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            چرا رنتینو؟
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-5">
                  <feature.icon
                    className="h-6 w-6 text-secondary"
                    strokeWidth={1.5}
                  />

                  <h3 className="mt-3 font-display text-base font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted">{feature.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          Provider CTA
      ================================================= */}

      <section className="border-b border-border bg-foreground py-16 text-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <span className="exif-chip !border-background/20 !bg-background/10 !text-background/70">
              برای تأمین‌کنندگان
            </span>

            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              کالای بلااستفاده‌تان را به درآمد تبدیل کنید.
            </h2>

            <p className="mt-3 max-w-lg text-background/70">
              خودرو، کنسول یا دوربین بلااستفاده‌تان را در چند دقیقه ثبت کنید.
              قیمت را خودتان تعیین کنید و پس از بازگشت کالا، درآمدتان را دریافت
              کنید.
            </p>
          </div>

          <div className="flex lg:justify-end">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                ثبت کالا
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* =================================================
          Testimonials
      ================================================= */}

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            اعتماد کاربران رنتینو
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="p-5">
                  <StarRating rating={5} />

                  <p className="mt-3 text-sm text-foreground/90">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>

                  <p className="mt-4 text-sm font-medium">{testimonial.name}</p>

                  <p className="text-xs text-muted">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* =================================================
          Live Blog
      ================================================= */}

      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              از وبلاگ
            </h2>

            <Link
              href="/blog"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              مشاهده همه نوشته‌ها ←
            </Link>
          </div>

          {blogPosts.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {blogPosts.slice(0, 3).map((post) => {
                const postDate =
                  post.publishedAt ?? post.createdAt ?? post.date;

                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group"
                  >
                    <Card className="h-full">
                      <CardContent className="p-5">
                        {postDate && (
                          <p className="text-xs text-muted">
                            {formatJalali(postDate)}
                          </p>
                        )}

                        <h3 className="mt-2 font-display text-base font-semibold group-hover:text-primary">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="mt-2 text-sm text-muted">
                            {post.excerpt}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              هنوز نوشته‌ای منتشر نشده است.
            </p>
          )}
        </div>
      </section>

      {/* =================================================
          FAQ
      ================================================= */}

      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            سوالات متداول
          </h2>

          <Accordion type="single" collapsible className="mt-6">
            {faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>

                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* =================================================
          Final CTA
      ================================================= */}

      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            آماده‌اید رزرو کنید؟
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-muted">
            حساب رایگان بسازید و موجودی لحظه‌ای همه تأمین‌کنندگان رنتینو را
            ببینید.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                شروع کنید
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/gear">جستجوی کالا</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
