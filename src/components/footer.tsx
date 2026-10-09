import Link from "next/link";
import { Aperture, Mail, MapPin, Send } from "lucide-react";

const columns = [
  {
    title: "کاوش",
    links: [
      { href: "/", label: "خانه" },
      { href: "/gear", label: "جستجوی کالا" },
      { href: "/how-it-works", label: "نحوه کار" },
      { href: "/register", label: "تأمین‌کننده شوید" },
    ],
  },
  {
    title: "حساب کاربری",
    links: [
      { href: "/login", label: "ورود" },
      { href: "/register", label: "ساخت حساب" },
      { href: "/dashboard/customer", label: "پنل کاربری من" },
    ],
  },
  {
    title: "پشتیبانی",
    links: [
      { href: "/blog", label: "وبلاگ" },
      { href: "/contact", label: "تماس با ما" },
      { href: "/help", label: "راهنما و پشتیبانی" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-lg font-semibold"
            >
              <Aperture className="h-6 w-6 text-primary" strokeWidth={1.75} />
              رنتینو
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
              بازارچه آنلاین اجاره خودرو، کنسول بازی، دوربین، دوچرخه و دیگر
              کالاها؛ با قیمت روزانه شفاف از تأمین‌کنندگان معتبر.
            </p>

            {/* Contact Information */}
            <div className="mt-4 space-y-2 text-sm text-muted">
              <a
                href="mailto:hello@rentino.ir"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                <bdi>hello@rentino.ir</bdi>
              </a>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                تهران · مشهد · اصفهان
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="تلگرام"
                className="text-muted transition-colors hover:text-primary"
              >
                <Send className="h-5 w-5" />
              </a>

              <a
                href="mailto:hello@rentino.ir"
                aria-label="ایمیل"
                className="text-muted transition-colors hover:text-primary"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="exif-chip">{col.title}</h4>

              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} رنتینو. تمامی حقوق محفوظ است.
          </p>

          <p className="exif-chip">اجاره آسان · تحویل سریع · پرداخت امن</p>
        </div>
      </div>
    </footer>
  );
}
