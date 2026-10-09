import { GearForm } from "@/components/gear/gear-form";

export default function NewGearPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Add gear</h1>
        <p className="mt-1 text-sm text-muted">List a new item for customers to rent.</p>
      </div>
      <GearForm />
    </div>
  );
}
