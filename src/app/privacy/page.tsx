import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated August 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">Information we collect</h2>
            <p className="mt-2 text-muted">
              We collect the information you provide when creating an account — name, email, and
              role — along with rental and payment activity needed to operate the marketplace.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">How we use it</h2>
            <p className="mt-2 text-muted">
              Your information is used to process bookings, facilitate payments through Stripe or
              SSLCommerz, verify providers, and improve the LensLoop platform.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">Data sharing</h2>
            <p className="mt-2 text-muted">
              We share only the information necessary to complete a rental (such as your name and
              pickup details) with the relevant provider or customer. We never sell personal data.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">Your rights</h2>
            <p className="mt-2 text-muted">
              You can request a copy of your data or ask us to delete your account at any time by
              contacting hello@lensloop.app.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
