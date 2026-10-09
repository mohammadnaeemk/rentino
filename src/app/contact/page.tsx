"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validations";

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 600));
    toast.success("پیام ارسال شد — ظرف یک روز کاری پاسخ می‌دهیم.");
    reset();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h1 className="font-display text-3xl font-semibold">تماس با ما</h1>
            <p className="mt-3 text-muted">
              درباره رزرو، آگهی یا همکاری با رنتینو سوالی دارید؟ برای ما پیام
              بفرستید تا پاسخگوی شما باشیم.
            </p>
            <div className="mt-8 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <bdi>hello@rentino.ir</bdi>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <bdi dir="ltr">۰۲۱-۰۰۰۰ ۰۰۰۰</bdi>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" /> تهران · مشهد · اصفهان
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-surface p-6" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">نام</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">ایمیل</Label>
              <Input id="email" type="email" dir="ltr" {...register("email")} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">پیام</Label>
              <Textarea id="message" rows={5} {...register("message")} />
              {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
            </div>
            <Button type="submit" className="w-full" loading={isSubmitting}>
              ارسال پیام
            </Button>
            {isSubmitSuccessful && (
              <p className="text-center text-sm text-success">ممنون — پیام شما ارسال شد.</p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
