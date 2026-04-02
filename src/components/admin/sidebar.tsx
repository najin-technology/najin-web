"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Users,
  Bell,
  BookOpen,
  Briefcase,
  Package,
  Clock,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
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
      { href: "/admin/posts", label: "포트폴리오", icon: BookOpen },
      { href: "/admin/job-postings", label: "채용공고", icon: Briefcase },
      { href: "/admin/products", label: "제품 관리", icon: Package },
      { href: "/admin/history", label: "연혁 관리", icon: Clock },
    ],
  },
];

export function AdminSidebar({ badges = {} }: { badges?: Record<string, number> }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "4rem" : "16rem"
    );
  }, [collapsed]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const nav = (
    <nav className={`py-5 space-y-6 ${collapsed ? "px-2" : "px-3"}`}>
      {navGroups.map((group, gi) => (
        <div key={gi}>
          {group.label && !collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-gray-400/80">
              {group.label}
            </p>
          )}
          {group.label && collapsed && (
            <div className="mx-auto mb-2 w-6 border-t border-gray-200" />
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
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3 ${collapsed ? "justify-center px-2" : "px-3"} py-2 rounded-lg text-sm transition-all duration-150 ${
                    active
                      ? "bg-brand-navy text-white font-medium shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-normal"
                  }`}
                >
                  {active && !collapsed && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-white/70 shadow-[2px_0_12px_rgba(255,255,255,0.25)]" />
                  )}
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="flex-1 transition-opacity duration-150">{item.label}</span>}
                  {badges[item.href] && badges[item.href] > 0 && (
                    collapsed ? (
                      <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-500" />
                    ) : (
                      <span className={`text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ${
                        active ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
                      }`}>
                        {badges[item.href]}
                      </span>
                    )
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
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 bg-white rounded-xl shadow-md border border-gray-200 focus-visible:ring-2 focus-visible:ring-brand-navy/20 focus-visible:outline-none"
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
        className={`fixed top-0 left-0 h-full ${collapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200/80 z-40 shadow-[1px_0_3px_rgba(0,0,0,0.03)] transition-all duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className={`h-14 flex items-center gap-2.5 ${collapsed ? "px-3 justify-center" : "px-6"} border-b border-gray-100`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-navy to-[#2D4066] flex items-center justify-center shadow-sm flex-shrink-0">
            <span className="text-white text-xs font-bold">N</span>
          </div>
          {!collapsed && (
            <Link
              href="/admin"
              className="text-sm font-bold text-brand-navy tracking-tight"
              onClick={() => setOpen(false)}
            >
              나진테크 관리자
            </Link>
          )}
        </div>
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-[42px] w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-400 hover:text-brand-navy hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-navy/20 focus-visible:outline-none transition-all z-50"
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {collapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>
        {nav}
        <div className={`absolute bottom-0 left-0 right-0 ${collapsed ? "px-2" : "px-6"} py-3 border-t border-gray-100`}>
          {collapsed ? (
            <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors" title="사이트 보기">
              <Home className="w-3.5 h-3.5" />
            </a>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-gray-300">나진테크 관리자 v4.0</p>
              <a href="/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors">
                사이트 보기 →
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
