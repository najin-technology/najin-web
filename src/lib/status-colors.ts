// 단일 source of truth: admin 전체 status 색상.
// 새 상태 추가 시 여기만 수정하면 badge/progress/customer 카드 모두 동기화됨.

export type StatusStyle = {
  /** 배경 (badge용) */
  bg: string;
  /** 텍스트 (badge용) */
  text: string;
  /** 도트/세그먼트 (progress bar용) */
  dot: string;
};

const FALLBACK: StatusStyle = {
  bg: "bg-gray-100",
  text: "text-gray-600",
  dot: "bg-gray-300",
};

export const QUOTE_STATUS_STYLES: Record<string, StatusStyle> = {
  "접수":       { bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-500" },
  "검토중":     { bg: "bg-blue-50",     text: "text-blue-700",     dot: "bg-blue-500" },
  "견적발송":   { bg: "bg-violet-50",   text: "text-violet-700",   dot: "bg-violet-500" },
  "완료":       { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500" },
};

export const APPLICATION_STATUS_STYLES: Record<string, StatusStyle> = {
  "서류검토":   { bg: "bg-amber-50",    text: "text-amber-700",    dot: "bg-amber-500" },
  "면접예정":   { bg: "bg-blue-50",     text: "text-blue-700",     dot: "bg-blue-500" },
  "합격":       { bg: "bg-emerald-50",  text: "text-emerald-700",  dot: "bg-emerald-500" },
  "불합격":     { bg: "bg-rose-50",     text: "text-rose-700",     dot: "bg-rose-500" },
};

export const CUSTOMER_STATUS_STYLES: Record<string, StatusStyle> = {
  "리드":       { bg: "bg-gray-100",    text: "text-gray-700",     dot: "bg-gray-400" },
  "검토중":     { bg: "bg-blue-100",    text: "text-blue-700",     dot: "bg-blue-500" },
  "견적전송":   { bg: "bg-amber-100",   text: "text-amber-700",    dot: "bg-amber-500" },
  "진행중":     { bg: "bg-violet-100",  text: "text-violet-700",   dot: "bg-violet-500" },
  "완료":       { bg: "bg-emerald-100", text: "text-emerald-700",  dot: "bg-emerald-500" },
  "보류":       { bg: "bg-yellow-100",  text: "text-yellow-700",   dot: "bg-yellow-500" },
  "거절":       { bg: "bg-rose-100",    text: "text-rose-700",     dot: "bg-rose-500" },
};

const TYPE_MAP = {
  quote: QUOTE_STATUS_STYLES,
  application: APPLICATION_STATUS_STYLES,
  customer: CUSTOMER_STATUS_STYLES,
} as const;

export type StatusType = keyof typeof TYPE_MAP;

export function getStatusStyle(type: StatusType, status: string): StatusStyle {
  return TYPE_MAP[type][status] || FALLBACK;
}
