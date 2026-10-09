import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold">حریم خصوصی</h1>
        <p className="mt-2 text-sm text-muted">آخرین به‌روزرسانی: مرداد ۱۴۰۵</p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-display text-lg font-semibold">اطلاعاتی که جمع‌آوری می‌کنیم</h2>
            <p className="mt-2 text-muted">
              اطلاعاتی که هنگام ساخت حساب وارد می‌کنید — نام، ایمیل و نقش — به‌همراه
              فعالیت‌های اجاره و پرداخت لازم برای فعالیت بازارچه را جمع‌آوری می‌کنیم.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">نحوه استفاده</h2>
            <p className="mt-2 text-muted">
              اطلاعات شما برای پردازش رزروها، تسهیل پرداخت از طریق زرین‌پال، تأیید
              تأمین‌کنندگان و بهبود پلتفرم رنتینو استفاده می‌شود.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">اشتراک‌گذاری داده‌ها</h2>
            <p className="mt-2 text-muted">
              تنها اطلاعات لازم برای تکمیل اجاره (مانند نام و جزئیات تحویل) را با
              تأمین‌کننده یا مشتری مرتبط به اشتراک می‌گذاریم. ما هرگز اطلاعات شخصی را
              نمی‌فروشیم.
            </p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold">حقوق شما</h2>
            <p className="mt-2 text-muted">
              در هر زمان می‌توانید با تماس با <bdi>hello@rentino.ir</bdi> نسخه‌ای از
              داده‌هایتان را درخواست کنید یا حذف حساب‌تان را بخواهید.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
