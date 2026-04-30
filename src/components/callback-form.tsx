"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { submitCallback } from "@/app/[locale]/callback-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { CheckCircle, Phone } from "lucide-react";
import { track } from "@vercel/analytics";

export function CallbackForm() {
  const t = useTranslations("callback");
  const tc = useTranslations("common");
  const [state, formAction, pending] = useActionState(submitCallback, {
    success: false,
    error: "",
  });

  useEffect(() => {
    if (state.success) track("callback_requested");
  }, [state.success]);

  if (state.success) {
    return (
      <div className="text-center py-6" data-animate="scale-in">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">
          {t("successTitle")}
        </h3>
        <p className="text-white/80 text-sm">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="cb_company" className="text-white/90 text-sm">
            {t("companyName")} <span className="text-red-400">*</span>
          </Label>
          <Input
            id="cb_company"
            name="company_name"
            autoComplete="organization"
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-copper"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cb_phone" className="text-white/90 text-sm">
            {t("phone")} <span className="text-red-400">*</span>
          </Label>
          <Input
            id="cb_phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-copper"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cb_time" className="text-white/90 text-sm">
          {t("preferredTime")}
        </Label>
        <Input
          id="cb_time"
          name="preferred_time"
          placeholder={t("preferredTimePlaceholder")}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-brand-copper"
        />
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="cb_privacy"
          name="privacy_agreed"
          type="checkbox"
          required
          className="mt-0.5 w-4 h-4 rounded border-white/30 focus-visible:ring-2 focus-visible:ring-brand-copper/30"
        />
        <label htmlFor="cb_privacy" className="text-[13px] text-white/85 font-medium leading-relaxed">
          {tc("privacyAgree")}{" "}
          <Link href="/privacy" className="text-brand-copper hover:underline font-semibold" target="_blank">
            [{tc("privacy")}]
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-copper hover:bg-brand-copper-light text-white py-2.5 min-h-[44px]"
      >
        <Phone className="w-4 h-4 mr-2" />
        {pending ? "..." : t("submit")}
      </Button>
    </form>
  );
}
