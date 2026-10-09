import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/star-rating";
import { GearCard } from "@/components/gear/gear-card";
import { RentNowCard } from "@/components/gear/rent-now-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toGearItem, type ApiGear } from "@/lib/gear";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default async function GearDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listResponse = await fetch(`${API_URL}/gear?limit=100`, { cache: "no-store" });
  if (!listResponse.ok) notFound();
  const listPayload = await listResponse.json();
  const summary = (listPayload.data as ApiGear[]).find((item) => item.slug === slug);
  if (!summary) notFound();
  const detailResponse = await fetch(`${API_URL}/gear/${summary.id}`, { cache: "no-store" });
  if (!detailResponse.ok) notFound();
  const detailPayload = await detailResponse.json();
  const detail = detailPayload.data as ApiGear & { related?: ApiGear[]; reviews?: { id: string; rating: number; comment: string; customer?: { name: string } }[] };
  const gear = toGearItem(detail);
  if (!gear) notFound();
  const gearReviews = detail.reviews ?? [];
  const related = (detail.related ?? []).map(toGearItem);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-muted">
          <Link href="/gear" className="hover:text-primary">Browse gear</Link>
          <span className="mx-2">/</span>
          <span>{gear.category?.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-surface-muted">
              <Image src={gear.images[0]} alt={gear.title} fill className="object-cover" priority />
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-muted">{gear.brand}</p>
              <h1 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{gear.title}</h1>
              <div className="mt-2 flex items-center gap-3">
                <StarRating rating={gear.rating} count={gear.reviewCount} />
                <Badge variant="outline">{gear.category?.name}</Badge>
              </div>
            </div>

            <Separator className="my-6" />

            <section>
              <h2 className="font-display text-lg font-semibold">Overview</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{gear.description}</p>
            </section>

            <Separator className="my-6" />

            <section>
              <h2 className="font-display text-lg font-semibold">Specifications</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.entries(gear.specs).map(([key, value]) => (
                  <div key={key} className="rounded-md border border-border p-3">
                    <dt className="text-xs uppercase tracking-wide text-muted">{key}</dt>
                    <dd className="mt-0.5 font-mono text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <Separator className="my-6" />

            <section>
              <h2 className="font-display text-lg font-semibold">Provided by</h2>
              <div className="mt-3 flex items-center gap-3 rounded-md border border-border p-3">
                <Avatar>
                  <AvatarFallback>{gear.provider?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{gear.provider?.name}</p>
                  <p className="text-xs text-muted">Verified provider · {gear.stock} unit{gear.stock > 1 ? "s" : ""} in stock</p>
                </div>
              </div>
            </section>

            <Separator className="my-6" />

            <section>
              <h2 className="font-display text-lg font-semibold">
                Reviews {gearReviews.length > 0 && `(${gearReviews.length})`}
              </h2>
              {gearReviews.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No reviews yet — be the first to rent and review this gear.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {gearReviews.map((r) => (
                    <div key={r.id} className="rounded-md border border-border p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{r.customer?.name}</p>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="mt-2 text-sm text-muted">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {related.length > 0 && (
              <>
                <Separator className="my-6" />
                <section>
                  <h2 className="font-display text-lg font-semibold">Related gear</h2>
                  <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {related.map((g) => (
                      <GearCard key={g.id} gear={g} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          <div>
            <RentNowCard gear={gear} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
