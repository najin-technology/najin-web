import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { getLocale } from "next-intl/server";

const messages: Record<string, { text: string; button: string }> = {
  ko: { text: "페이지를 찾을 수 없습니다.", button: "홈으로 돌아가기" },
  en: { text: "Page not found.", button: "Go home" },
  zh: { text: "未找到页面。", button: "返回首页" },
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
      <Link href="/">
        <Button className="bg-brand-blue hover:bg-brand-blue-hover text-white">
          {t.button}
        </Button>
      </Link>
    </div>
  );
}
