import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
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

import { testimonials, blogPosts as fallbackBlogPosts } from "@/lib/content";
import { categoryIconMap } from "@/lib/category-icons";
import { toGearItem, type ApiGear } from "@/lib/gear";

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
  process.env.NEXT_PUBLIC_BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

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

    // ---------------------------------------------------
    // Gear
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // Categories
    // ---------------------------------------------------

    const categories = Array.isArray(categoryResponse?.data)
      ? categoryResponse.data
      : [];

    // ---------------------------------------------------
    // Blog
    // ---------------------------------------------------

    const liveBlogPosts = Array.isArray(blogResponse?.data)
      ? blogResponse.data
      : [];

    /*
     * If backend blog API is unavailable, use local fallback
     * content instead of breaking the homepage.
     */
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
      gear,
      categories,
      blogPosts: blogData,
      totalGear,
    };
  } catch (error) {
    console.error("Failed to load homepage data:", error);

    return {
      gear: [],
      categories: [],
      blogPosts: [],
      totalGear: 0,
    };
  }
}

// =====================================================
// Static Content
// =====================================================

const steps = [
  {
    frame: "01A",
    title: "Pick your dates",
    body: "Browse verified listings and check live availability for the exact days you're shooting.",
  },
  {
    frame: "02A",
    title: "Book & pay securely",
    body: "Reserve instantly with Stripe or SSLCommerz. Funds are held until pickup is confirmed.",
  },
  {
    frame: "03A",
    title: "Pick up & shoot",
    body: "Meet your provider, do a quick condition check together, and you're rolling.",
  },
  {
    frame: "04A",
    title: "Return & review",
    body: "Drop the gear back, get your deposit released, and leave a review for the next renter.",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "Verified providers only",
    body: "Every provider passes an ID and equipment-condition check before listing.",
  },
  {
    icon: Wallet,
    title: "Transparent daily pricing",
    body: "No hidden fees — the price per day shown is the price you pay, insurance included.",
  },
  {
    icon: CalendarClock,
    title: "Real-time availability",
    body: "Calendars sync the moment a booking is made, so you never chase a phantom listing.",
  },
  {
    icon: Truck,
    title: "Flexible pickup & delivery",
    body: "Meet in person for same-day pickups, or arrange courier delivery for tighter schedules.",
  },
];

const faqs = [
  {
    q: "What happens if the gear is damaged during my rental?",
    a: "Every booking includes basic protection against normal wear. Accidental damage is covered up to the listed deposit; anything beyond that is assessed jointly with the provider before your deposit is released.",
  },
  {
    q: "How fast can I get gear on the same day?",
    a: 'Most providers confirm within 30 minutes and offer same-day pickup within their city. Filter by "available today" on the browse page to see real-time options near you.',
  },
  {
    q: "Can I list my own gear as a provider?",
    a: "Yes — register as a provider, add your gear with photos and specs, and set your own daily rate. Payouts are released automatically once a rental is marked returned.",
  },
  {
    q: "Which payment methods are supported?",
    a: "Stripe for international cards and SSLCommerz for local bKash, Nagad, and card payments in Bangladesh.",
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
    {
      label: "Live listings",
      value: String(totalGear),
    },
    {
      label: "Available now",
      value: String(availableGear),
    },
    {
      label: "Categories",
      value: String(categories.length),
    },
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
            <span className="exif-chip">Rent · Shoot · Return</span>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Professional gear,
              <br />
              booked like a lens change.
            </h1>

            <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
              Cameras, lighting, audio and full event rigs from verified local
              providers — reserved by the day, ready when your call time is.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/gear">
                  Browse gear
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Become a provider</Link>
              </Button>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
              {platformStats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wide text-muted">
                    {stat.label}
                  </dt>

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

                    <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-white">
                      {String(index + 1).padStart(2, "0")}A
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
                  Gear listings are coming soon.
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
              Browse by category
            </h2>

            <Link
              href="/gear"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all gear →
            </Link>
          </div>

          {categories.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
              No categories available yet.
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
                Featured this week
              </h2>

              <p className="mt-1 text-sm text-muted">
                Popular picks currently available near you.
              </p>
            </div>

            <Link
              href="/gear"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all gear →
            </Link>
          </div>

          {gear.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gear.map((item) => (
                <GearCard key={item.id} gear={item} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              No gear is available right now. Please check back soon.
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
            How it works
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
            Why creators choose LensLoop
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
              For Providers
            </span>

            <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Turn idle gear into recurring income.
            </h2>

            <p className="mt-3 max-w-lg text-background/70">
              List your cameras, lenses, or staging equipment in minutes. Set
              your own rates, approve bookings, and get paid out automatically
              once gear is returned.
            </p>
          </div>

          <div className="flex lg:justify-end">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Start listing gear
                <ArrowRight className="h-4 w-4" />
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
            Trusted by working creators
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
              From the blog
            </h2>

            <Link
              href="/blog"
              className="hidden text-sm font-medium text-primary hover:underline sm:block"
            >
              View all posts →
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
                          <p className="text-xs uppercase tracking-wide text-muted">
                            {new Date(postDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
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
              No published blog posts available yet.
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
            Frequently asked questions
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
            Ready to book your next shoot?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-muted">
            Create a free account and check live availability across every
            provider on LensLoop.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/gear">Browse gear</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
