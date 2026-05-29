import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let warnedOnce = false;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    if (!warnedOnce && process.env.NODE_ENV === "production") {
      console.warn(
        "[ratelimit] Upstash Redis env missing (UPSTASH_REDIS_REST_URL/TOKEN or KV_REST_API_URL/TOKEN) — rate limiting DISABLED."
      );
      warnedOnce = true;
    }
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

type Limiter = {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }>;
};

function buildLimiter(limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string): Limiter {
  const client = getRedis();
  if (!client) {
    return {
      async limit() {
        return { success: true, remaining: Number.MAX_SAFE_INTEGER, reset: 0 };
      },
    };
  }
  const rl = new Ratelimit({
    redis: client,
    limiter,
    analytics: true,
    prefix,
  });
  return {
    async limit(key: string) {
      try {
        const res = await rl.limit(key);
        return { success: res.success, remaining: res.remaining, reset: res.reset };
      } catch (e) {
        // Upstash 장애(인스턴스 삭제 / 네트워크 / DNS) 시 폼을 막지 않는다 — fail-open.
        // rate limit은 보조 방어일 뿐이고, 주 봇 방어는 Turnstile + 개인정보 동의.
        // fail-closed 로 두면 외부 KV 장애가 견적 제출 전체를 500 으로 막아버린다.
        if (!warnedOnce) {
          console.error("[ratelimit] limiter unavailable, failing open:", e);
          warnedOnce = true;
        }
        return { success: true, remaining: Number.MAX_SAFE_INTEGER, reset: 0 };
      }
    },
  };
}

export const loginLimiter = buildLimiter(Ratelimit.slidingWindow(5, "15 m"), "rl:login");
export const formLimiter = buildLimiter(Ratelimit.slidingWindow(3, "10 m"), "rl:form");

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "anonymous"
  );
}
