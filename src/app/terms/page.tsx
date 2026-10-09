import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">شرایط استفاده</h1>
        <p className="mt-2 text-sm text-muted">آخرین به‌روزرسانی: مرداد ۱۴۰۵</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">استفاده از رنتینو</h2>
            <p className="mt-2 text-muted">
              با ساخت حساب می‌پذیرید که از پلتفرم فقط برای اجاره قانونی کالا استفاده
              کنید، به‌عنوان تأمین‌کننده وضعیت کالا را دقیق اعلام کنید و به‌عنوان مشتری
              کالا را در تاریخ توافق‌شده بازگردانید.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">پرداخت‌ها</h2>
            <p className="mt-2 text-muted">
              تمام پرداخت‌های اجاره از طریق درگاه زرین‌پال انجام می‌شود. مبلغ تا تأیید
              تحویل نگهداری و پس از بازگشت کالا به تأمین‌کننده آزاد می‌شود.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">خسارت و اختلاف</h2>
            <p className="mt-2 text-muted">
              مشتری مسئول کالا در زمان در اختیار داشتن آن است. اختلاف‌ها درباره خسارت
              یا وضعیت کالا با استفاده از عکس‌های تحویل و بازگشت توسط پشتیبانی رنتینو
              بررسی می‌شود.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">تعلیق حساب</h2>
            <p className="mt-2 text-muted">
              رنتینو این حق را دارد که حساب‌هایی که این شرایط را نقض می‌کنند، از جمله
              عدم حضور مکرر، اعلام نادرست آگهی یا فعالیت پرداخت متقلبانه، تعلیق کند.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
