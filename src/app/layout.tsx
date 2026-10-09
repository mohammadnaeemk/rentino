import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";

const vazirmatn = localFont({
  src: "../../public/fonts/Vazirmatn-Variable.ttf",
  variable: "--font-vazirmatn",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "رنتینو — بازارچه آنلاین اجاره کالا",
  description:
    "رنتینو؛ بازارچه آنلاین اجاره خودرو، کنسول بازی، دوچرخه، دوربین و دیگر کالاها. رزرو آسان، قیمت شفاف و تحویل سریع از تأمین‌کنندگان معتبر.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.variable}>
      <body className="font-sans antialiased">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
        >
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster dir="rtl" position="bottom-center" />
            </AuthProvider>
          </ThemeProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
