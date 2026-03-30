"use client";

import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AdminTopbar({ userEmail }: { userEmail: string }) {
  return (
    <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{userEmail}</span>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <LogOut className="w-4 h-4 mr-1" />
            로그아웃
          </Button>
        </form>
      </div>
    </header>
  );
}
