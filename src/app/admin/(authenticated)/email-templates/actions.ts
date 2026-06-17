"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { requireAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { renderTemplate, type Locale } from "@/lib/email-templates";
import { renderEmailHtml, buildEmailText, subjectToTitle } from "@/lib/email-layout";

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

const SAMPLE_VARS: Record<string, string> = {
  contact_name: "홍길동",
  company_name: "테스트회사",
  quote_id_short: "TEST1234",
  status_url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/ko/quote/status?id=TEST1234`,
  processing_type: "우레탄 가공",
};

type ActionResult = { ok: boolean; error?: string };

type SaveTemplateInput = {
  key: string;
  enabled: boolean;
  subject_ko: string;
  subject_en: string;
  subject_zh: string;
  body_ko: string;
  body_en: string;
  body_zh: string;
};

export async function saveTemplate(input: SaveTemplateInput): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!input.key) return { ok: false, error: "key 누락" };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("email_templates")
    .update({
      enabled: input.enabled,
      subject_ko: input.subject_ko,
      subject_en: input.subject_en,
      subject_zh: input.subject_zh,
      body_ko: input.body_ko,
      body_en: input.body_en,
      body_zh: input.body_zh,
      updated_by: user.id,
    })
    .eq("key", input.key);

  if (error) return { ok: false, error: `저장 실패: ${error.message}` };

  await logAudit({
    action: "update",
    targetTable: "email_templates",
    targetId: input.key,
    details: { enabled: input.enabled },
  });

  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${input.key}`);

  return { ok: true };
}

// ---- Rate limit for test send (10/hour per admin) ----
let testEmailLimiter: { limit: (k: string) => Promise<{ success: boolean }> } | null = null;
function getTestEmailLimiter() {
  if (testEmailLimiter) return testEmailLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    // Fail closed when rate-limit infra absent — only in production.
    if (process.env.NODE_ENV === "production") {
      testEmailLimiter = { async limit() { return { success: false }; } };
    } else {
      testEmailLimiter = { async limit() { return { success: true }; } };
    }
    return testEmailLimiter;
  }
  const redis = new Redis({ url, token });
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "rl:test-email",
  });
  testEmailLimiter = {
    async limit(k: string) {
      const r = await rl.limit(k);
      return { success: r.success };
    },
  };
  return testEmailLimiter;
}

export async function sendTestEmail(input: {
  key: string;
  to: string;
  locale: Locale;
}): Promise<ActionResult> {
  const user = await requireAdmin();

  if (!input.to || !input.key || !input.locale) {
    return { ok: false, error: "필수 항목 누락" };
  }
  if (!["ko", "en", "zh"].includes(input.locale)) {
    return { ok: false, error: "잘못된 locale" };
  }

  const limiter = getTestEmailLimiter();
  const { success } = await limiter.limit(`test-email:${user.id}`);
  if (!success) return { ok: false, error: "테스트 발송 한도(시간당 10건)를 초과했습니다." };

  const supabase = await createSupabaseServerClient();
  const { data: t, error } = await supabase
    .from("email_templates")
    .select("subject_ko, subject_en, subject_zh, body_ko, body_en, body_zh")
    .eq("key", input.key)
    .single();

  if (error || !t) return { ok: false, error: "템플릿을 찾을 수 없습니다." };

  type Row = {
    subject_ko: string; subject_en: string; subject_zh: string;
    body_ko: string; body_en: string; body_zh: string;
  };
  const row = t as Row;
  const subject = row[`subject_${input.locale}` as const] || row.subject_ko;
  const body = row[`body_${input.locale}` as const] || row.body_ko;
  if (!subject || !body) return { ok: false, error: "해당 언어의 제목/본문이 비어 있습니다." };

  const resend = getResend();
  if (!resend) return { ok: false, error: "메일 서버가 구성되지 않았습니다 (RESEND_API_KEY 누락)." };

  try {
    const renderedSubject = renderTemplate(subject, SAMPLE_VARS);
    const renderedBody = renderTemplate(body, SAMPLE_VARS);
    const statusUrl = SAMPLE_VARS.status_url;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: input.to,
      subject: `[테스트] ${renderedSubject}`,
      html: renderEmailHtml({
        title: subjectToTitle(renderedSubject),
        bodyText: renderedBody,
        locale: input.locale,
        statusUrl,
        referenceValue: SAMPLE_VARS.quote_id_short,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      }),
      text: buildEmailText({ bodyText: renderedBody, locale: input.locale, statusUrl, referenceValue: SAMPLE_VARS.quote_id_short }),
    });
  } catch (e) {
    console.error("sendTestEmail failed:", e);
    return { ok: false, error: "발송 실패. 서버 로그를 확인해주세요." };
  }

  await logAudit({
    action: "test_send",
    targetTable: "email_templates",
    targetId: input.key,
    details: { to: input.to, locale: input.locale },
  });

  return { ok: true };
}
