"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { Shield } from "lucide-react";

export function AdminFab() {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(user?.app_metadata?.role === "admin");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user?.app_metadata?.role === "admin");
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide on admin pages or if not admin
  if (!isAdmin || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href="/admin"
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#1B2A4A] hover:bg-[#2D3748] text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
      title="관리자"
    >
      <Shield className="w-5 h-5" />
    </a>
  );
}
