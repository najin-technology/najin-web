"use client";

import { useState, useTransition, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Search } from "lucide-react";
import { lookupQuoteStatus } from "./actions";

const STATUS_TO_KEY: Record<string, "received" | "reviewing" | "sent" | "completed"> = {
  접수: "received",
  검토중: "reviewing",
  견적발송: "sent",
  완료: "completed",
};

const STEP_ORDER: Array<"received" | "reviewing" | "sent" | "completed"> = [
  "received",
  "reviewing",
  "sent",
  "completed",
];

type Result =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; status: string; updated_at: string }
  | { kind: "error"; reason: "rate_limited" | "not_found" | "service_unavailable" };

export function StatusForm() {
  const t = useTranslations("quote.status");
  const searchParams = useSearchParams();
  const prefillId = searchParams.get("id") ?? "";

  const [quoteId, setQuoteId] = useState(prefillId);
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setQuoteId(prefillId);
  }, [prefillId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult({ kind: "loading" });
    startTransition(async () => {
      const res = await lookupQuoteStatus({ quoteIdShort: quoteId, email });
      if (res.ok) {
        setResult({ kind: "ok", status: res.status, updated_at: res.updated_at });
      } else {
        setResult({ kind: "error", reason: res.reason });
      }
    });
  }

  const currentStepKey = result.kind === "ok" ? STATUS_TO_KEY[result.status] : null;
  const currentIdx = currentStepKey ? STEP_ORDER.indexOf(currentStepKey) : -1;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-surface-warm-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="quote-id">{t("quoteIdLabel")}</Label>
          <Input
            id="quote-id"
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            placeholder="ABCD1234"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-blue hover:bg-brand-blue-hover text-white font-bold"
          size="lg"
        >
          <Search className="w-4 h-4 mr-2" />
          {pending ? "..." : t("submit")}
        </Button>
      </form>

      {result.kind === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {result.reason === "rate_limited" && t("rateLimited")}
          {result.reason === "not_found" && t("notFound")}
          {result.reason === "service_unavailable" && t("serviceUnavailable")}
        </div>
      )}

      {result.kind === "ok" && (
        <div className="rounded-xl border border-surface-warm-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <p className="text-xs font-bold text-brand-charcoal/65 uppercase tracking-wide">
              {t("currentStep")}
            </p>
            <p className="mt-1 text-2xl font-bold text-brand-navy">
              {currentStepKey ? t(`steps.${currentStepKey}`) : result.status}
            </p>
          </div>

          {/* Horizontal progress bar */}
          <div className="relative">
            <div className="flex justify-between gap-2">
              {STEP_ORDER.map((stepKey, idx) => {
                const reached = currentIdx >= 0 && idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div
                    key={stepKey}
                    className="flex flex-col items-center flex-1 min-w-0 relative"
                  >
                    <div
                      className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold transition-colors ${
                        reached
                          ? "bg-brand-copper text-white"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-4 ring-brand-copper/20 scale-110" : ""}`}
                    >
                      {reached ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm">{idx + 1}</span>}
                    </div>
                    <p
                      className={`mt-2 text-xs sm:text-sm text-center font-semibold ${
                        isCurrent
                          ? "text-brand-navy"
                          : reached
                            ? "text-brand-charcoal/80"
                            : "text-brand-charcoal/40"
                      } ${isCurrent ? "text-base font-bold" : ""}`}
                    >
                      {t(`steps.${stepKey}`)}
                    </p>
                    {idx < STEP_ORDER.length - 1 && (
                      <div
                        className={`absolute top-[18px] left-1/2 right-0 h-1 -z-0 ${
                          idx < currentIdx ? "bg-brand-copper" : "bg-gray-200"
                        }`}
                        style={{ width: "calc(100% - 0px)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-brand-charcoal/70 font-medium">
            {t("lastUpdated")}: <span className="tabular-nums">{new Date(result.updated_at).toLocaleString()}</span>
          </p>
        </div>
      )}
    </div>
  );
}
