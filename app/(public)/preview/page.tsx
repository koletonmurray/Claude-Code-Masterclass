// preview page for newly created UI components

import { Plus } from "lucide-react";
import SkeletonCard from "@/components/skeleton-card";
import Avatar from "@/components/avatar";
import AuthForm from "@/components/auth-form";
import CreateMissionForm from "@/components/create-mission-form";

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>

      <h3 className="mt-8 mb-3">Buttons</h3>
      <div className="flex gap-4 items-center flex-wrap">
        <button className="btn">btn</button>
        <button className="btn-primary">btn-primary</button>
        <button className="btn-secondary">btn-secondary</button>
        <button className="btn-gradient">
          <Plus size={16} />
          btn-gradient
        </button>
      </div>

      <h3 className="mt-8 mb-3">Avatar</h3>
      <div className="flex gap-4 items-center">
        <Avatar name="alice" />
        <Avatar name="Taylor" />
        <Avatar name="JohnDoe" />
        <Avatar name="Koleton Murray" />
      </div>

      <h3 className="mt-8 mb-3">SkeletonCard</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <h3 className="mt-8 mb-3">AuthForm — login</h3>
      <AuthForm mode="login" />

      <h3 className="mt-8 mb-3">AuthForm — signup</h3>
      <AuthForm mode="signup" />

      <h3 className="mt-8 mb-3">CreateMissionForm</h3>
      <CreateMissionForm />
    </div>
  );
}
