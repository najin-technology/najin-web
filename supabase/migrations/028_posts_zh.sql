-- 028_posts_zh.sql
-- 중국어(zh) 게시글 지원: title/content/excerpt zh 컬럼 추가.
-- (기존엔 posts에 zh 컬럼이 없어 zh 페이지가 항상 en/ko fallback이었음)
alter table posts
  add column if not exists title_zh text,
  add column if not exists content_zh text,
  add column if not exists excerpt_zh text;
