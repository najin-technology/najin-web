-- ============================================================
-- 개별 견적 취소: 사유 + 취소 시각 컬럼, status 에 '취소' 값 허용.
-- ============================================================

ALTER TABLE quotes ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- status CHECK 제약에 '취소' 추가 (기존: 접수/검토중/견적발송/완료)
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_status_check
  CHECK (status IN ('접수', '검토중', '견적발송', '완료', '취소'));
