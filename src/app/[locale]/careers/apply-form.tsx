"use client";

import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { submitApplication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { CheckCircle } from "lucide-react";
import { track } from "@vercel/analytics";
import { toast } from "sonner";
import { TurnstileWidget } from "@/components/turnstile-widget";

export function ApplyForm() {
  const t = useTranslations("careers");
  const tc = useTranslations("common");
  const [state, formAction, pending] = useActionState(submitApplication, {
    success: false,
    error: "",
  });

  useEffect(() => {
    if (state.success) track("application_submitted");
  }, [state.success]);

  if (state.success) {
    return (
      <div
        className="text-center py-16 px-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
        data-animate="scale-in"
      >
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-brand-navy mb-3">
          {t("successTitle")}
        </h3>
        <p className="text-brand-charcoal/90 text-lg font-medium leading-relaxed">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {(state.error || state.errorKey) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.errorKey ? t(`errors.${state.errorKey}`) : state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t("name")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input id="name" name="name" autoComplete="name" required placeholder={t("namePlaceholder")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            {t("phone")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder={t("phonePlaceholder")} inputMode="tel" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" autoComplete="email" placeholder={t("emailPlaceholder")} inputMode="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">
            {t("position")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input
            id="position"
            name="position"
            required
            placeholder={t("positionPlaceholder")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover_letter">{t("coverLetter")}</Label>
        <Textarea
          id="cover_letter"
          name="cover_letter"
          rows={5}
          placeholder={t("coverLetterPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">{t("resume")}</Label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size > 10 * 1024 * 1024) {
              toast.error(tc("fileSizeError"));
              e.target.value = "";
            }
          }}
        />
        <p className="text-[13px] text-brand-charcoal/75 font-medium">{t("resumeHelp")}</p>
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="privacy_agreed"
          name="privacy_agreed"
          type="checkbox"
          required
          className="mt-1 w-4 h-4 rounded border-gray-300 focus-visible:ring-2 focus-visible:ring-brand-navy/30 focus-visible:ring-offset-1"
        />
        <Label htmlFor="privacy_agreed" className="text-sm font-medium leading-relaxed text-brand-charcoal">
          {tc("privacyAgree")}{" "}
          <Link
            href="/privacy"
            className="text-brand-blue hover:underline font-semibold"
            target="_blank"
          >
            [{tc("privacy")}]
          </Link>
          <span className="text-red-600 ml-1">*</span>
        </Label>
      </div>

      <TurnstileWidget onToken={() => {}} />

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-3 font-bold"
        size="lg"
      >
        {pending ? "..." : tc("submit")}
      </Button>
    </form>
  );
}
