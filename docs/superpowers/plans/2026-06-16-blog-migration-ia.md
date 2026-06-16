# 네이버 블로그 전수 마이그레이션 (Phase 1–2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 네이버 블로그(`kinghak1`) 31개 글을 전부 사이트로 옮긴다 — 26개는 사례글(`posts`), 5개는 공지(`notices`) — 블로그 실사진·본문을 ground truth로, 공정/거래처/featured 태깅까지.

**Architecture:** 스키마에 `process_category`·`featured` 추가(Phase 1) → 블로그를 브라우저 MCP로 크롤해 구조화 데이터로 추출 → 이미지는 `/public`에 다운로드, 본문·메타는 Supabase MCP로 DB 쓰기(민감 거래처명 #70 정책상 git seed 아닌 DB 직접). 콘텐츠는 DB+ISR 구동이라 코드 배포 없이 라이브 사이트에 반영·검증된다.

**Tech Stack:** Next.js 16 / Supabase(Postgres) / Supabase MCP(`apply_migration`,`execute_sql`) / Playwright MCP(크롤) / curl(이미지).

**제약 (중요):** 로컬에 `node_modules`/`.env.local` 없음 → 앱 로컬 실행·TDD 불가. 검증은 **DB 쿼리(MCP) + 라이브 사이트 브라우저 확인(gstack)**. 모든 운영 DB 쓰기는 **사용자 승인 후** 실행.

**범위 밖 (후속 플랜):** Phase 3(뷰 연결 — 공정필터/거래처 사례 자동표시/featured 노출) · Phase 4(관리자 편집기 필드). 코드+배포 필요하므로 분리.

---

## File Structure

- Create: `supabase/migrations/027_posts_process_featured.sql` — 스키마 (process_category, featured)
- Create: `.context/blog-migration-data.json` — 크롤 산출물(gitignored, 작업용). 31개 글 본문·이미지·날짜
- Create: `.context/blog-migration-map.md` — 큐레이션 매핑표(공정/거래처/featured/post|notice) — 사용자 검토용
- Create: `public/images/posts/*.jpg` — 블로그 실사진 다운로드 (또는 기존 `products/` 재사용)
- DB only (코드 아님): `posts`, `notices` INSERT/UPDATE via MCP

---

### Task 1: 스키마 — posts에 process_category·featured 추가

**Files:**
- Create: `supabase/migrations/027_posts_process_featured.sql`

- [ ] **Step 1: 마이그레이션 작성**

```sql
-- 027_posts_process_featured.sql
-- 사례글 공정 분류 + 전면노출 큐레이션 플래그
alter table posts
  add column if not exists process_category text,
  add column if not exists featured boolean not null default false;

comment on column posts.process_category is '공정 분류: 우레탄 | 합성수지 | CNC | 금형 | EV | 기타 (products.category 재사용)';
comment on column posts.featured is '홈·포트폴리오 전면 노출 큐레이션';

create index if not exists idx_posts_process_category on posts(process_category) where deleted_at is null;
create index if not exists idx_posts_featured on posts(featured) where featured = true and deleted_at is null;
```

- [ ] **Step 2: 적용** — Supabase MCP `apply_migration`(name=`027_posts_process_featured`, query=위 SQL). **승인 필요.**

- [ ] **Step 3: 검증**

Run (MCP `execute_sql`): `select column_name from information_schema.columns where table_name='posts' and column_name in ('process_category','featured');`
Expected: 2 rows (`process_category`, `featured`).

- [ ] **Step 4: Commit** (마이그레이션 파일만)

```bash
git add supabase/migrations/027_posts_process_featured.sql
git commit -m "feat(db): posts process_category + featured (블로그 IA)"
```

---

### Task 2: 블로그 31개 전수 크롤 → 구조화 데이터

**Files:**
- Create: `.context/blog-migration-data.json`

크롤 대상 logNo는 전수조사에서 확보(`.context/blog-audit.md` 참조). 모바일 PostView가 가장 깔끔.

- [ ] **Step 1: 각 글 본문·이미지·날짜 추출**

Playwright MCP로 `https://m.blog.naver.com/kinghak1/{logNo}` 순회. 글마다 `.se-main-container` 스코프에서:
- `imgs`: `data-lazy-src||data-src||src` 중 `pstatic.net|naver.net` + `.jpe?g|.png`, 리사이즈 파라미터(`?type=`) 제거, **본문 컨테이너로 스코프**(사이드바 썸네일 제외).
- `text`: `.se-main-container innerText` (본문만).
- `date`: 인덱스의 addDate 사용.

산출물 JSON 스키마(글당):
```json
{ "logNo": "222704119713", "blogTitle": "SUS후렌지 홀가공", "date": "2022-04-18",
  "images": ["https://mblogthumb-phinf.pstatic.net/.../KakaoTalk_...jpg"],
  "text": "본문 텍스트..." }
```

- [ ] **Step 2: 검증** — JSON 31개 항목, 각 `images.length>=1`(공지 글 제외 가능), `text` 비어있지 않음. 누락 logNo 0개.

- [ ] **Step 3: Commit 안 함** — `.context/`는 gitignored 작업 산출물.

---

### Task 3: 이미지 다운로드 → /public/images/posts/

**Files:**
- Create: `public/images/posts/{slug}-{n}.jpg`

- [ ] **Step 1: 다운로드**

글마다 이미지 URL을 curl(레퍼러 필수, naver 핫링크 차단 회피):
```bash
curl -sL -A "Mozilla/5.0" -e "https://m.blog.naver.com/kinghak1" \
  "{IMG_URL}?type=w966" -o "public/images/posts/{slug}-{n}.jpg"
```
파일명은 글 slug + 인덱스. (기존 `products/`의 올바른 이미지는 재사용 가능 — 중복 다운로드 회피.)

- [ ] **Step 2: 검증**

```bash
for f in public/images/posts/*.jpg; do file -b --mime-type "$f"; done | sort | uniq -c
```
Expected: 전부 `image/jpeg`, 0개의 `text/html`(=에러 페이지). 각 파일 >5KB.

- [ ] **Step 3: 샘플 육안 확인** — Read 도구로 3~5장 열어 실제 부품 사진인지 확인(naver placeholder/워터마크 아님).

- [ ] **Step 4: Commit**

```bash
git add public/images/posts
git commit -m "assets: 블로그 실사진 다운로드 (사례글용)"
```

---

### Task 4: 큐레이션 매핑표 작성 → 사용자 검토

**Files:**
- Create: `.context/blog-migration-map.md`

DB 쓰기 전에 **사람이 검토**할 매핑. 글당: 목적지(post|notice) · slug · `process_category` · `customer`(알려진 것만) · `featured` · `category`(제작사례|제품).

- [ ] **Step 1: 31개 매핑 채우기** (spec 라우팅 기준)

post(~26): 우레탄(11)·합성수지(7)·CNC(5)·금형(2). notice(~5): 회사소개·확장이전·이전안내·견적문의·현장.
거래처는 **알려진 것만**(SK·GM·르노삼성·현대 등), 불명확하면 비움(창작 금지, #70).
featured: 대표성 높은 4~6개만 true.

표 형식:
```md
| logNo | blogTitle | dest | slug | process | customer | featured | category |
|---|---|---|---|---|---|---|---|
| 222704119713 | SUS후렌지 홀가공 | post | sus-flange-hole | CNC | (없음) | false | 제작사례 |
```

- [ ] **Step 2: 사용자 검토 요청** — 매핑표를 사용자에게 보여주고 거래처 연결·featured·제외 글 확정받는다. **승인 후 Task 5 진행.**

---

### Task 5: DB 반영 — notices + posts (MCP, 승인 필요)

**Files:** DB only (`posts`, `notices`) via Supabase MCP `execute_sql`.

- [ ] **Step 1: 공지 5개 INSERT** (`notices`)

각 회사소식 글 → `notices`(title_ko, content_ko, is_published=true, published_at=원본일). 거래처명 없음.

- [ ] **Step 2: 사례글 — 기존 8개 UPDATE**

기존 slug 8개: 본문(B 보강)·이미지(A 실사진 경로)·`process_category`·`featured` 갱신. 거래처명 기존 유지.
예:
```sql
update posts set
  content_ko = $real_content, image_urls = $real_imgs,
  process_category = 'CNC', featured = true
where slug = 'sk-cnc-precision-parts';
```

- [ ] **Step 3: 사례글 — 신규 ~18개 INSERT**

매핑표의 나머지 → `posts` INSERT (slug, title_ko, content_ko, category, process_category, tags, image_urls, thumbnail_url, customer_id(알려진 것만), featured, is_published=true, original_date). 거래처명은 **DB에만**.

- [ ] **Step 4: 검증 (DB)**

```sql
select dest, count(*) from (
  select 'posts' dest from posts where deleted_at is null
  union all select 'notices' from notices where deleted_at is null
) t group by dest;
-- posts ~26, notices 기존+5
select count(*) from posts where deleted_at is null and process_category is null; -- 0 기대
select count(*) from posts where deleted_at is null and (image_urls is null or array_length(image_urls,1)=0); -- 0 기대
```

- [ ] **Step 5: 검증 (라이브 사이트, gstack)**

ISR 갱신 후 라이브 `/ko/posts` 브라우저 확인: 글 수 증가, 썸네일 정상(깨진 이미지 0), 상세 1~2개 열어 본문·이미지·태그 정상. (필요 시 관리자에서 revalidate, 또는 1시간 ISR 대기.)

- [ ] **Step 6: 기록** — 적용한 INSERT/UPDATE를 `scripts/seed/`의 gitignored 백업(비민감분만) 또는 1Password에 남길지 사용자와 확인(#70 운영 시드 방침).

---

## Self-Review

- **Spec coverage:** 스키마(Task1) · 31개 라우팅(Task4) · 이미지 ground truth(Task3) · 본문 A/B(Task5) · 거래처 DB-only(Task4/5) · notices 분리(Task5) 모두 태스크 존재. Phase 3·4는 명시적 범위 밖(후속). ✅
- **Placeholder scan:** 본문/이미지 실값은 Task2 크롤 산출물에서 옴(플랜에 하드코딩 불가한 것이 정상). 절차·검증 쿼리는 구체적. ✅
- **Type consistency:** `process_category` 값 집합(우레탄/합성수지/CNC/금형/EV/기타) 일관. slug 명명 Task3↔4↔5 동일 사용. ✅
- **제약 반영:** 로컬 실행 불가 → 검증을 DB쿼리+라이브브라우저로 일관 지정. 승인 게이트(Task1.2, 4.2, 5) 명시. ✅

## 후속 플랜 (별도)

- **Plan B (Phase 3):** `/posts` 공정 필터 UI·쿼리, `/clients/[slug]` 연결 사례 자동 갤러리, `/business`·`/portfolio`·홈 `featured`·공정 반영. (코드+배포)
- **Plan C (Phase 4):** 관리자 post 편집기에 `process_category`·`featured`·`customer` 필드.
