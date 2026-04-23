-- ============================================================
-- posts ↔ customers 연결
-- 목적: customer-named 제작사례를 고객 페이지/관리자 타임라인에서 노출
-- ============================================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_posts_customer ON posts(customer_id) WHERE customer_id IS NOT NULL AND deleted_at IS NULL;
