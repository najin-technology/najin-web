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

const navGroups = [
  {
    items: [{ href: "/admin", label: "대시보드", icon: Home }],
  },
  {
    label: "고객",
    items: [
      { href: "/admin/quotes", label: "견적 관리", icon: FileText },
      { href: "/admin/applications", label: "채용 관리", icon: Users },
    ],
  },
  {
    label: "콘텐츠",
    items: [
      { href: "/admin/notices", label: "공지사항", icon: Bell },
      { href: "/admin/job-postings", label: "채용공고", icon: Briefcase },
      { href: "/admin/products", label: "제품 관리", icon: Package },
      { href: "/admin/history", label: "연혁 관리", icon: Clock },
    ],
  },
];

export function AdminSidebar({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className="px-3 py-5 space-y-6">
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400/80">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? "bg-[#1B2A4A] text-white font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-normal"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-white/60" />
                  )}
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {badges[item.href] && badges[item.href] > 0 && (
                    <span className={`text-[11px] font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1.5 ${
                      active ? "bg-white/20 text-white" : "bg-red-500 text-white"
                    }`}>
                      {badges[item.href]}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-200"
        onClick={() => setOpen(!open)}
        aria-label="메뉴"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200/80 z-40 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center gap-2.5 px-6 border-b border-gray-100">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1B2A4A] to-[#2D4066] flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          <Link
            href="/admin"
            className="text-sm font-bold text-[#1B2A4A] tracking-tight"
            onClick={() => setOpen(false)}
          >
            나진테크 관리자
          </Link>
        </div>
        {nav}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">나진테크 관리자 v3</p>
        </div>
      </aside>
    </>
  );
}
