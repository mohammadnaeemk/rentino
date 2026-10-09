import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const topics = [
  {
    q: "How do I cancel a rental order?",
    a: "Go to My Rentals in your dashboard and open the order. Orders that haven't been confirmed by the provider yet can be cancelled with no charge.",
  },
  {
    q: "My gear arrived damaged — what do I do?",
    a: "Photograph the issue immediately and report it from the order page within 2 hours of pickup. Our support team will mediate with the provider.",
  },
  {
    q: "How do provider payouts work?",
    a: "Payouts are released automatically 24 hours after a rental is marked Returned, direct to the bank account on file in your provider profile.",
  },
  {
    q: "Can I extend an active rental?",
    a: "Yes, as long as the gear isn't already booked for the following dates. Request an extension from the order detail page.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">Help &amp; support</h1>
        <p className="mt-2 text-muted">Answers to the most common questions from renters and providers.</p>

        <Accordion type="single" collapsible className="mt-8">
          {topics.map((t) => (
            <AccordionItem key={t.q} value={t.q}>
              <AccordionTrigger>{t.q}</AccordionTrigger>
              <AccordionContent>{t.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">Still need help?</p>
          <Button className="mt-3" asChild>
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
