"use client";

import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { SITE_URL as BASE_URL } from "@/lib/env";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const locale = useLocale();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "ko" ? "홈" : locale === "zh" ? "首页" : "Home", item: `${BASE_URL}/${locale}` },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.label,
        ...(item.href ? { item: `${BASE_URL}/${locale}${item.href}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
    >
      <ol className="flex items-center gap-1.5 text-sm text-brand-charcoal/75 font-medium">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-brand-navy transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-4 h-4 text-brand-charcoal/40" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-brand-navy transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-navy font-bold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
    </>
  );
}
