// 자동 로그인("이 기기에서 로그인 유지") 공용 로직.
// admin_persist_until = 자동 로그인 만료 시각(epoch ms). 유효하면 그 시점까지 세션을
// 유지하고(긴 쿠키 maxAge) 30분 유휴 자동로그아웃을 해제한다. 이메일/비밀번호 로그인 전용.

export const PERSIST_COOKIE = "admin_persist_until";
export const DEFAULT_SESSION_MAX_AGE = 28800; // 8시간 (기본 세션)
export const PERSIST_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30일
export const PERSIST_DURATION_SEC = 30 * 24 * 60 * 60;
export const PERSIST_NOTICE_MS = 24 * 60 * 60 * 1000; // 만료 1일 전부터 안내

/** admin_persist_until 쿠키값 기준 남은 ms. 없거나 만료면 0. */
export function persistRemainingMs(
  raw: string | undefined | null,
  nowMs: number = Date.now()
): number {
  if (!raw) return 0;
  const until = Number(raw);
  if (!Number.isFinite(until)) return 0;
  const remaining = until - nowMs;
  return remaining > 0 ? remaining : 0;
}

/** 세션 쿠키 maxAge(초): 자동 로그인 유효하면 8시간~남은기간 중 큰 값, 아니면 8시간. */
export function sessionMaxAge(
  raw: string | undefined | null,
  nowMs: number = Date.now()
): number {
  const remaining = persistRemainingMs(raw, nowMs);
  if (remaining <= 0) return DEFAULT_SESSION_MAX_AGE;
  return Math.max(DEFAULT_SESSION_MAX_AGE, Math.ceil(remaining / 1000));
}
