// Shared HTML layout for customer-facing transactional emails.
// Pure string building, no external deps. Email-safe: table layout + inline
// hex colors (email clients don't support OKLCH/CSS vars), brand tokens from
// globals.css. Wraps a plain-text body into a branded HTML email and builds
// the matching plain-text fallback.

export type Locale = "ko" | "en" | "zh";

// Brand palette (mirrors src/app/globals.css --color-brand-*)
const NAVY = "#1B2A4A";
const COPPER = "#B87333";
const INK = "#2D3748";
const MUTED = "#6B7280";
const PAGE = "#F4F5F7";
const LINE = "#E6E8EC";
const PANEL = "#F7F8FA";

const T: Record<Locale, {
  cta: string; refLabel: string; attached: string;
  company: string; hours: string; site: string;
}> = {
  ko: { cta: "진행 상황 확인", refLabel: "견적 번호", attached: "요청하신 견적서를 첨부했습니다.",
        company: "나진테크 (NAJIN TECHNOLOGY)", hours: "평일 08:30~17:30", site: "najin-tech.com" },
  en: { cta: "Track your request", refLabel: "Quote No.", attached: "Your quotation is attached.",
        company: "NAJIN TECHNOLOGY", hours: "Mon-Fri 08:30-17:30", site: "najin-tech.com" },
  zh: { cta: "查询进度", refLabel: "报价编号", attached: "已附上您的报价单。",
        company: "纳进科技 (NAJIN TECHNOLOGY)", hours: "周一至周五 08:30~17:30", site: "najin-tech.com" },
};

const ADDRESS = "경상남도 양산시 산막공단남14길 170";
const TEL = "TEL 055-367-2596";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Drop a leading "[...]" bracket (brand/test prefix) so the subject reads as a title.
export function subjectToTitle(subject: string): string {
  return subject.replace(/^\s*\[[^\]]*\]\s*/, "").trim();
}

// plain-text body -> HTML: blank lines split paragraphs, single newline -> <br>
function bodyToHtml(text: string): string {
  return esc(text)
    .split(/\n{2,}/)
    .filter((p) => p.length > 0)
    .map((p) => `<p style="margin:0 0 16px;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function renderEmailHtml(args: {
  title?: string;
  bodyText: string;
  locale: Locale;
  statusUrl?: string;
  referenceValue?: string;
  attachmentNames?: string[];
  siteUrl?: string;
}): string {
  const t = T[args.locale];
  const statusUrl = args.statusUrl?.trim();
  const siteUrl = (args.siteUrl?.trim() || "https://www.najin-tech.com").replace(/\/$/, "");
  const title = args.title?.trim();
  const ref = args.referenceValue?.trim();
  const files = (args.attachmentNames ?? []).filter(Boolean);
  const preheader = title || args.bodyText.split("\n").find((l) => l.trim()) || "";

  const titleBlock = title
    ? `<tr><td style="padding:32px 32px 0;"><h1 style="margin:0;font-size:21px;line-height:1.35;font-weight:700;color:${NAVY};letter-spacing:-0.2px;">${esc(title)}</h1></td></tr>`
    : "";

  const refBlock = ref
    ? `<tr><td style="padding:20px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${PANEL};border:1px solid ${LINE};border-radius:8px;">
                <tr><td style="padding:12px 16px;">
                  <span style="display:block;font-size:11px;font-weight:700;letter-spacing:0.6px;text-transform:uppercase;color:${MUTED};">${esc(t.refLabel)}</span>
                  <span style="display:block;margin-top:2px;font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:15px;font-weight:700;color:${NAVY};">${esc(ref)}</span>
                </td></tr>
              </table>
            </td></tr>`
    : "";

  const attachBlock = files.length
    ? `<tr><td style="padding:16px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FBF6F0;border:1px solid #EBD9C6;border-radius:8px;">
                <tr><td style="padding:12px 16px;font-size:13px;line-height:1.55;">
                  <span style="color:#7A4E22;font-weight:700;">📎 ${esc(t.attached)}</span><br>
                  <span style="color:#8A5A2B;font-weight:500;">${files.map((f) => esc(f)).join(", ")}</span>
                </td></tr>
              </table>
            </td></tr>`
    : "";

  const ctaBlock = statusUrl
    ? `<tr><td style="padding:24px 32px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background:${NAVY};">
                <a href="${esc(statusUrl)}" style="display:inline-block;padding:13px 30px;color:#ffffff;font-weight:600;font-size:14px;text-decoration:none;border-radius:8px;">${esc(t.cta)} &rsaquo;</a>
              </td></tr></table>
            </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="${args.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${PAGE};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${LINE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
        <tr><td style="background:${NAVY};padding:22px 32px;border-bottom:3px solid ${COPPER};">
          <span style="color:#ffffff;font-size:17px;font-weight:700;letter-spacing:2px;">NAJIN TECHNOLOGY</span>
          <span style="display:block;margin-top:3px;color:#9FB0C9;font-size:11px;letter-spacing:1.5px;">정밀 가공 · PRECISION MANUFACTURING</span>
        </td></tr>
        ${titleBlock}
        <tr><td style="padding:${title ? "16px" : "32px"} 32px 0;color:${INK};font-size:15px;line-height:1.75;">
          ${bodyToHtml(args.bodyText)}
        </td></tr>
        ${refBlock}
        ${attachBlock}
        ${ctaBlock}
        <tr><td style="padding:32px;"></td></tr>
        <tr><td style="background:${PANEL};padding:20px 32px;border-top:1px solid ${LINE};color:${MUTED};font-size:12px;line-height:1.7;">
          <strong style="color:${INK};font-size:13px;">${esc(t.company)}</strong><br>
          ${esc(ADDRESS)}<br>
          ${esc(TEL)} · ${esc(t.hours)}<br>
          <a href="${esc(siteUrl)}" style="color:${NAVY};text-decoration:none;font-weight:600;">${esc(t.site)}</a>
        </td></tr>
      </table>
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="padding:16px 32px;text-align:center;color:#9AA1AC;font-size:11px;line-height:1.6;">
        본 메일은 견적 문의에 대한 자동 안내입니다.
      </td></tr></table>
    </td></tr>
  </table>
</body></html>`;
}

// Plain-text fallback: body + reference + a labeled status URL line.
export function buildEmailText(args: {
  bodyText: string;
  locale: Locale;
  statusUrl?: string;
  referenceValue?: string;
}): string {
  const t = T[args.locale];
  let out = args.bodyText;
  if (args.referenceValue?.trim()) out += `\n\n${t.refLabel}: ${args.referenceValue.trim()}`;
  if (args.statusUrl?.trim()) out += `\n${t.cta}: ${args.statusUrl.trim()}`;
  return out;
}
