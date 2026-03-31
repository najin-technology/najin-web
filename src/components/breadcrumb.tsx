"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
    >
      <ol className="flex items-center gap-1.5 text-sm text-brand-charcoal/60">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-brand-navy transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-brand-charcoal/30" />
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-brand-navy transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-navy font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
