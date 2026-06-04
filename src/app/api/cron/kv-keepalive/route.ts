import { getRedis } from "@/lib/ratelimit";

// KV(najin-kv2) keep-alive — Upstash 무료 등급은 일정 기간 요청이 없으면 idle 로 삭제된다.
// 견적 폼 rate limit 외에는 KV 트래픽이 없어 과거 인스턴스가 삭제된 적이 있어,
// Vercel Cron 으로 하루 한 번 가벼운 write 를 보내 "활성" 상태를 유지한다.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel Cron 은 CRON_SECRET 이 설정돼 있으면 Authorization: Bearer <secret> 를 자동 첨부한다.
  // secret 이 있으면 외부 임의 호출을 차단한다 (없으면 검증 생략 — 로컬/미설정 환경).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const redis = getRedis();
  if (!redis) {
    return Response.json({ ok: false, reason: "kv-unavailable" });
  }

  try {
    const at = new Date().toISOString();
    await redis.set("kv:keepalive", at);
    return Response.json({ ok: true, at });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) });
  }
}
