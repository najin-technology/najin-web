-- ============================================================
-- product_categories: 제품 카테고리 동적 관리
-- 기존 하드코딩 CHECK 제약을 대체. 관리자가 카테고리 생성/삭제/정렬 가능.
-- ============================================================

CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,                       -- 관리자 목록 뱃지용 tailwind 클래스 (선택)
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product categories"
  ON product_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin full access to product categories"
  ON product_categories FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 기존 5개 카테고리 이전 (색상·순서 보존)
INSERT INTO product_categories (name, color, sort_order) VALUES
  ('우레탄',   'bg-orange-100 text-orange-800', 10),
  ('합성수지', 'bg-purple-100 text-purple-800', 20),
  ('CNC',      'bg-blue-100 text-blue-800',     30),
  ('금형',     'bg-green-100 text-green-800',   40),
  ('EV',       'bg-teal-100 text-teal-800',     50)
ON CONFLICT (name) DO NOTHING;

-- 하드코딩 CHECK 제약 제거 → 관리자가 추가한 카테고리 허용.
-- ponytail: FK 대신 앱 레이어(폼 select + 삭제 가드)로 무결성 유지.
--           소프트삭제 제품이 참조해도 카테고리 삭제가 막히지 않도록 의도적으로 FK 생략.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
