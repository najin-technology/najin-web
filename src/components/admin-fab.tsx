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
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-[#1B2A4A] to-[#2D4066] hover:from-[#243456] hover:to-[#1B2A4A] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#1B2A4A]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl"
      title="관리자"
    >
      <Shield className="w-5 h-5" />
    </a>
  );
}
