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
  -- 국내외 주요 완성차사
  ('hyundai', 2008, 12, '울산 국내외 주요 완성차사 CRANK SHAFT LINE MC가공',
   'Ulsan Major automaker — Crank shaft line MC machining',
   '회사소개 (2019)'),
  ('hyundai', 2009, 7, '울산 국내외 주요 완성차사 변속기라인 청 MC판 가공',
   'Ulsan Major automaker — Transmission line blue MC plate machining',
   '회사소개 (2019)'),
  ('hyundai', 2012, 12, '국내외 주요 완성차사 프레스공장 우레탄 금형받침대',
   'Major automaker — Press shop urethane mold support',
   '회사소개 (2019)'),

  -- 주요 부품사
  ('hyundai-powertech', 2016, 4, '서산 주요 부품사 우레탄 조립',
   'Seosan Major parts supplier — Urethane assembly',
   '회사소개 (2019)'),

  -- SK
  ('sk', 2017, 4, 'SK 전지공장용 MC블럭 가공',
   'SK battery plant — MC block machining',
   '회사소개 (2019)'),
  ('sk', 2018, 4, 'SK 전지공장용 MC블럭 가공',
   'SK battery plant — MC block machining',
   '회사소개 (2019)'),

  -- Overseas automaker
  ('gm-shanghai', 2017, 10, '해외 자동차사 자동창고용 시트',
   'Overseas automaker — Automated warehouse sheets',
   '회사소개 (2019)'),

  -- 해외 부품사
  ('lear-dymos', 2017, 12, '해외 부품사 (중국공장) 자동창고용 시트',
   '해외 부품사 (China) — Automated warehouse sheets',
   '회사소개 (2019)'),

  -- 주요 부품사
  ('hwashin', 2018, 1, '주요 부품사 TM PE/PC 가공',
   'Major parts supplier — TM PE/PC machining',
   '회사소개 (2019)'),
  ('hwashin', 2018, 10, '주요 부품사 LX2 PE/PC 가공',
   'Major parts supplier — LX2 PE/PC machining',
   '회사소개 (2019)'),

  -- 주요 부품사
  ('sungwoo-hitech', 2010, 6, '㈜주요 부품사 거래 등록',
   'Major parts supplier — Vendor registration',
   '회사소개 (2019)'),
  ('sungwoo-hitech', 2019, 8, '주요 부품사 CN7 PE/MC 가공',
   'Major parts supplier — CN7 PE/MC machining',
   '회사소개 (2019)'),

  -- 국내 완성차사
  ('renault-samsung', 2014, 1, '국내 완성차사자동차㈜ 거래 등록',
   'Domestic automaker Motors — Vendor registration',
   '회사소개 (2019)'),
  ('renault-samsung', 2019, 12, '국내 완성차사 LG BATTERY PACK 가공',
   'Domestic automaker — LG BATTERY PACK machining',
   '회사소개 (2019)'),

  -- 주요 화학사 (2003년 ㈜주요 화학사 명의로 거래 등록 → 2014 한화토탈 → 2022 주요 화학사)
  ('hanwha-impact', 2003, 6, '㈜주요 화학사 거래 등록 (현 주요 화학사)',
   'Vendor registration as Major chemical company (now Major chemical company)',
   '회사소개 (2019)'),

  -- 주요 부품사 (등록 이력만 존재)
  ('donghee', 2014, 2, '주요 부품사 거래 등록',
   'Major parts supplier — Vendor registration',
   '회사소개 (2019)');
