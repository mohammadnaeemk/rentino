import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const renterSteps = [
  { frame: "۰۱", title: "جستجو و فیلتر", body: "بر اساس دسته‌بندی، قیمت، برند و موجودی لحظه‌ای در میان همه تأمین‌کنندگان جستجو کنید." },
  { frame: "۰۲", title: "تاریخ را رزرو کنید", body: "تاریخ تحویل و بازگشت را در صفحه آگهی انتخاب کنید." },
  { frame: "۰۳", title: "پرداخت امن", body: "با درگاه امن زرین‌پال پرداخت کنید. مبلغ تا تأیید تحویل نگهداری می‌شود." },
  { frame: "۰۴", title: "تحویل کالا", body: "با تأمین‌کننده هماهنگ کنید و پس از بررسی وضعیت کالا، تحویل بگیرید." },
  { frame: "۰۵", title: "بازگشت و نظر", body: "کالا را سر وقت برگردانید، ودیعه آزاد می‌شود و نظرتان را ثبت کنید." },
];

const providerSteps = [
  { frame: "۰۱", title: "کالا را ثبت کنید", body: "عکس، مشخصات و قیمت روزانه را در چند دقیقه اضافه کنید." },
  { frame: "۰۲", title: "موجودی را تنظیم کنید", body: "تقویم به‌محض ثبت رزرو، به‌روز می‌شود." },
  { frame: "۰۳", title: "رزروها را تأیید کنید", body: "درخواست‌های ورودی را تأیید و تحویل را با مشتری هماهنگ کنید." },
  { frame: "۰۴", title: "تحویل و پیگیری", body: "تحویل و بازگشت کالا را از پنل سفارش‌ها ثبت کنید." },
  { frame: "۰۵", title: "درآمد بگیرید", body: "پس از ثبت بازگشت، تسویه‌حساب به‌صورت خودکار انجام می‌شود." },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border py-16 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">رنتینو چطور کار می‌کند؟</h1>
            <p className="mt-4 text-muted">
              چه در حال اجاره کالا باشید و چه بخواهید کالای خودتان را ثبت کنید،
              فرایند طوری طراحی شده که فقط چند دقیقه طول بکشد.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-semibold">برای اجاره‌کنندگان</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {renterSteps.map((s) => (
                <Card key={s.frame}>
                  <CardContent className="p-5">
                    <span className="font-mono text-xs text-primary">{s.frame}</span>
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
            <h2 className="font-display text-2xl font-semibold">برای تأمین‌کنندگان</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {providerSteps.map((s) => (
                <Card key={s.frame}>
                  <CardContent className="p-5">
                    <span className="font-mono text-xs text-secondary">{s.frame}</span>
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
            <h2 className="font-display text-2xl font-semibold">آماده شروع هستید؟</h2>
            <div className="mt-6 flex justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/gear">
                  جستجوی کالا <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/register">تأمین‌کننده شوید</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
