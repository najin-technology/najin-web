"use client";

import { useActionState, useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { submitQuote } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import { CheckCircle, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { track } from "@vercel/analytics";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { trackFormEvent } from "@/lib/analytics/track-form-event";

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
  const [showDetails, setShowDetails] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("najin_quote_draft");
      if (!saved) return false;
      return Object.keys(JSON.parse(saved)).length > 5;
    } catch { return false; }
  });
  const formRef = useRef<HTMLFormElement>(null);

  const STORAGE_KEY = "najin_quote_draft";

  // Restore saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved || !formRef.current) return;
    try {
      const data = JSON.parse(saved) as Record<string, string>;
      for (const [name, value] of Object.entries(data)) {
        const el = formRef.current.elements.namedItem(name);
        if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
          el.value = value;
        }
      }
    } catch { /* ignore corrupt data */ }
  }, []);

  // Save draft on input change (debounced)
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handleFormChange = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (!formRef.current) return;
      const fd = new FormData(formRef.current);
      const data: Record<string, string> = {};
      fd.forEach((v, k) => { if (typeof v === "string" && v) data[k] = v; });
      delete data.privacy_agreed;
      delete data.attachment;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, 500);
  }, []);

  // Clear draft on success
  useEffect(() => {
    if (state.success) {
      track("quote_submitted");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.success]);

  const handleFieldFocus = useCallback((e: React.FocusEvent<HTMLFormElement>) => {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (target && "name" in target && target.name) trackFormEvent(target.name, "focus");
  }, []);

  const handleFieldBlur = useCallback((e: React.FocusEvent<HTMLFormElement>) => {
    const target = e.target as unknown as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!target || !("name" in target) || !target.name) return;
    const val = "value" in target ? target.value : "";
    trackFormEvent(target.name, val && val.length > 0 ? "fill" : "blur_empty");
  }, []);

  if (state.success) {
    return (
      <div
        className="text-center py-16 px-6 rounded-2xl bg-surface-warm-50 border border-surface-warm-200"
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
        <p className="text-brand-charcoal/90 mb-6 text-lg font-medium leading-relaxed">{t("successMessage")}</p>

        <div className="bg-white rounded-xl p-6 mb-6 border border-surface-warm-200 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 text-brand-copper font-bold mb-2">
            <Clock className="w-4 h-4" />
            <span>{t("responsePromise")}</span>
          </div>
          <p className="text-sm text-brand-charcoal/85 font-medium leading-relaxed">{t("nextSteps")}</p>
        </div>

        <p className="text-sm text-brand-charcoal/70 mb-6 font-medium">{t("contactInfo")}</p>

        <Link href="/">
          <Button variant="outline" className="border-brand-navy/20 text-brand-navy hover:bg-brand-navy/5">
            {tc("home")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      onChange={handleFormChange}
      onFocusCapture={handleFieldFocus}
      onBlurCapture={handleFieldBlur}
      className="space-y-6"
    >
      {(state.error || state.errorKey) && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {state.errorKey ? t(`errors.${state.errorKey}`) : state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Name */}
        <div className="space-y-2">
          <Label htmlFor="company_name">
            {t("companyName")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input id="company_name" name="company_name" autoComplete="organization" required placeholder={t("companyNamePlaceholder")} />
        </div>

        {/* Contact Name */}
        <div className="space-y-2">
          <Label htmlFor="contact_name">
            {t("contactName")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input id="contact_name" name="contact_name" autoComplete="name" required placeholder={t("contactNamePlaceholder")} />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            {t("phone")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder={t("phonePlaceholder")} inputMode="tel" />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            {t("email")} <span className="text-red-600 font-bold">*</span>
          </Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder={t("emailPlaceholder")} inputMode="email" />
        </div>
      </div>

      {/* Processing Type */}
      <div className="space-y-2">
        <Label htmlFor="processing_type">
          {t("processingType")} <span className="text-red-600 font-bold">*</span>
        </Label>
        <select
          id="processing_type"
          name="processing_type"
          required
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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

      {/* Optional fields toggle */}
      <div className="border-t border-surface-warm-200 pt-4">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-hover transition-colors w-full"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          {t("optionalFieldsToggle")}
        </button>
        {!showDetails && (
          <p className="text-xs text-brand-charcoal/50 mt-1 ml-6">{t("optionalFieldsHint")}</p>
        )}
      </div>

      {showDetails && (
        <div className="space-y-6">
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
                  toast.error(tc("fileSizeError"));
                  e.target.value = "";
                }
              }}
            />
            <p className="text-xs text-gray-600">{t("attachmentHelp")}</p>
          </div>
        </div>
      )}

      {/* Privacy Agreement */}
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
            [{t("pageTitle")}]
          </Link>
          <span className="text-red-600 ml-1">*</span>
        </Label>
      </div>

      <TurnstileWidget onToken={() => {}} />

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white py-3"
        size="lg"
      >
        {pending ? "..." : tc("submit")}
      </Button>
    </form>
  );
}
