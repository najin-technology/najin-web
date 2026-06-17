-- ============================================================
-- email_templates: 영어/중국어 제목·본문 채움
-- 021 시드는 한국어(_ko)만 채웠고 _en/_zh 는 빈 문자열이라
-- en/zh 고객도 한국어 폴백 메일을 받던 갭을 해소.
-- 한국어는 021 시드 유지. enabled 은 건드리지 않음
-- (테스트 확인 후 admin UI 또는 별도 단계에서 활성화).
-- 변수 {{contact_name}} {{quote_id_short}} {{status_url}} 보존.
-- ============================================================

UPDATE email_templates SET
  subject_en = '[NAJIN TECHNOLOGY] Your quote request has been received',
  body_en = E'Hello {{contact_name}},\n\nYour quote request to NAJIN TECHNOLOGY has been received successfully.\nOur team will review it and reply to you shortly.\n\nQuote number: {{quote_id_short}}\nTrack your request: {{status_url}}\n\nThank you,\nNAJIN TECHNOLOGY',
  subject_zh = '[纳进科技] 您的询价已受理',
  body_zh = E'您好 {{contact_name}}：\n\n您向纳进科技提交的询价已成功受理。\n负责人确认后将尽快回复您。\n\n询价编号：{{quote_id_short}}\n进度查询：{{status_url}}\n\n谢谢。\n纳进科技 敬上'
WHERE key = 'quote_received';

UPDATE email_templates SET
  subject_en = '[NAJIN TECHNOLOGY] We have started reviewing your quote',
  body_en = E'Hello {{contact_name}},\n\nWe have started reviewing your quote request (No. {{quote_id_short}}).\nTrack your request: {{status_url}}\n\nNAJIN TECHNOLOGY',
  subject_zh = '[纳进科技] 我们已开始审核您的询价',
  body_zh = E'您好 {{contact_name}}：\n\n我们已开始审核您的询价（编号 {{quote_id_short}}）。\n进度查询：{{status_url}}\n\n纳进科技 敬上'
WHERE key = 'quote_status_reviewing';

UPDATE email_templates SET
  subject_en = '[NAJIN TECHNOLOGY] Your quotation has been sent',
  body_en = E'Hello {{contact_name}},\n\nThe quotation for your request (No. {{quote_id_short}}) has been sent.\nPlease check your email.\n\nNAJIN TECHNOLOGY',
  subject_zh = '[纳进科技] 报价单已发送',
  body_zh = E'您好 {{contact_name}}：\n\n您的询价（编号 {{quote_id_short}}）报价单已发送，请查收邮件。\n\n纳进科技 敬上'
WHERE key = 'quote_status_sent';

UPDATE email_templates SET
  subject_en = '[NAJIN TECHNOLOGY] Your quote request has been completed',
  body_en = E'Hello {{contact_name}},\n\nYour quote request (No. {{quote_id_short}}) has been marked as completed.\nThank you.\n\nNAJIN TECHNOLOGY',
  subject_zh = '[纳进科技] 您的询价已办理完成',
  body_zh = E'您好 {{contact_name}}：\n\n您的询价（编号 {{quote_id_short}}）已办理完成。\n谢谢。\n\n纳进科技 敬上'
WHERE key = 'quote_status_completed';
