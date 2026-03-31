"use client";

const messages: Record<string, { title: string; description: string; retry: string; home: string }> = {
  ko: {
    title: "오류가 발생했습니다",
    description: "페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
    home: "홈으로",
  },
  en: {
    title: "Something went wrong",
    description: "There was a problem loading this page. Please try again.",
    retry: "Try again",
    home: "Go home",
  },
  zh: {
    title: "出现错误",
    description: "加载页面时出现问题，请稍后重试。",
    retry: "重试",
    home: "返回首页",
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Extract locale from URL path
  const locale =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "ko"
      : "ko";
  const t = messages[locale] || messages.ko;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-4xl font-bold text-brand-navy mb-4">{t.title}</h1>
      <p className="text-brand-charcoal/70 mb-8 text-center max-w-md">
        {t.description}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-brand-copper hover:bg-brand-copper-light text-white rounded-lg font-medium transition-colors"
        >
          {t.retry}
        </button>
        <a
          href={`/${locale}`}
          className="px-6 py-2.5 border border-surface-warm-200 text-brand-charcoal rounded-lg font-medium hover:bg-surface-warm-50 transition-colors"
        >
          {t.home}
        </a>
      </div>
    </div>
  );
}
