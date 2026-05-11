"use client";

import { useEffect } from "react";
import { Clock8 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Clock8 size={64} className="animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
