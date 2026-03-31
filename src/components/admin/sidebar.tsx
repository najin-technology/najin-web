"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  Bell,
  Briefcase,
  Package,
  Clock,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "대시보드", icon: Home },
  { href: "/admin/quotes", label: "견적 관리", icon: FileText },
  { href: "/admin/applications", label: "채용 관리", icon: Users },
  { href: "/admin/notices", label: "공지사항", icon: Bell },
  { href: "/admin/job-postings", label: "채용공고", icon: Briefcase },
  { href: "/admin/products", label: "제품 관리", icon: Package },
  { href: "/admin/history", label: "연혁 관리", icon: Clock },
];

export function AdminSidebar({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className="space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-[#3182CE] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {badges[item.href] && badges[item.href] > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                {badges[item.href]}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        onClick={() => setOpen(!open)}
        aria-label="메뉴"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-40 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link
            href="/admin"
            className="text-lg font-bold text-[#1B2A4A]"
            onClick={() => setOpen(false)}
          >
            나진테크 관리자
          </Link>
        </div>
        {nav}
      </aside>
    </>
  );
}
