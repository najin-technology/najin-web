import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getLocale } from "next-intl/server";

const messages: Record<string, { text: string; button: string; quote: string }> = {
  ko: { text: "페이지를 찾을 수 없습니다.", button: "홈으로 돌아가기", quote: "견적문의" },
  en: { text: "Page not found.", button: "Go home", quote: "Request a Quote" },
  zh: { text: "未找到页面。", button: "返回首页", quote: "立即询价" },
};

export default async function NotFound() {
  let locale = "ko";
  try {
    locale = await getLocale();
  } catch {
    // fallback to ko
  }
  const t = messages[locale] || messages.ko;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-6xl font-bold text-brand-navy mb-4">404</h1>
      <p className="text-brand-charcoal mb-8">{t.text}</p>
      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
            {t.button}
          </Button>
        </Link>
        <Link href="/quote">
          <Button className="bg-brand-copper hover:bg-brand-copper-light text-white">
            {t.quote}
          </Button>
        </Link>
      </div>
    </div>
  );
}
