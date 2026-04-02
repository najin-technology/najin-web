-- ============================================================
-- 카테고리 단순화: 제작사례 / 제품 / 회사소식(→공지사항)
-- ============================================================

-- 1) 회사소식 4건을 공지사항(notices)으로 복사
INSERT INTO notices (title_ko, title_en, content_ko, content_en, is_published, published_at, created_at)
SELECT title_ko, title_en, content_ko, content_en, is_published, published_at, created_at
FROM posts
WHERE category = '회사소식' AND deleted_at IS NULL;

-- 2) 회사소식 포스트를 소프트 삭제
UPDATE posts SET deleted_at = NOW() WHERE category = '회사소식' AND deleted_at IS NULL;

-- 3) 제품홍보 콘텐츠 → category='제품'
UPDATE posts SET category = '제품' WHERE slug = 'antistatic-urethane' AND deleted_at IS NULL;

-- 4) 나머지 모든 포스트 → category='제작사례'
UPDATE posts SET category = '제작사례' WHERE category NOT IN ('제작사례', '제품') AND deleted_at IS NULL;
