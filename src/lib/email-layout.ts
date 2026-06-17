// Shared HTML layout for customer-facing transactional emails.
// Pure string building, no external deps — wraps a plain-text body into a
// branded HTML email + builds the matching plain-text fallback.

export type Locale = "ko" | "en" | "zh";

const CTA_LABELS: Record<Locale, string> = {
  ko: "진행 상황 확인",
  en: "Track your request",
  zh: "查询进度",
};

const FOOTER: Record<Locale, string> = {
  ko: "NAJIN TECHNOLOGY · 정밀 가공 전문",
  en: "NAJIN TECHNOLOGY · Precision Manufacturing",
  zh: "纳进科技 · 精密加工",
};

const DEFAULT_SITE = "https://www.najin-tech.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// plain-text body -> HTML: blank lines split paragraphs, single newlines -> <br>
function bodyToHtml(text: string): string {
  return escapeHtml(text)
    .split(/\n{2,}/)
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 16px;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function renderEmailHtml(args: {
  bodyText: string;
  locale: Locale;
  statusUrl?: string;
  siteUrl?: string;
}): string {
  const statusUrl = args.statusUrl?.trim();
  const siteUrl = args.siteUrl?.trim() || DEFAULT_SITE;
  const siteHost = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const cta = statusUrl
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 8px;"><tr><td style="border-radius:6px;background:#1b2a4a;">
              <a href="${escapeHtml(statusUrl)}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;border-radius:6px;">${CTA_LABELS[args.locale]}</a>
            </td></tr></table>`
    : "";

  return `<!DOCTYPE html>
<html lang="${args.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
        <tr><td style="background:#1b2a4a;padding:20px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:1.5px;">NAJIN TECHNOLOGY</span>
        </td></tr>
        <tr><td style="padding:32px;color:#1f2937;font-size:15px;line-height:1.7;">
          ${bodyToHtml(args.bodyText)}
          ${cta}
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;line-height:1.6;">
          ${escapeHtml(FOOTER[args.locale])} · <a href="${escapeHtml(siteUrl)}" style="color:#6b7280;text-decoration:none;">${escapeHtml(siteHost)}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Plain-text fallback: body + a labeled status URL line (so the link survives
// in clients that show text/plain).
export function buildEmailText(args: {
  bodyText: string;
  locale: Locale;
  statusUrl?: string;
}): string {
  const statusUrl = args.statusUrl?.trim();
  if (!statusUrl) return args.bodyText;
  return `${args.bodyText}\n\n${CTA_LABELS[args.locale]}: ${statusUrl}`;
}
