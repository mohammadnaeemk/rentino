import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Last updated August 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">Using LensLoop</h2>
            <p className="mt-2 text-muted">
              By creating an account you agree to use the platform only for legitimate equipment
              rental, to represent gear condition accurately as a provider, and to return rented
              gear on the agreed date as a customer.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">Payments</h2>
            <p className="mt-2 text-muted">
              All rental payments are processed via Stripe or SSLCommerz. Funds are held until
              pickup is confirmed and released to the provider after the rental is returned.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">Damage &amp; disputes</h2>
            <p className="mt-2 text-muted">
              Customers are responsible for gear while in their possession. Disputes over damage
              or condition are reviewed by LensLoop support using photos from both pickup and return.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">Account suspension</h2>
            <p className="mt-2 text-muted">
              LensLoop reserves the right to suspend accounts that violate these terms, including
              repeated no-shows, misrepresented listings, or fraudulent payment activity.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
