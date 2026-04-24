import { ExternalLink, BarChart3, Globe, LineChart } from "lucide-react";

const dashboards = [
  {
    name: "Vercel Analytics",
    description: "페이지뷰, 성능, 방문자 위치. 이미 수집 중.",
    href: "https://vercel.com/dashboard",
    icon: BarChart3,
    color: "text-black",
  },
  {
    name: "Google Analytics 4",
    description: "유입 경로, 전환, 캠페인 분석. GA4 환경변수 필요.",
    href: "https://analytics.google.com/",
    icon: LineChart,
    color: "text-orange-500",
  },
  {
    name: "Naver Analytics",
    description: "네이버 검색 유입, 키워드 리포트, 한국 방문자 분석.",
    href: "https://analytics.naver.com/",
    icon: Globe,
    color: "text-green-600",
  },
];

export function DashboardLinks() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {dashboards.map((d) => {
        const Icon = d.icon;
        return (
          <a
            key={d.name}
            href={d.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white rounded-2xl border border-gray-200/80 p-5 hover:border-brand-navy/30 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${d.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-brand-navy transition-colors" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">{d.name}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{d.description}</p>
          </a>
        );
      })}
    </div>
  );
}
