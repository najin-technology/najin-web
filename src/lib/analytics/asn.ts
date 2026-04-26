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

const KR_ENTERPRISE_KEYWORDS: Array<[RegExp, string]> = [
  [/samsung/i, "Samsung"],
  [/hyundai/i, "Hyundai"],
  [/sk\s*(hynix|telecom|holdings|broadband|innovation|networks)/i, "SK"],
  [/\bsk\s+/i, "SK"],
  [/lg\s*(electronics|chem|display|innotek|uplus|u\+|dacom|cns)/i, "LG"],
  [/\blg\s+/i, "LG"],
  [/posco/i, "POSCO"],
  [/kakao/i, "Kakao"],
  [/naver/i, "Naver"],
  [/kia\s*motors|kia\s*corp/i, "KIA"],
  [/doosan/i, "Doosan"],
  [/hanwha/i, "Hanwha"],
  [/gs\s*(caltex|retail|engineering|e&c)/i, "GS"],
  [/hyundai\s*mobis|hmc\s*investment/i, "Hyundai Mobis"],
  [/amorepacific/i, "AmorePacific"],
  [/celltrion/i, "Celltrion"],
  [/hdc/i, "HDC"],
  [/kt\s*corp|kt\s*global|\bkorea\s*telecom/i, "KT"],
  [/coupang/i, "Coupang"],
  [/woori\s*bank|hana\s*financial|shinhan\s*bank|kb\s*financial/i, "Korean Bank"],
  [/korea\s*gas|kogas/i, "KOGAS"],
  [/korean\s*air|asiana/i, "Korean Airline"],
];

export function classifyAsnCompany(asnOrg: string | null | undefined): string | null {
  if (!asnOrg) return null;
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
