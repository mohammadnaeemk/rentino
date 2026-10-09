import Link from "next/link";
import { Aperture, Mail, MapPin } from "lucide-react";

function LinkedinGlyph() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A2 2 0 1 0 5.25 7a2 2 0 0 0 0-4ZM20.44 13.41c0-3.46-1.84-5.07-4.3-5.07-1.98 0-2.87 1.09-3.36 1.85V8.5H9.4V20h3.38v-5.69c0-1.5.28-2.95 2.14-2.95 1.84 0 1.87 1.72 1.87 3.05V20h3.37l.28-6.59Z" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46h1.7V3.95c-.3-.04-1.33-.13-2.53-.13-2.5 0-4.21 1.53-4.21 4.34V10H7.2v3h2.76v8h3.54Z" />
    </svg>
  );
}

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/", label: "Home" },
      { href: "/gear", label: "Browse gear" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/register", label: "Become a provider" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Create account" },
      { href: "/dashboard/customer", label: "My dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact us" },
      { href: "/help", label: "Help & support" },
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
              LensLoop
            </Link>

            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
              Professional camera, lighting and event gear, rented by the day
              from trusted local providers.
            </p>

            {/* Contact Information */}
            <div className="mt-4 space-y-2 text-sm text-muted">
              <a
                href="mailto:hello@lensloop.app"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                hello@lensloop.app
              </a>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dhaka · Chattogram · Sylhet
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3">
              {/* LinkedIn */}
              <a
                href="www.linkedin.com/in/roqunuzzaman-saikat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-muted transition-colors hover:text-primary"
              >
                <LinkedinGlyph />
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/roqunuzzaman.saikat"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-muted transition-colors hover:text-primary"
              >
                <FacebookGlyph />
              </a>

              {/* Email */}
              <a
                href="khanrokon571@gmail.com"
                aria-label="Email"
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
          <p>© {new Date().getFullYear()} LensLoop. All rights reserved.</p>

          <p className="exif-chip">
            F/2.8 · 1/125 · ISO 400 · Built for creators
          </p>
        </div>
      </div>
    </footer>
  );
}
