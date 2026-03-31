"use client";

import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronRight, Home, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const pageTitles: Record<string, string> = {
  "/admin": "대시보드",
  "/admin/quotes": "견적 관리",
  "/admin/applications": "채용 관리",
  "/admin/notices": "공지사항",
  "/admin/job-postings": "채용공고",
  "/admin/products": "제품 관리",
  "/admin/history": "연혁 관리",
};

const subPageLabels: Record<string, string> = {
  new: "새로 만들기",
  edit: "편집",
};

export function AdminTopbar({ userEmail, pendingCount }: { userEmail: string; pendingCount?: number }) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const parentPath = segments.length > 2 ? `/admin/${segments[1]}` : null;
  const parentTitle = parentPath ? pageTitles[parentPath] : null;

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key) && key !== "/admin")?.[1] ||
    "";

  const subPage = segments.length > 2 ? subPageLabels[segments[segments.length - 1]] : null;

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-gray-200/80 bg-white/80 backdrop-blur-md flex items-center justify-between pl-14 pr-6 lg:px-6">
      <nav aria-label="현재 위치" className="flex items-center gap-1.5 text-sm min-w-0">
        {parentTitle && subPage ? (
          <ol className="flex items-center gap-1.5 min-w-0">
            <li className="flex items-center gap-1.5 min-w-0">
              <Link href={parentPath!} className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/20 rounded transition-colors truncate">
                {parentTitle}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" aria-hidden="true" />
            </li>
            <li>
              <span className="font-medium text-brand-navy truncate" aria-current="page">{subPage}</span>
            </li>
          </ol>
        ) : (
          <span className="font-medium text-brand-navy truncate" aria-current="page">{pageTitle}</span>
        )}
      </nav>
      <div className="flex items-center gap-2 flex-shrink-0">
        {pendingCount != null && pendingCount > 0 && (
          <Link href="/admin" className="relative">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-brand-navy h-8 w-8 p-0" aria-label="알림">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            </Button>
          </Link>
        )}
        <span className="text-[11px] text-gray-400 hidden sm:block max-w-[120px] truncate">
          {userEmail}
        </span>
        <div className="w-px h-4 bg-gray-200 hidden sm:block" />
        <form action={logoutAction}>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8 p-0 transition-colors"
            aria-label="로그아웃"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
