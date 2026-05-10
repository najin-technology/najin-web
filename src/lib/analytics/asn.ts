import { createHash } from "node:crypto";
import { supabase } from "@/lib/supabase";

const CACHE_TTL_DAYS = 7;
const IPINFO_URL = "https://ipinfo.io";

type AsnLookup = {
  asn: string | null;
  asnOrg: string | null;
  asnCompany: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

type IpInfoResponse = {
  org?: string;
  country?: string;
  region?: string;
  city?: string;
};

// ISP 패턴은 별도 분류 — 일반 가정/모바일 인터넷 사용자가 SK/KT/LG 그룹사로
// 오인되는 false positive 를 방지하기 위해 "(ISP)" suffix 를 붙여 구분한다.
// 운영자는 ISP 라벨을 보고 거래처 방문이 아니라 일반 사용자임을 즉시 식별.
const KR_ISP_KEYWORDS: Array<[RegExp, string]> = [
  [/sk\s*(broadband|telecom)/i, "SK Broadband/Telecom (ISP)"],
  [/lg\s*(uplus|u\+|dacom)/i, "LG U+ (ISP)"],
  [/\bkt\s*corp|\bkorea\s*telecom|\bktf\b/i, "KT (ISP)"],
  [/sejong\s*telecom|drimnet|tbroad|hellovision|cmb|dlive/i, "Other ISP"],
];

// 실제 기업/그룹사 패턴 — ISP 패턴은 위에서 먼저 걸리므로 여기 도달하지 않음.
// (예: "SK Hynix" 는 SK_BROADBAND/TELECOM 정규식에 매칭되지 않아 여기로 떨어짐)
const KR_ENTERPRISE_KEYWORDS: Array<[RegExp, string]> = [
  [/samsung/i, "Samsung"],
  [/sk\s*hynix/i, "SK Hynix"],
  [/sk\s*holdings|sk\s*innovation|sk\s*networks/i, "SK Group"],
  [/hyundai\s*mobis|hmc\s*investment/i, "Hyundai Mobis"],
  [/hyundai/i, "Hyundai"],
  [/lg\s*(electronics|chem|display|innotek|cns)/i, "LG"],
  [/posco/i, "POSCO"],
  [/kakao/i, "Kakao"],
  [/naver/i, "Naver"],
  [/kia\s*motors|kia\s*corp/i, "KIA"],
  [/doosan/i, "Doosan"],
  [/hanwha/i, "Hanwha"],
  [/gs\s*(caltex|retail|engineering|e&c)/i, "GS"],
  [/amorepacific/i, "AmorePacific"],
  [/celltrion/i, "Celltrion"],
  [/hdc/i, "HDC"],
  [/coupang/i, "Coupang"],
  [/woori\s*bank|hana\s*financial|shinhan\s*bank|kb\s*financial/i, "Korean Bank"],
  [/korea\s*gas|kogas/i, "KOGAS"],
  [/korean\s*air|asiana/i, "Korean Airline"],
];

export function classifyAsnCompany(asnOrg: string | null | undefined): string | null {
  if (!asnOrg) return null;
  // ISP 먼저 — false positive 방지가 우선.
  for (const [pattern, label] of KR_ISP_KEYWORDS) {
    if (pattern.test(asnOrg)) return label;
  }
  for (const [pattern, company] of KR_ENTERPRISE_KEYWORDS) {
    if (pattern.test(asnOrg)) return company;
  }
  return null;
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

async function fetchFromIpInfo(ip: string): Promise<AsnLookup | null> {
  const token = process.env.IPINFO_TOKEN?.trim();
  const url = token ? `${IPINFO_URL}/${ip}/json?token=${token}` : `${IPINFO_URL}/${ip}/json`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const data = (await res.json()) as IpInfoResponse;
    const org = data.org ?? null;
    let asn: string | null = null;
    let asnOrg: string | null = null;
    if (org) {
      const match = org.match(/^(AS\d+)\s+(.+)$/);
      if (match) {
        asn = match[1];
        asnOrg = match[2];
      } else {
        asnOrg = org;
      }
    }
    return {
      asn,
      asnOrg,
      asnCompany: classifyAsnCompany(asnOrg),
      country: data.country ?? null,
      region: data.region ?? null,
      city: data.city ?? null,
    };
  } catch {
    return null;
  }
}

export async function lookupAsn(ip: string): Promise<AsnLookup | null> {
  if (!ip || ip === "unknown" || ip === "anonymous") return null;
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return null;
  }

  const ipHash = hashIp(ip);
  const { data: cached } = await supabase
    .from("ip_asn_cache")
    .select("asn, asn_org, asn_company, country, region, city, cached_at")
    .eq("ip_hash", ipHash)
    .maybeSingle();

  if (cached) {
    const age = Date.now() - new Date(cached.cached_at as string).getTime();
    if (age < CACHE_TTL_DAYS * 24 * 60 * 60 * 1000) {
      return {
        asn: cached.asn as string | null,
        asnOrg: cached.asn_org as string | null,
        asnCompany: cached.asn_company as string | null,
        country: cached.country as string | null,
        region: cached.region as string | null,
        city: cached.city as string | null,
      };
    }
  }

  const fresh = await fetchFromIpInfo(ip);
  if (!fresh) return cached ? {
    asn: cached.asn as string | null,
    asnOrg: cached.asn_org as string | null,
    asnCompany: cached.asn_company as string | null,
    country: cached.country as string | null,
    region: cached.region as string | null,
    city: cached.city as string | null,
  } : null;

  await supabase
    .from("ip_asn_cache")
    .upsert({
      ip_hash: ipHash,
      asn: fresh.asn,
      asn_org: fresh.asnOrg,
      asn_company: fresh.asnCompany,
      country: fresh.country,
      region: fresh.region,
      city: fresh.city,
      cached_at: new Date().toISOString(),
    });

  return fresh;
}
