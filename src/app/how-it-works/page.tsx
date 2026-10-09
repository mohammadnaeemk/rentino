import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const renterSteps = [
  { frame: "01A", title: "Search & filter", body: "Browse by category, price, brand, and real-time availability across every provider." },
  { frame: "02A", title: "Book your dates", body: "Pick pickup and return dates on the listing page — no overlap with existing bookings is possible." },
  { frame: "03A", title: "Pay securely", body: "Checkout with Stripe or SSLCommerz. Funds are held until the provider confirms pickup." },
  { frame: "04A", title: "Pick up gear", body: "Meet the provider, do a quick joint condition check, and you're set to shoot." },
  { frame: "05A", title: "Return & review", body: "Drop gear back on schedule, get your deposit released, and leave a review." },
];

const providerSteps = [
  { frame: "01B", title: "List your gear", body: "Add photos, specs, and your daily rate in a few minutes." },
  { frame: "02B", title: "Set availability", body: "Your calendar updates automatically the moment a booking is placed." },
  { frame: "03B", title: "Confirm bookings", body: "Approve incoming requests and coordinate pickup with the renter." },
  { frame: "04B", title: "Hand off & track", body: "Mark gear picked up and returned right from your orders dashboard." },
  { frame: "05B", title: "Get paid", body: "Payouts release automatically once a rental is marked returned." },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border py-16 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">How LensLoop works</h1>
            <p className="mt-4 text-muted">
              Whether you&apos;re renting gear for a shoot or listing your own inventory, the flow
              is designed to take minutes, not days.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold">For renters</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {renterSteps.map((s) => (
                <Card key={s.frame}>
                  <CardContent className="p-5">
                    <span className="font-mono text-xs tracking-widest text-primary">{s.frame}</span>
                    <h3 className="mt-2 font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold">For providers</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {providerSteps.map((s) => (
                <Card key={s.frame}>
                  <CardContent className="p-5">
                    <span className="font-mono text-xs tracking-widest text-secondary">{s.frame}</span>
                    <h3 className="mt-2 font-display text-base font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted">{s.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 text-center">
          <div className="mx-auto max-w-xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold">Ready to start?</h2>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/gear">
                  Browse gear <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">Become a provider</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
