"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitQuote } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";

const processingTypeKeys = [
  "urethane",
  "resin",
  "cnc",
  "mold",
  "ev",
  "other",
] as const;

export function QuoteForm() {
  const t = useTranslations("quote");
  const tc = useTranslations("common");
  const [state, formAction, pending] = useActionState(submitQuote, {
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
        <p className="text-[#2D3748] mb-4">{t("successMessage")}</p>
        <p className="text-sm text-gray-500">{t("contactInfo")}</p>
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
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">
            {t("companyName")} <span className="text-red-500">*</span>
          </Label>
          <Input id="company_name" name="company_name" required />
        </div>

        {/* Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="contact_name">
            {t("contactName")} <span className="text-red-500">*</span>
          </Label>
          <Input id="contact_name" name="contact_name" required />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            {t("phone")} <span className="text-red-500">*</span>
          </Label>
          <Input id="phone" name="phone" type="tel" required />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" name="email" type="email" />
        </div>
      </div>

      {/* Processing Type */}
      <div className="space-y-2">
        <Label htmlFor="processing_type">
          {t("processingType")} <span className="text-red-500">*</span>
        </Label>
        <select
          id="processing_type"
          name="processing_type"
          required
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          defaultValue=""
        >
          <option value="" disabled>
            {t("selectType")}
          </option>
          {processingTypeKeys.map((key) => (
            <option key={key} value={t(`processingTypes.${key}`)}>
              {t(`processingTypes.${key}`)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Material */}
        <div className="space-y-2">
          <Label htmlFor="material">{t("material")}</Label>
          <Input
            id="material"
            name="material"
            placeholder={t("materialPlaceholder")}
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">{t("quantity")}</Label>
          <Input
            id="quantity"
            name="quantity"
            placeholder={t("quantityPlaceholder")}
          />
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">{t("deadline")}</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t("description")}</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder={t("descriptionPlaceholder")}
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="attachment">{t("attachment")}</Label>
        <Input
          id="attachment"
          name="attachment"
          type="file"
          accept=".pdf,.dwg,.dxf,.step,.igs,.stp,.jpg,.jpeg,.png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && file.size > 10 * 1024 * 1024) {
              alert(tc("fileSizeError"));
              e.target.value = "";
            }
          }}
        />
        <p className="text-xs text-gray-500">{t("attachmentHelp")}</p>
      </div>

      {/* Privacy Agreement */}
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
            [{t("pageTitle")}]
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
