import { ProfileForm } from "@/components/dashboard/profile-form";

export default function ProviderProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">پروفایل</h1>
        <p className="mt-1 text-sm text-muted">اطلاعات شخصی خود را مدیریت کنید.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
