// preview page for newly created UI components

import SkeletonCard from "@/components/SkeletonCard"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>

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
    </div>
  )
}
