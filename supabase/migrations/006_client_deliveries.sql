-- ============================================================
-- 거래처 협업사례 (납품현황) 테이블
-- 출처: 회사 소개 글 (https://blog.naver.com/kinghak1/221437105999)
-- 본 테이블의 모든 row 는 검증된 사실 기록만 포함한다.
-- ============================================================

CREATE TABLE client_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_slug TEXT NOT NULL,
  year INT NOT NULL,
  month INT,
  description_ko TEXT NOT NULL,
  description_en TEXT,
  source TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_client_deliveries_slug
  ON client_deliveries(client_slug, year DESC, month DESC);

ALTER TABLE client_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read client deliveries"
  ON client_deliveries FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admin full access to client deliveries"
  ON client_deliveries FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- 시드: 회사 소개 글의 납품현황 16건
-- ============================================================

INSERT INTO client_deliveries (client_slug, year, month, description_ko, description_en, source) VALUES
  -- 현대자동차
  ('hyundai', 2008, 12, '울산 현대자동차 CRANK SHAFT LINE MC가공',
   'Ulsan Hyundai Motor — Crank shaft line MC machining',
   '회사소개 (2019)'),
  ('hyundai', 2009, 7, '울산 현대자동차 변속기라인 청 MC판 가공',
   'Ulsan Hyundai Motor — Transmission line blue MC plate machining',
   '회사소개 (2019)'),
  ('hyundai', 2012, 12, '현대자동차 프레스공장 우레탄 금형받침대',
   'Hyundai Motor — Press shop urethane mold support',
   '회사소개 (2019)'),

  -- 현대파워텍
  ('hyundai-powertech', 2016, 4, '서산 현대파워텍 우레탄 조립',
   'Seosan Hyundai Powertech — Urethane assembly',
   '회사소개 (2019)'),

  -- SK
  ('sk', 2017, 4, 'SK 전지공장용 MC블럭 가공',
   'SK battery plant — MC block machining',
   '회사소개 (2019)'),
  ('sk', 2018, 4, 'SK 전지공장용 MC블럭 가공',
   'SK battery plant — MC block machining',
   '회사소개 (2019)'),

  -- GM Shanghai
  ('gm-shanghai', 2017, 10, '상해 GM 자동창고용 시트',
   'GM Shanghai — Automated warehouse sheets',
   '회사소개 (2019)'),

  -- Lear Dymos
  ('lear-dymos', 2017, 12, 'Lear Dymos (중국공장) 자동창고용 시트',
   'Lear Dymos (China) — Automated warehouse sheets',
   '회사소개 (2019)'),

  -- 화신
  ('hwashin', 2018, 1, '화신 TM PE/PC 가공',
   'Hwashin — TM PE/PC machining',
   '회사소개 (2019)'),
  ('hwashin', 2018, 10, '화신 LX2 PE/PC 가공',
   'Hwashin — LX2 PE/PC machining',
   '회사소개 (2019)'),

  -- 성우하이텍
  ('sungwoo-hitech', 2010, 6, '㈜성우하이텍 거래 등록',
   'Sungwoo Hitech — Vendor registration',
   '회사소개 (2019)'),
  ('sungwoo-hitech', 2019, 8, '성우하이텍 CN7 PE/MC 가공',
   'Sungwoo Hitech — CN7 PE/MC machining',
   '회사소개 (2019)'),

  -- 르노삼성
  ('renault-samsung', 2014, 1, '르노삼성자동차㈜ 거래 등록',
   'Renault Samsung Motors — Vendor registration',
   '회사소개 (2019)'),
  ('renault-samsung', 2019, 12, '르노삼성 LG BATTERY PACK 가공',
   'Renault Samsung — LG BATTERY PACK machining',
   '회사소개 (2019)'),

  -- 한화임팩트 (2003년 ㈜한화종합화학 명의로 거래 등록 → 2014 한화토탈 → 2022 한화임팩트)
  ('hanwha-impact', 2003, 6, '㈜한화종합화학 거래 등록 (현 한화임팩트)',
   'Vendor registration as Hanwha General Chemical (now Hanwha Impact)',
   '회사소개 (2019)'),

  -- 동희산업 (등록 이력만 존재)
  ('donghee', 2014, 2, '동희산업 거래 등록',
   'Donghee Industrial — Vendor registration',
   '회사소개 (2019)');
