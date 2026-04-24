import { createHash } from "node:crypto";

export type ReferrerCategory =
  | "direct"
  | "search-naver"
  | "search-google"
  | "search-bing"
  | "search-daum"
  | "search-other"
  | "social"
  | "referral"
  | "internal";

export type DeviceClass = "mobile" | "tablet" | "desktop" | "bot" | "ai-crawler";
export type Browser = "chrome" | "safari" | "firefox" | "edge" | "samsung" | "naver" | "kakao" | "other";

const BOT_PATTERNS = /bot|crawl|spider|headlesschrome|slurp|fetch|lighthouse|preview|monitoring|pingdom|uptimerobot/i;
const AI_CRAWLER_PATTERNS: Array<[RegExp, string]> = [
  [/GPTBot/i, "gptbot"],
  [/ChatGPT-User/i, "chatgpt"],
  [/ClaudeBot|Claude-Web|anthropic/i, "claude"],
  [/PerplexityBot/i, "perplexity"],
  [/Google-Extended/i, "google-extended"],
  [/CCBot/i, "ccbot"],
  [/Applebot|Siri/i, "apple"],
  [/YouBot/i, "you"],
  [/Bytespider/i, "bytespider"],
  [/cohere-ai/i, "cohere"],
];
const SEARCH_NAVER = /naver|search\.naver\.com/i;
const SEARCH_GOOGLE = /google\.|googleusercontent/i;
const SEARCH_BING = /bing\.com/i;
const SEARCH_DAUM = /daum\.net|search\.daum/i;
const SOCIAL = /facebook|instagram|twitter|x\.com|linkedin|youtube|blog\.naver|cafe\.naver|kakao\.com|weibo/i;

export function categorizeReferrer(
  referrer: string | null | undefined,
  ownHost: string
): { category: ReferrerCategory; host: string | null } {
  if (!referrer) return { category: "direct", host: null };
  let url: URL;
  try {
    url = new URL(referrer);
  } catch {
    return { category: "direct", host: null };
  }
  const host = url.hostname.toLowerCase();
  if (host === ownHost || host.endsWith(`.${ownHost}`)) {
    return { category: "internal", host };
  }
  if (SEARCH_NAVER.test(host)) return { category: "search-naver", host };
  if (SEARCH_GOOGLE.test(host)) return { category: "search-google", host };
  if (SEARCH_BING.test(host)) return { category: "search-bing", host };
  if (SEARCH_DAUM.test(host)) return { category: "search-daum", host };
  if (SOCIAL.test(host)) return { category: "social", host };
  if (/search|yahoo|duckduckgo|baidu|yandex|ecosia/i.test(host)) {
    return { category: "search-other", host };
  }
  return { category: "referral", host };
}

export function classifyDevice(userAgent: string): DeviceClass {
  if (!userAgent) return "desktop";
  if (classifyAiCrawler(userAgent)) return "ai-crawler";
  if (BOT_PATTERNS.test(userAgent)) return "bot";
  if (/iPad|Tablet|PlayBook|Kindle/i.test(userAgent)) return "tablet";
  if (/iPhone|Android.+Mobile|Mobile|IEMobile|Opera Mini/i.test(userAgent)) return "mobile";
  return "desktop";
}

export function classifyAiCrawler(userAgent: string): string | null {
  if (!userAgent) return null;
  for (const [pattern, name] of AI_CRAWLER_PATTERNS) {
    if (pattern.test(userAgent)) return name;
  }
  return null;
}

export function classifyBrowser(userAgent: string): Browser {
  if (!userAgent) return "other";
  if (/NAVER\(|Whale/i.test(userAgent)) return "naver";
  if (/KAKAOTALK|Kakao/i.test(userAgent)) return "kakao";
  if (/SamsungBrowser/i.test(userAgent)) return "samsung";
  if (/Edg\//.test(userAgent)) return "edge";
  if (/Firefox/.test(userAgent)) return "firefox";
  if (/Chrome\/|CriOS/.test(userAgent)) return "chrome";
  if (/Safari/.test(userAgent)) return "safari";
  return "other";
}

export function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.test(userAgent);
}

export function sessionHash(ip: string, userAgent: string, date: Date = new Date()): string {
  const day = date.toISOString().slice(0, 10);
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${day}`)
    .digest("hex")
    .slice(0, 32);
}
