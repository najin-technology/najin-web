"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Menu, X, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/about", key: "about" },
  { href: "/business", key: "business" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/posts", key: "posts" },
  { href: "/careers", key: "careers" },
  { href: "/notices", key: "notices" },
  { href: "/faq", key: "faq" },
] as const;

const localeLabels: Record<string, string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
};

export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const otherLocales = (["ko", "en", "zh"] as const).filter((l) => l !== locale);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo variant="dark" size="sm" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`nav-underline text-sm font-medium transition-colors hover:text-brand-navy py-2 ${
                  pathname === item.href
                    ? "text-brand-navy active"
                    : "text-brand-charcoal"
                }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="sm" className="text-sm gap-1.5" />}
              >
                <Globe className="w-4 h-4" />
                {locale.toUpperCase()}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {otherLocales.map((l) => (
                  <DropdownMenuItem key={l} render={<Link href={pathname} locale={l} />}>
                    {localeLabels[l]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/quote">
              <Button
                size="sm"
                className="bg-brand-copper hover:bg-brand-copper-light text-white"
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
            {mobileOpen ? (
              <X className="w-6 h-6 text-brand-charcoal" />
            ) : (
              <Menu className="w-6 h-6 text-brand-charcoal" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-in slide-in-from-top duration-200">
          <nav className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`block text-sm font-medium transition-colors hover:text-brand-blue ${
                  pathname === item.href
                    ? "text-brand-blue"
                    : "text-brand-charcoal"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              {otherLocales.map((l) => (
                <Link key={l} href={pathname} locale={l}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setMobileOpen(false)}
                  >
                    {localeLabels[l]}
                  </Button>
                </Link>
              ))}
              <Link href="/quote">
                <Button
                  size="sm"
                  className="bg-brand-copper hover:bg-brand-copper-light text-white"
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
