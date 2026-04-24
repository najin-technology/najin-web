import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
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
      const res = await rl.limit(key);
      return { success: res.success, remaining: res.remaining, reset: res.reset };
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
