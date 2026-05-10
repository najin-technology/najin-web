-- ============================================================
-- quotes.locale: 견적 제출 시점의 사이트 locale 기록
-- 후속 자동 메일 발송 시 어떤 언어 템플릿을 사용할지 결정하는 데 사용.
-- ============================================================

ALTER TABLE quotes
  ADD COLUMN locale TEXT NOT NULL DEFAULT 'ko'
    CHECK (locale IN ('ko', 'en', 'zh'));

COMMENT ON COLUMN quotes.locale IS 'Locale at submission time, used for follow-up emails';
