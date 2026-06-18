-- ============================================================
-- 본문 카피 정리 (HTML 레이아웃 개선과 함께).
-- - 제목(subject)이 메일 헤드라인으로 렌더되므로 본문에서 헤드라인
--   반복 문장 제거.
-- - 견적 번호는 레이아웃의 '견적 번호' 참조 필드로 표시되므로 본문
--   inline 번호 제거.
-- - '견적발송' 카피를 첨부 견적서 기준으로 수정
--   ("메일을 확인 부탁드립니다" 동어반복 제거).
-- subject 은 그대로(헤드라인 소스). 모든 locale 본문 갱신.
-- ============================================================

UPDATE email_templates SET
  body_ko = E'{{contact_name}}님, 안녕하세요.\n\n나진테크에 견적을 문의해 주셔서 감사합니다. 담당자가 내용을 확인한 뒤 빠른 시일 내에 회신드리겠습니다.\n\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nThank you for requesting a quote from NAJIN TECHNOLOGY. Our team is reviewing your request and will get back to you shortly.\n\nNAJIN TECHNOLOGY',
  body_zh = E'{{contact_name}} 您好，\n\n感谢您向纳进科技提交询价。我们的负责人正在确认您的需求，并将尽快回复您。\n\n纳进科技 敬上'
WHERE key = 'quote_received';

UPDATE email_templates SET
  body_ko = E'{{contact_name}}님, 안녕하세요.\n\n문의해 주신 견적을 검토하기 시작했습니다. 결과가 정리되는 대로 다시 안내드리겠습니다.\n\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nWe have begun reviewing your quote request. We will update you again as soon as it is ready.\n\nNAJIN TECHNOLOGY',
  body_zh = E'{{contact_name}} 您好，\n\n我们已开始审核您的询价，整理完成后会再次通知您。\n\n纳进科技 敬上'
WHERE key = 'quote_status_reviewing';

UPDATE email_templates SET
  body_ko = E'{{contact_name}}님, 안녕하세요.\n\n요청해 주신 견적서를 첨부해 드립니다. 첨부 파일에서 상세 내용을 확인해 주시고, 궁금한 점은 이 메일로 회신해 주세요.\n\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nYour requested quotation is attached. Please review the attached file, and reply to this email with any questions.\n\nNAJIN TECHNOLOGY',
  body_zh = E'{{contact_name}} 您好，\n\n现将您所需的报价单附在邮件中，详情请查看附件。如有疑问，请直接回复本邮件。\n\n纳进科技 敬上'
WHERE key = 'quote_status_sent';

UPDATE email_templates SET
  body_ko = E'{{contact_name}}님, 안녕하세요.\n\n문의해 주신 견적 건이 완료 처리되었습니다. 이용해 주셔서 감사합니다. 추가로 필요하신 사항이 있으면 언제든 연락 주세요.\n\n나진테크 드림',
  body_en = E'Hello {{contact_name}},\n\nYour quote request has been completed. Thank you for working with us. Please reach out anytime if you need anything further.\n\nNAJIN TECHNOLOGY',
  body_zh = E'{{contact_name}} 您好，\n\n您的询价已办理完成，感谢您的信赖。如有其他需要，欢迎随时与我们联系。\n\n纳进科技 敬上'
WHERE key = 'quote_status_completed';
