-- ============================================================
-- 고객(Customer) 통합 관리 테이블
-- 견적/지원서/거래처를 단일 고객 엔티티로 통합
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identity
  company_name TEXT NOT NULL,                    -- 회사명 (정규화된 키)
  company_name_normalized TEXT NOT NULL,         -- 매칭용 (lower + trim)
  display_name TEXT,                             -- 표시 이름 (회사명 외 별칭)
  -- Primary contact
  primary_contact_name TEXT,
  primary_contact_phone TEXT,
  primary_contact_email TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT '리드'
    CHECK (status IN ('리드', '검토중', '견적전송', '진행중', '완료', '보류', '거절')),
  source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('quote', 'application', 'manual', 'client_delivery')),
  -- Linkage
  client_slug TEXT,                              -- /lib/clients.ts CLIENTS 의 slug 와 매칭 (있으면 거래처 그리드 노출)
  -- Free-form
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  -- Audit
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_customers_company_normalized
  ON customers(company_name_normalized) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_status ON customers(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_client_slug ON customers(client_slug) WHERE client_slug IS NOT NULL AND deleted_at IS NULL;

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to customers"
  ON customers FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- quotes / applications 에 customer_id FK 추가
-- ============================================================

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotes(customer_id) WHERE customer_id IS NOT NULL;

ALTER TABLE applications ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_applications_customer ON applications(customer_id) WHERE customer_id IS NOT NULL;

-- ============================================================
-- 자동 매칭 / 생성 트리거
-- 새 quote/application 들어오면 회사명(또는 이름)으로 customer 매칭
-- 없으면 신규 customer 생성
-- ============================================================

CREATE OR REPLACE FUNCTION normalize_company_name(name TEXT)
RETURNS TEXT
LANGUAGE sql IMMUTABLE
AS $$
  SELECT regexp_replace(
    regexp_replace(lower(coalesce(name, '')), '\s+', '', 'g'),
    '\(주\)|㈜|주식회사|inc\.?|co\.?,?\s*ltd\.?|llc',
    '',
    'gi'
  );
$$;

CREATE OR REPLACE FUNCTION attach_customer_for_quote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm TEXT;
  v_customer_id UUID;
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_norm := normalize_company_name(NEW.company_name);
  IF v_norm = '' THEN
    RETURN NEW;
  END IF;

  -- Try match
  SELECT id INTO v_customer_id
  FROM customers
  WHERE company_name_normalized = v_norm AND deleted_at IS NULL
  LIMIT 1;

  -- Create if not found
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (
      company_name, company_name_normalized,
      primary_contact_name, primary_contact_phone, primary_contact_email,
      source, status
    ) VALUES (
      NEW.company_name, v_norm,
      NEW.contact_name, NEW.phone, NEW.email,
      'quote', '리드'
    )
    RETURNING id INTO v_customer_id;
  END IF;

  NEW.customer_id := v_customer_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_quotes_attach_customer
  BEFORE INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION attach_customer_for_quote();

-- Same for applications (use applicant name as company key for individuals)
CREATE OR REPLACE FUNCTION attach_customer_for_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm TEXT;
  v_customer_id UUID;
  v_company TEXT;
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- For applications we use the applicant's name as the entity (no company field)
  v_company := COALESCE(NEW.name, '') || ' (지원자)';
  v_norm := normalize_company_name(v_company);
  IF v_norm = '' THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_customer_id
  FROM customers
  WHERE company_name_normalized = v_norm AND deleted_at IS NULL
  LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO customers (
      company_name, company_name_normalized,
      primary_contact_name, primary_contact_phone, primary_contact_email,
      source, status
    ) VALUES (
      v_company, v_norm,
      NEW.name, NEW.phone, NEW.email,
      'application', '리드'
    )
    RETURNING id INTO v_customer_id;
  END IF;

  NEW.customer_id := v_customer_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_applications_attach_customer
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION attach_customer_for_application();

-- ============================================================
-- 거래처 시드 → 10개 client (lib/clients.ts) 를 customers 로 흡수
-- 검증된 거래처는 status='완료' 로 분류 (오랜 거래 + 이력 있음)
-- 거래 등록만 있는 곳(한화/동희)은 status='완료' (일단 거래 관계 등록됨)
-- ============================================================

INSERT INTO customers (company_name, company_name_normalized, display_name, status, source, client_slug, notes) VALUES
  ('현대자동차', normalize_company_name('현대자동차'), '현대자동차 (Hyundai Motor)', '완료', 'client_delivery', 'hyundai',
   '회사소개 (2019) 납품현황: 2008~2012년 다수 가공/우레탄 납품'),
  ('현대파워텍', normalize_company_name('현대파워텍'), '현대파워텍 (Hyundai Powertech)', '완료', 'client_delivery', 'hyundai-powertech',
   '회사소개 (2019) 납품현황: 2016.04 서산 우레탄 조립'),
  ('르노삼성', normalize_company_name('르노삼성'), '르노삼성 (Renault Samsung)', '완료', 'client_delivery', 'renault-samsung',
   '회사소개 (2019) 납품현황: 2014 거래 등록, 2019.12 LG 배터리팩 가공'),
  ('SK', normalize_company_name('SK'), 'SK', '완료', 'client_delivery', 'sk',
   '회사소개 (2019) 납품현황: 2016 거래 등록, 2017/2018 전지공장 MC블럭 가공'),
  ('한화임팩트', normalize_company_name('한화임팩트'), '한화임팩트 (전 한화종합화학)', '완료', 'client_delivery', 'hanwha-impact',
   '회사소개 (2019): 2003.06 ㈜한화종합화학 거래 등록'),
  ('동희산업', normalize_company_name('동희산업'), '동희산업 (Donghee Industrial)', '완료', 'client_delivery', 'donghee',
   '회사소개 (2019): 2014.02 거래 등록'),
  ('화신', normalize_company_name('화신'), '화신 (Hwashin)', '완료', 'client_delivery', 'hwashin',
   '회사소개 (2019) 납품현황: 2018 TM/LX2 PE/PC 가공'),
  ('성우하이텍', normalize_company_name('성우하이텍'), '성우하이텍 (Sungwoo Hitech)', '완료', 'client_delivery', 'sungwoo-hitech',
   '회사소개 (2019): 2010 거래 등록, 2019.08 CN7 PE/MC 가공'),
  ('상해 GM', normalize_company_name('상해 GM'), 'GM Shanghai', '완료', 'client_delivery', 'gm-shanghai',
   '회사소개 (2019) 납품현황: 2017.10 자동창고용 시트'),
  ('Lear Dymos', normalize_company_name('Lear Dymos'), 'Lear Dymos (China)', '완료', 'client_delivery', 'lear-dymos',
   '회사소개 (2019) 납품현황: 2017.12 중국공장 자동창고용 시트');
