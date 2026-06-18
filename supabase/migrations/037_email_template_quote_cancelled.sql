-- ============================================================
-- quote_cancelled 메일 템플릿: 개별 견적 취소 시 고객에게 사유와 함께 발송.
-- 취소는 명시적 관리자 행동이므로 enabled=TRUE 로 시드.
-- {{cancel_reason}} 은 관리자가 고객 언어로 입력한 사유.
-- ============================================================

INSERT INTO email_templates
  (key, trigger_label_ko, enabled, subject_ko, body_ko, subject_en, body_en, subject_zh, body_zh, variables_doc)
VALUES (
  'quote_cancelled',
  '견적 취소 시 고객에게',
  TRUE,
  '[나진테크] 견적 문의 관련 안내',
  E'{{contact_name}}님, 안녕하세요.\n\n요청해 주신 견적(번호 {{quote_id_short}})을 부득이하게 진행하지 못하게 되어 안내드립니다.\n\n사유: {{cancel_reason}}\n\n양해 부탁드리며, 다음 기회에 다시 도울 수 있기를 바랍니다.\n\n나진테크 드림',
  '[NAJIN TECHNOLOGY] About your quote request',
  E'Hello {{contact_name}},\n\nWe are sorry to let you know that we are unable to proceed with your quote request (No. {{quote_id_short}}).\n\nReason: {{cancel_reason}}\n\nThank you for your understanding, and we hope to work with you another time.\n\nNAJIN TECHNOLOGY',
  '[纳进科技] 关于您的询价',
  E'{{contact_name}} 您好，\n\n很抱歉地通知您，您提交的询价（编号 {{quote_id_short}}）无法继续处理。\n\n原因：{{cancel_reason}}\n\n敬请谅解，期待下次有机会为您服务。\n\n纳进科技 敬上',
  '{{contact_name}} {{quote_id_short}} {{cancel_reason}} {{status_url}}'
) ON CONFLICT (key) DO NOTHING;
