"use client";

import { useEffect } from "react";
import { Clock8 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/auth-context";
import Navbar from "@/components/navbar";

const AUTH_ONLY_PATHS = ["/login", "/signup"];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const shouldRedirect = AUTH_ONLY_PATHS.includes(pathname);

  useEffect(() => {
    if (!loading && user && shouldRedirect) {
      router.replace("/missions");
    }
  }, [user, loading, router, shouldRedirect]);

  if (loading || (user && shouldRedirect)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Clock8 size={64} className="animate-spin" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="public">{children}</main>
    </>
  );
}
