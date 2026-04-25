-- ============================================================
-- 발주 관리 (work_orders) — 견적 → 발주 → 가공 → 출하 추적
-- 사용자 의도: 엑셀 대체 X, 가벼운 상태 추적 + 도면 보관 위주
-- ============================================================

CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  product_name TEXT NOT NULL,
  processing_type TEXT,
  material TEXT,
  quantity TEXT,
  deadline DATE,
  priority TEXT NOT NULL DEFAULT '보통'
    CHECK (priority IN ('낮음', '보통', '높음')),
  status TEXT NOT NULL DEFAULT '접수'
    CHECK (status IN ('접수', '도면확정', '가공중', '검수', '출하', '완료')),
  description TEXT,
  internal_memo TEXT,
  assignee TEXT,
  status_started_at TIMESTAMPTZ,
  status_completed_at TIMESTAMPTZ,
  created_by_user_id UUID,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX work_orders_status_idx ON work_orders (status) WHERE deleted_at IS NULL;
CREATE INDEX work_orders_quote_id_idx ON work_orders (quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX work_orders_customer_id_idx ON work_orders (customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX work_orders_created_at_idx ON work_orders (created_at DESC);

-- order_number 자동 생성: 'WO-YYYY-NNNN'
CREATE SEQUENCE IF NOT EXISTS work_order_seq START 1;

CREATE OR REPLACE FUNCTION next_work_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  y TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  n INT := nextval('work_order_seq');
BEGIN
  RETURN 'WO-' || y || '-' || LPAD(n::TEXT, 4, '0');
END $$;

GRANT EXECUTE ON FUNCTION next_work_order_number() TO authenticated;

-- updated_at trigger
CREATE OR REPLACE FUNCTION work_orders_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END $$;

CREATE TRIGGER work_orders_updated_at
BEFORE UPDATE ON work_orders
FOR EACH ROW EXECUTE FUNCTION work_orders_set_updated_at();

-- RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manages work_orders" ON work_orders;
CREATE POLICY "Admin manages work_orders"
  ON work_orders FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- attachments 확장: parent_table에 'work_orders' 추가
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_parent_table_check;
ALTER TABLE attachments ADD CONSTRAINT attachments_parent_table_check
  CHECK (parent_table IN ('quotes', 'applications', 'work_orders'));

-- Storage bucket: work-order-attachments (private, admin only, 50MB)
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-order-attachments', 'work-order-attachments', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: admin only (full management)
DROP POLICY IF EXISTS "Admin uploads work_order files" ON storage.objects;
CREATE POLICY "Admin uploads work_order files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'work-order-attachments' AND is_admin());

DROP POLICY IF EXISTS "Admin reads work_order files" ON storage.objects;
CREATE POLICY "Admin reads work_order files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'work-order-attachments' AND is_admin());

DROP POLICY IF EXISTS "Admin updates work_order files" ON storage.objects;
CREATE POLICY "Admin updates work_order files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'work-order-attachments' AND is_admin())
  WITH CHECK (bucket_id = 'work-order-attachments' AND is_admin());

DROP POLICY IF EXISTS "Admin deletes work_order files" ON storage.objects;
CREATE POLICY "Admin deletes work_order files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'work-order-attachments' AND is_admin());
