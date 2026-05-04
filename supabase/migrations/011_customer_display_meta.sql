-- ============================================================
-- customers 테이블에 거래처 표시 메타 컬럼 추가
-- 목적: 정적 src/lib/clients.ts → DB 단일 소스. admin UI 편집 가능.
-- ============================================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS needs_dark_bg BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS display_category TEXT;  -- automotive | industrial | overseas
ALTER TABLE customers ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS registered_year INT;

-- 거래처 그리드 정렬용
CREATE INDEX IF NOT EXISTS idx_customers_display_order
  ON customers(display_order, company_name)
  WHERE client_slug IS NOT NULL AND deleted_at IS NULL;

-- ============================================================
-- 거래처 메타 백필: 실 데이터는 scripts/seed/customer_meta.sql (gitignored).
-- 신규 환경 구축 시 별도 적용 필요. scripts/seed/README.example.md 참고.
-- ============================================================
