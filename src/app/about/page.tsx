import { Aperture, Target, Users, Globe2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { platformStats } from "@/lib/content";

const values = [
  {
    icon: Target,
    title: "دسترسی به‌جای مالکیت",
    body: "کالای باکیفیت نباید فقط به کسانی که آن را می‌خرند محدود باشد. ما کالاهای حرفه‌ای را به‌صورت روزانه در دسترس قرار می‌دهیم.",
  },
  {
    icon: Users,
    title: "کالا از جامعه تأمین‌کنندگان",
    body: "هر آگهی از یک تأمین‌کننده محلی واقعی می‌آید — نه از یک انبار متمرکز.",
  },
  {
    icon: Globe2,
    title: "ساخته‌شده برای کاربران واقعی",
    body: "رنتینو حول نیازهای واقعی سفر، کار و سرگرمی طراحی شده است.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <Aperture className="mx-auto h-10 w-10 text-primary" strokeWidth={1.5} />
            <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">درباره رنتینو</h1>
            <p className="mt-4 text-muted">
              رنتینو، بازارچه آنلاین اجاره کالاست که اجاره‌کنندگان را به تأمین‌کنندگان معتبر
              متصل می‌کند؛ از خودرو و کنسول بازی تا دوربین و دوچرخه. ما این پلتفرم را ساختیم
              تا دسترسی به کالاهای موردنیاز، ساده، شفاف و مقرون‌به‌صرفه باشد.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {platformStats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-3xl font-semibold">{s.value}</p>
                  <p className="mt-1 text-xs text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center font-display text-2xl font-semibold sm:text-3xl">باور ما</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {values.map((v) => (
                <Card key={v.title}>
                  <CardContent className="p-6">
                    <v.icon className="h-6 w-6 text-secondary" strokeWidth={1.5} />
                    <h3 className="mt-3 font-display text-lg font-semibold">{v.title}</h3>
                    <p className="mt-2 text-sm text-muted">{v.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
