import { ProfileForm } from "@/components/dashboard/profile-form";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">پروفایل</h1>
        <p className="mt-1 text-sm text-muted">مدیریت اطلاعات شخصی شما.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
