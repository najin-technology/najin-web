"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/about", key: "about" },
  { href: "/business", key: "business" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/careers", key: "careers" },
  { href: "/notices", key: "notices" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocale = locale === "ko" ? "en" : "ko";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1B2A4A]">
              {tc("companyName")}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#3182CE] ${
                  pathname === item.href
                    ? "text-[#3182CE]"
                    : "text-[#2D3748]"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href={pathname} locale={otherLocale}>
              <Button variant="ghost" size="sm" className="text-xs">
                {tc("language")}
              </Button>
            </Link>
            <Link href="/quote">
              <Button
                size="sm"
                className="bg-[#1B2A4A] hover:bg-[#2D3748] text-white"
              >
                {tc("requestQuote")}
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-[#2D3748]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block text-sm font-medium text-[#2D3748] hover:text-[#3182CE]"
                onClick={() => setMobileOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <Link href={pathname} locale={otherLocale}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setMobileOpen(false)}
                >
                  {tc("language")}
                </Button>
              </Link>
              <Link href="/quote">
                <Button
                  size="sm"
                  className="bg-[#1B2A4A] hover:bg-[#2D3748] text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {tc("requestQuote")}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
