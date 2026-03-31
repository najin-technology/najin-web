"use client";

import { logoutAction } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronRight } from "lucide-react";
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

export function AdminTopbar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean); // ["admin", "notices", "new"]
  const parentPath = segments.length > 2 ? `/admin/${segments[1]}` : null;
  const parentTitle = parentPath ? pageTitles[parentPath] : null;

  const pageTitle =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(key) && key !== "/admin")?.[1] ||
    "";

  const subPage = segments.length > 2 ? subPageLabels[segments[segments.length - 1]] : null;

  return (
    <header className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-1.5 text-sm">
        {parentTitle && subPage ? (
          <>
            <Link href={parentPath!} className="text-gray-400 hover:text-gray-600 transition-colors">
              {parentTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            <span className="font-medium text-gray-700">{subPage}</span>
          </>
        ) : (
          <span className="font-medium text-gray-700">{pageTitle}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-400 hidden sm:block">{userEmail}</span>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0">
            <LogOut className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
