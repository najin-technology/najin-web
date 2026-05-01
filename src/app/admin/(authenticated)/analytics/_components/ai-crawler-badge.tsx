import { Bot } from "lucide-react";
import { type AiCrawlerRow, formatRelativeKo } from "@/lib/analytics/queries";

const CRAWLER_LABELS: Record<string, string> = {
  gptbot: "GPTBot (OpenAI)",
  chatgpt: "ChatGPT User",
  claude: "Claude (Anthropic)",
  perplexity: "Perplexity",
  "google-extended": "Google Extended",
  ccbot: "Common Crawl",
  apple: "Applebot",
  you: "You.com",
  bytespider: "ByteDance Spider",
  cohere: "Cohere AI",
};

export function AiCrawlerBadge({ rows }: { rows: AiCrawlerRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.visits, 0);

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <Bot className="w-4 h-4 text-brand-copper" strokeWidth={1.5} />
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
          AI 크롤러 · 최근 30일
        </p>
      </div>

      <div className="mb-5">
        <p className="text-4xl font-semibold tabular-nums tracking-tight text-brand-navy leading-none">
          {total.toLocaleString("ko-KR")}
        </p>
        <p className="text-[13px] text-gray-500 mt-1.5 font-medium">AI 학습/답변용 방문</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">AI 크롤러 방문 기록 없음</p>
      ) : (
        <ul className="space-y-2 border-t border-gray-100 pt-4">
          {rows.slice(0, 6).map((r) => (
            <li key={r.browser} className="flex items-baseline justify-between gap-3 text-[13px]">
              <span className="text-brand-charcoal truncate font-medium">{CRAWLER_LABELS[r.browser] ?? r.browser}</span>
              <span className="flex items-baseline gap-2 flex-shrink-0">
                <span className="tabular-nums font-bold text-brand-navy">
                  {r.visits.toLocaleString("ko-KR")}
                </span>
                <span className="text-gray-500 text-[11px]">{formatRelativeKo(new Date(r.last_seen))}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 leading-relaxed">
        AI 답변에 나진테크가 인용될 확률의 간접 지표
      </p>
    </div>
  );
}
