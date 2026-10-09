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
    q: "چطور یک سفارش اجاره را لغو کنم؟",
    a: "به بخش «اجاره‌های من» در پنل کاربری بروید و سفارش را باز کنید. سفارش‌هایی که هنوز توسط تأمین‌کننده تأیید نشده‌اند، بدون هزینه قابل لغو هستند.",
  },
  {
    q: "کالا هنگام تحویل آسیب‌دیده بود — چه کنم؟",
    a: "بلافاصله از مشکل عکس بگیرید و ظرف ۲ ساعت پس از تحویل، از صفحه سفارش گزارش دهید. تیم پشتیبانی با تأمین‌کننده میانجی‌گری می‌کند.",
  },
  {
    q: "پرداخت تأمین‌کنندگان چگونه است؟",
    a: "پس از ثبت بازگشت کالا، تسویه‌حساب به‌صورت خودکار و طی ۲۴ ساعت به حساب بانکی ثبت‌شده در پروفایل تأمین‌کننده واریز می‌شود.",
  },
  {
    q: "آیا می‌توانم اجاره فعال را تمدید کنم؟",
    a: "بله، به شرطی که کالا برای روزهای بعد رزرو نشده باشد. درخواست تمدید را از صفحه جزئیات سفارش ثبت کنید.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">راهنما و پشتیبانی</h1>
        <p className="mt-2 text-muted">پاسخ رایج‌ترین پرسش‌های اجاره‌کنندگان و تأمین‌کنندگان.</p>

        <Accordion type="single" collapsible className="mt-8">
          {topics.map((t) => (
            <AccordionItem key={t.q} value={t.q}>
              <AccordionTrigger>{t.q}</AccordionTrigger>
              <AccordionContent>{t.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 rounded-lg border border-border bg-surface p-6 text-center">
          <p className="text-sm text-muted">هنوز به کمک نیاز دارید؟</p>
          <Button className="mt-3" asChild>
            <Link href="/contact">تماس با پشتیبانی</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
