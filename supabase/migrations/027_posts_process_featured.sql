-- 027_posts_process_featured.sql
-- 블로그 IA 재정비: 사례글(posts)에 공정 분류 + 전면노출 큐레이션 플래그.
-- products.category(우레탄|합성수지|CNC|금형|EV)와 같은 축을 공유해 뷰에서 묶는다.
alter table posts
  add column if not exists process_category text,
  add column if not exists featured boolean not null default false;

comment on column posts.process_category is '공정 분류: 우레탄 | 합성수지 | CNC | 금형 | EV | 기타 (products.category 재사용)';
comment on column posts.featured is '홈·포트폴리오 전면 노출 큐레이션 (거래처 스토리 위주)';

create index if not exists idx_posts_process_category on posts(process_category) where deleted_at is null;
create index if not exists idx_posts_featured on posts(featured) where featured = true and deleted_at is null;
