// Lightweight script/language detection for admin reason/notice inputs.
// No dependencies — used to warn (non-blocking) when text isn't written in the
// expected locale (e.g. Korean typed into the English field).

export type Script = "ko" | "zh" | "en" | "other" | "empty";

export function detectScript(text: string): Script {
  const t = (text ?? "").trim();
  if (!t) return "empty";
  // Hangul syllables + Jamo → Korean (checked first; ko text may include Hanja)
  if (/[가-힣ᄀ-ᇿ㄰-㆏]/.test(t)) return "ko";
  // CJK ideographs without any Hangul → treat as Chinese
  if (/[一-鿿㐀-䶿]/.test(t)) return "zh";
  // Latin letters → English
  if (/[A-Za-z]/.test(t)) return "en";
  return "other";
}

// Whether `text` plausibly matches `locale`. Empty or symbol/number-only text
// returns true (don't nag the admin over a blank or "12,000").
export function matchesLocale(text: string, locale: "ko" | "en" | "zh"): boolean {
  const s = detectScript(text);
  if (s === "empty" || s === "other") return true;
  return s === locale;
}
