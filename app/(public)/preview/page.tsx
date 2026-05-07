// preview page for newly created UI components

import { Plus } from "lucide-react";
import SkeletonCard from "@/components/SkeletonCard";
import Avatar from "@/components/Avatar";
import AuthForm from "@/components/AuthForm";

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>

      <h3 className="mt-8 mb-3">Buttons</h3>
      <div className="flex gap-4 items-center">
        <button className="btn">btn</button>
        <button className="btn-primary">
          <Plus size={16} />
          btn-primary
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
    </div>
  );
}
