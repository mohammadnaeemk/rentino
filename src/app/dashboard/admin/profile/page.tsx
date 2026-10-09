import { ProfileForm } from "@/components/dashboard/profile-form";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted">Manage your personal information.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
