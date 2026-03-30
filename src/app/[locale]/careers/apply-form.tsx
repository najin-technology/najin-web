"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitApplication } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";

export function ApplyForm() {
  const t = useTranslations("careers");
  const tc = useTranslations("common");
  const [state, formAction, pending] = useActionState(submitApplication, {
    success: false,
    error: "",
  });

  if (state.success) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
          {t("successTitle")}
        </h3>
        <p className="text-[#2D3748]">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t("name")} <span className="text-red-500">*</span>
          </Label>
          <Input id="name" name="name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            {t("phone")} <span className="text-red-500">*</span>
          </Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">
            {t("position")} <span className="text-red-500">*</span>
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
              alert(tc("fileSizeError"));
              e.target.value = "";
            }
          }}
        />
        <p className="text-xs text-gray-500">{t("resumeHelp")}</p>
      </div>

      <div className="flex items-start gap-2">
        <input
          id="privacy_agreed"
          name="privacy_agreed"
          type="checkbox"
          required
          className="mt-1"
        />
        <Label htmlFor="privacy_agreed" className="text-sm font-normal">
          {tc("privacyAgree")}{" "}
          <Link
            href="/privacy"
            className="text-[#3182CE] hover:underline"
            target="_blank"
          >
            [{tc("privacyAgree")}]
          </Link>
          <span className="text-red-500 ml-1">*</span>
        </Label>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-[#3182CE] hover:bg-[#2B6CB0] text-white py-3"
        size="lg"
      >
        {pending ? "..." : tc("submit")}
      </Button>
    </form>
  );
}
