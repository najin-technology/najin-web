-- ============================================================
-- 본문에서 '진행 상황: {{status_url}}' 줄 제거.
-- 이유: HTML 레이아웃(email-layout.ts)이 status_url 을 CTA 버튼으로
-- 렌더하고, 평문 폴백에도 라벨+URL 한 줄을 자동 추가하므로 본문 내
-- inline URL 줄은 중복이 된다. status 줄을 가진 2개 템플릿만 수정.
-- (quote_status_sent / completed 는 원래 status 줄이 없어 변경 없음.)
-- ============================================================

UPDATE email_templates SET
  body_ko = E'안녕하세요 {{contact_name}}님,\n\n나진테크 견적 문의가 정상적으로 접수되었습니다.\n담당자가 확인 후 빠른 시일 내 회신드리겠습니다.\n\n견적 번호: {{quote_id_short}}\n\n감사합니다.\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nYour quote request to NAJIN TECHNOLOGY has been received successfully.\nOur team will review it and reply to you shortly.\n\nQuote number: {{quote_id_short}}\n\nThank you,\nNAJIN TECHNOLOGY',
  body_zh = E'您好 {{contact_name}}：\n\n您向纳进科技提交的询价已成功受理。\n负责人确认后将尽快回复您。\n\n询价编号：{{quote_id_short}}\n\n谢谢。\n纳进科技 敬上'
WHERE key = 'quote_received';

UPDATE email_templates SET
  body_ko = E'안녕하세요 {{contact_name}}님,\n\n견적 번호 {{quote_id_short}} 검토를 시작했습니다.\n\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nWe have started reviewing your quote request (No. {{quote_id_short}}).\n\nNAJIN TECHNOLOGY',
  body_zh = E'您好 {{contact_name}}：\n\n我们已开始审核您的询价（编号 {{quote_id_short}}）。\n\n纳进科技 敬上'
WHERE key = 'quote_status_reviewing';
