-- ============================================================
-- 포트폴리오 카테고리 정리
-- 1. content_type, show_on_home 컬럼 추가
-- 2. 회사소식 → 공지사항으로 이동
-- 3. 제품홍보 content_type 설정
-- ============================================================

-- 1) 컬럼 추가
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT '제작사례';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS show_on_home BOOLEAN DEFAULT TRUE;

-- 2) 회사소식 4건을 공지사항으로 복사
INSERT INTO notices (title_ko, title_en, content_ko, content_en, is_published, published_at, created_at)
SELECT title_ko, title_en, content_ko, content_en, is_published, published_at, created_at
FROM posts
WHERE category = '회사소식' AND deleted_at IS NULL;

-- 3) 회사소식 포스트를 소프트 삭제
UPDATE posts SET deleted_at = NOW() WHERE category = '회사소식' AND deleted_at IS NULL;

-- 4) 제품홍보 설정 (제전방지 우레탄 - 직접 판매 콘텐츠)
UPDATE posts SET content_type = '제품홍보' WHERE slug = 'antistatic-urethane' AND deleted_at IS NULL;

-- 5) 나머지는 모두 제작사례 (기본값이므로 별도 설정 불필요)
