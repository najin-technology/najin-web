import { getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";
import { CallbackForm } from "@/components/callback-form";

// Shown on /quote when admin has paused quote intake. Explains the pause and
// collects a cold contact via the existing CallbackForm (white-on-navy styling).
export async function QuotePausedNotice({ message }: { message: string }) {
  const t = await getTranslations("quote.paused");
  const body = message?.trim() || t("defaultMessage");

  return (
    <section className="py-12 md:py-20 bg-surface-warm-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-surface-warm-200 shadow-sm p-8 md:p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-brand-copper/10 flex items-center justify-center mx-auto mb-5">
            <Clock className="w-7 h-7 text-brand-copper" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-3">{t("title")}</h2>
          <p className="text-brand-charcoal/85 leading-relaxed whitespace-pre-line">{body}</p>
        </div>

        <div className="mt-8 bg-brand-navy rounded-2xl p-8 md:p-10 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-1">{t("contactTitle")}</h3>
          <p className="text-white/75 text-sm mb-6 leading-relaxed">{t("contactPrompt")}</p>
          <CallbackForm />
        </div>
      </div>
    </section>
  );
}
