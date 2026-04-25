/**
 * D-Day 라벨 (마감일 기준).
 * - 오늘: "D-DAY"
 * - 미래: "D-N" (N일 남음)
 * - 과거: "D+N" (N일 지연)
 */
export function dDayLabel(deadline: string | null | undefined): {
  label: string;
  tone: "overdue" | "urgent" | "soon" | "normal" | "none";
} {
  if (!deadline) return { label: "", tone: "none" };
  const now = new Date();
  const target = new Date(deadline);
  // 시간 무시 — 날짜만 비교
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { label: "D-DAY", tone: "urgent" };
  if (diffDays < 0) return { label: `D+${Math.abs(diffDays)}`, tone: "overdue" };
  if (diffDays <= 3) return { label: `D-${diffDays}`, tone: "urgent" };
  if (diffDays <= 7) return { label: `D-${diffDays}`, tone: "soon" };
  return { label: `D-${diffDays}`, tone: "normal" };
}

/**
 * 한국 휴대폰/일반전화 자동 포맷.
 * "01012345678" → "010-1234-5678"
 * "0212345678"  → "02-1234-5678"
 * "0553672596"  → "055-367-2596"
 */
export function formatPhoneKr(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) {
    if (d.startsWith("02")) return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (d.length === 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
  return raw;
}

/**
 * PostgREST .or() 필터에 사용자 입력 넣을 때 escape.
 * 쉼표/괄호/별표는 PostgREST 문법이라 검색어로 못 들어가게.
 */
export function escapePostgrestFilter(input: string): string {
  return input.replace(/[,()*]/g, "");
}
