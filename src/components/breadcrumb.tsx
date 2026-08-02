"use client";

import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

// 시각용 네비게이션만 담당한다.
//
// 예전엔 여기서도 BreadcrumbList JSON-LD 를 뿌렸다. 그런데 페이지가
// buildBreadcrumbJsonLd 로 따로 뿌리는 곳(about/business/careers/portfolio/
// clients)에서는 한 페이지에 BreadcrumbList 가 2개씩 나가서 구글이 어느 쪽을
// 쓸지 알 수 없었다. 게다가 여기서 만들던 쪽이 더 나빴다 — clients 상세는
// "주요실적"과 "거래처"가 똑같이 /portfolio 를 가리키는 4단계로 찍혔다(정상 3단계).
//
// → 구조화 데이터는 @/lib/schema/breadcrumb 하나로 통일.
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
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
              <span className="text-brand-navy font-bold" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
