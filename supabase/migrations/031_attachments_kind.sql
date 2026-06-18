-- ============================================================
-- attachments.kind: 첨부 파일의 용도 구분
--   'customer'  — 고객이 견적/지원 폼에서 올린 파일(도면 등). 기본값.
--   'quotation' — 관리자가 견적 상세에서 올린 견적서. '견적발송' 메일에 첨부됨.
-- 기존 행은 모두 'customer' 로 채워진다.
-- ============================================================

ALTER TABLE attachments
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'customer'
    CHECK (kind IN ('customer', 'quotation'));

-- 견적별 견적서 조회 최적화 (발송 시 parent + kind 로 조회)
CREATE INDEX IF NOT EXISTS idx_attachments_parent_kind
  ON attachments (parent_table, parent_id, kind);
