-- ============================================================
-- email_templates: 자동 발송 메일 템플릿 (서버측 admin client 전용)
-- 견적 접수 / 상태 변경 시 고객에게 자동 발송될 메일 본문을
-- admin UI 에서 편집 가능하도록 DB 로 분리.
--
-- 보안: anon read 정책 없음 (의도적). 메일 발송 코드는
-- service_role / SECURITY DEFINER 컨텍스트에서만 SELECT.
-- ============================================================

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  trigger_label_ko TEXT NOT NULL,
  subject_ko TEXT NOT NULL DEFAULT '',
  subject_en TEXT NOT NULL DEFAULT '',
  subject_zh TEXT NOT NULL DEFAULT '',
  body_ko TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '',
  body_zh TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  variables_doc TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admin only — no anon read. 메일 발송은 server-side admin client 가 수행.
CREATE POLICY "Admin full access to email_templates"
  ON email_templates FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================
-- Seed: 4개 템플릿 (모두 enabled=FALSE — admin이 검토 후 활성화)
-- ============================================================

INSERT INTO email_templates (key, trigger_label_ko, subject_ko, body_ko, variables_doc) VALUES
  (
    'quote_received',
    '견적 접수 시 고객에게',
    '[나진테크] 견적 문의가 접수되었습니다',
    E'안녕하세요 {{contact_name}}님,\n\n나진테크 견적 문의가 정상적으로 접수되었습니다.\n담당자가 확인 후 빠른 시일 내 회신드리겠습니다.\n\n견적 번호: {{quote_id_short}}\n진행 상황: {{status_url}}\n\n감사합니다.\n나진테크 드림',
    '{{contact_name}} {{company_name}} {{quote_id_short}} {{status_url}} {{processing_type}}'
  ),
  (
    'quote_status_reviewing',
    '견적 상태가 "검토중"으로 변경 시',
    '[나진테크] 견적 검토를 시작했습니다',
    E'안녕하세요 {{contact_name}}님,\n\n견적 번호 {{quote_id_short}} 검토를 시작했습니다.\n진행 상황: {{status_url}}\n\n나진테크 드림',
    '{{contact_name}} {{company_name}} {{quote_id_short}} {{status_url}}'
  ),
  (
    'quote_status_sent',
    '견적 상태가 "견적발송"으로 변경 시',
    '[나진테크] 견적서가 발송되었습니다',
    E'안녕하세요 {{contact_name}}님,\n\n견적 번호 {{quote_id_short}} 견적서가 발송되었습니다.\n메일을 확인 부탁드립니다.\n\n나진테크 드림',
    '{{contact_name}} {{company_name}} {{quote_id_short}} {{status_url}}'
  ),
  (
    'quote_status_completed',
    '견적 상태가 "완료"로 변경 시',
    '[나진테크] 견적 건이 완료 처리되었습니다',
    E'안녕하세요 {{contact_name}}님,\n\n견적 번호 {{quote_id_short}} 건이 완료 처리되었습니다.\n감사합니다.\n\n나진테크 드림',
    '{{contact_name}} {{company_name}} {{quote_id_short}} {{status_url}}'
  );
