-- ============================================================
-- '견적발송' 본문을 첨부 유무와 무관하게 맞는 중립 카피로 수정.
-- 견적서가 첨부되지 않은 채 '견적발송'으로 바뀌는 경우에도
-- 본문이 거짓("첨부했습니다")이 되지 않도록 함.
-- "첨부했습니다" 문구는 실제 첨부가 있을 때만 HTML 레이아웃의
-- 첨부 콜아웃(email-layout.ts)이 표시한다.
-- ============================================================

UPDATE email_templates SET
  body_ko = E'{{contact_name}}님, 안녕하세요.\n\n요청해 주신 견적이 준비되었습니다. 궁금한 점은 이 메일로 회신해 주세요.\n\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nYour requested quote is ready. Reply to this email with any questions.\n\nNAJIN TECHNOLOGY',
  body_zh = E'{{contact_name}} 您好，\n\n您所需的报价已准备好。如有疑问，请直接回复本邮件。\n\n纳进科技 敬上'
WHERE key = 'quote_status_sent';
