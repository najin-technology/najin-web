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
-- 10개 거래처 메타 백필 (lib/clients.ts 의 기존 값)
-- ============================================================

UPDATE customers SET logo_url = '/images/logos/hyundai.svg',           name_en = 'Hyundai Motor',         display_category = 'automotive', display_order = 10  WHERE client_slug = 'hyundai';
UPDATE customers SET logo_url = '/images/logos/hyundai-powertech.svg', name_en = 'Hyundai Powertech',     display_category = 'automotive', display_order = 20  WHERE client_slug = 'hyundai-powertech';
UPDATE customers SET logo_url = '/images/logos/renault.svg',           name_en = 'Renault Samsung',       display_category = 'automotive', display_order = 30, needs_dark_bg = TRUE, registered_year = 2014 WHERE client_slug = 'renault-samsung';
UPDATE customers SET logo_url = '/images/logos/sk.svg',                name_en = 'SK',                    display_category = 'industrial', display_order = 40, registered_year = 2016 WHERE client_slug = 'sk';
UPDATE customers SET logo_url = '/images/logos/hanwha.svg',            name_en = 'Hanwha Impact',         display_category = 'industrial', display_order = 50, registered_year = 2003 WHERE client_slug = 'hanwha-impact';
UPDATE customers SET logo_url = '/images/logos/donghee.png',           name_en = 'Donghee Industrial',    display_category = 'automotive', display_order = 60, registered_year = 2014 WHERE client_slug = 'donghee';
UPDATE customers SET logo_url = '/images/logos/hwashin.svg',           name_en = 'Hwashin',               display_category = 'automotive', display_order = 70  WHERE client_slug = 'hwashin';
UPDATE customers SET logo_url = '/images/logos/sungwoo.svg',           name_en = 'Sungwoo Hitech',        display_category = 'automotive', display_order = 80, registered_year = 2010 WHERE client_slug = 'sungwoo-hitech';
UPDATE customers SET logo_url = '/images/logos/gm.png',                name_en = 'GM Shanghai',           display_category = 'overseas',   display_order = 90  WHERE client_slug = 'gm-shanghai';
UPDATE customers SET logo_url = '/images/logos/lear.svg',              name_en = 'Lear Dymos',            display_category = 'overseas',   display_order = 100 WHERE client_slug = 'lear-dymos';
