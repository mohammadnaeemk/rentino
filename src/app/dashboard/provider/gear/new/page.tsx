import { GearForm } from "@/components/gear/gear-form";

export default function NewGearPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">افزودن کالا</h1>
        <p className="mt-1 text-sm text-muted">کالای جدیدی برای اجاره مشتریان ثبت کنید.</p>
      </div>
      <GearForm />
    </div>
  );
}
