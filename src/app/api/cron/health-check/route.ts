import { Resend } from "resend";
import { runHealthChecks } from "@/lib/health";

// 6시간마다 Vercel Cron 이 호출(vercel.json). 핵심 시스템(DB·KV)에 장애가 있으면
// 운영자(NOTIFICATION_EMAIL)에게 메일 알림. 설정 경고(이메일/Turnstile 미설정)는
// 알림 대상이 아니고 상태에만 표시된다(메일이 죽었는데 메일로 알리는 모순 방지).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // kv-keepalive 와 동일한 CRON_SECRET 인증 (외부 임의 호출 차단)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const result = await runHealthChecks();

  if (result.criticalDown) {
    const failed = result.checks.filter((c) => !c.ok);
    console.error("[health-check] FAILED:", JSON.stringify(result));

    const to = process.env.NOTIFICATION_EMAIL;
    const key = process.env.RESEND_API_KEY;
    if (to && key) {
      try {
        const resend = new Resend(key);
        await resend.emails.send({
          from: process.env.FROM_EMAIL || "onboarding@resend.dev",
          to,
          subject: `[나진테크 헬스체크] 시스템 이상 감지 (${failed.map((f) => f.name).join(", ")})`,
          text: `나진테크 웹사이트 자동 헬스체크에서 이상이 감지되었습니다.

시각: ${result.at}

이상 항목:
${failed.map((f) => `- ${f.name}${f.critical ? " (critical)" : ""}: ${f.detail ?? "down"}`).join("\n")}

전체 상태:
${result.checks.map((c) => `- ${c.name}: ${c.ok ? "OK" : "FAIL"} (${c.detail ?? ""})`).join("\n")}

상세 확인: ${process.env.NEXT_PUBLIC_SITE_URL || "https://www.najin-tech.com"}/api/health
---
나진테크 웹사이트 자동 알림`,
        });
      } catch (e) {
        console.error("[health-check] alert email failed:", e);
      }
    }
  }

  return Response.json(result, { status: result.criticalDown ? 503 : 200 });
}
