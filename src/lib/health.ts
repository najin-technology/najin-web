import { supabase } from "@/lib/supabase";
import { getRedis } from "@/lib/ratelimit";

export type HealthCheck = {
  name: string;
  ok: boolean;
  /** true면 장애 시 운영자에게 즉시 알림(메일). false면 상태만 보고(설정 누락 등 경미). */
  critical: boolean;
  detail?: string;
};

export type HealthResult = {
  ok: boolean;
  /** critical 체크 중 하나라도 실패 → 알림 대상 */
  criticalDown: boolean;
  checks: HealthCheck[];
  at: string;
};

/**
 * 핵심 시스템 라이브 점검: DB · KV · 이메일/Turnstile 설정.
 * /api/health(수동·외부 모니터)와 /api/cron/health-check(주기 알림)가 공유한다.
 */
export async function runHealthChecks(): Promise<HealthResult> {
  const checks: HealthCheck[] = [];

  // 1) Supabase DB — 공개 읽기 쿼리로 연결 확인 (사이트 핵심)
  try {
    if (!supabase) {
      checks.push({ name: "supabase", ok: false, critical: true, detail: "client not configured" });
    } else {
      const { error } = await supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .limit(1);
      checks.push({ name: "supabase", ok: !error, critical: true, detail: error?.message ?? "ok" });
    }
  } catch (e) {
    checks.push({ name: "supabase", ok: false, critical: true, detail: String(e) });
  }

  // 2) KV (Upstash Redis) — ping. 과거 idle 삭제 사고가 있어 critical 로 본다.
  try {
    const redis = getRedis();
    if (!redis) {
      checks.push({ name: "kv", ok: false, critical: true, detail: "env missing (rate limit fail-open)" });
    } else {
      const pong = await redis.ping();
      checks.push({ name: "kv", ok: pong === "PONG", critical: true, detail: String(pong) });
    }
  } catch (e) {
    checks.push({ name: "kv", ok: false, critical: true, detail: String(e) });
  }

  // 3) 이메일 설정 — 키/수신주소 존재 여부 (실제 발송은 하지 않음). 누락 시 견적/지원 알림이 안 나간다.
  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasNotify = Boolean(process.env.NOTIFICATION_EMAIL);
  checks.push({
    name: "email_config",
    ok: hasResend && hasNotify,
    critical: false,
    detail: !hasResend ? "RESEND_API_KEY 없음" : !hasNotify ? "NOTIFICATION_EMAIL 없음" : "ok",
  });

  // 4) Turnstile 설정 — 봇 차단
  checks.push({
    name: "turnstile_config",
    ok: Boolean(process.env.TURNSTILE_SECRET_KEY),
    critical: false,
    detail: process.env.TURNSTILE_SECRET_KEY ? "ok" : "TURNSTILE_SECRET_KEY 없음",
  });

  const ok = checks.every((c) => c.ok);
  const criticalDown = checks.some((c) => c.critical && !c.ok);
  return { ok, criticalDown, checks, at: new Date().toISOString() };
}
