# 견적 접수 일시중지 + 개별 견적 취소 — 설계 스펙

작성일: 2026-06-18
브랜치: `feat/quote-pause-cancel` (base: main)

## 배경 / 문제
공장이 바쁠 때 견적을 더 소화하지 못하는 상황이 있어, (A) **전체 견적 접수를 일시 중지**하고 콜드 연락처만 받는 모드와, (B) 이미 들어온 **개별 견적을 사유와 함께 취소**(고객에게 그 언어로 안내)하는 기능이 필요하다. 메일 인프라(`sendByTemplateKey`, `email_templates`, HTML 레이아웃)는 main에 있음.

## Part A — 전체 견적 접수 일시중지

**저장**: 신규 싱글톤 `site_settings`(id=1)
- `quotes_paused boolean NOT NULL DEFAULT false`
- `pause_message_ko / _en / _zh text NOT NULL DEFAULT ''`
- RLS: anon SELECT + admin UPDATE (site_about 패턴). `updated_at` 트리거. `INSERT (id) VALUES (1)`.

**읽기**: `getSiteSettings()` (`lib/queries.ts`) — `unstable_cache(..., ["site-settings"], { tags: [CACHE_TAGS.siteSettings] })`. `CACHE_TAGS.siteSettings` 추가.

**관리자** `/admin/settings`에 "견적 접수" 카드(신규 클라이언트 컴포넌트 `_components/quote-intake-settings.tsx`):
- 토글 `quotes_paused` + 안내문 ko/en/zh 입력(선택) + 각 칸 언어 감지 힌트.
- 저장 액션 `saveQuoteIntakeSettings`(`settings/actions.ts` 신규): UPDATE site_settings → `updateTag(CACHE_TAGS.siteSettings)` + `revalidatePath('/', 'layout')` 류로 견적 페이지 즉시 무효화 → audit.

**고객** `/{locale}/quote/page.tsx`: `const s = await getSiteSettings()`. `s.quotes_paused`면 견적 폼 대신 `<QuotePausedNotice locale message />`:
- 제목: i18n `quote.paused.title` ("견적 접수를 잠시 중단했습니다")
- 본문: `s.pause_message_{locale}` → 없으면 `_ko` → 없으면 i18n `quote.paused.defaultMessage`
- 콜드 연락처: 기존 `<CallbackForm/>` 재사용 (회사명·연락처 → quotes 테이블 `콜백요청`).

## Part B — 개별 견적 취소 (사유 필수 → 고객 언어 메일)

**저장**: `quotes`에 `cancel_reason text`, `cancelled_at timestamptz` 추가. status CHECK 제약에 `'취소'` 추가(DROP/ADD CONSTRAINT). `status-colors.ts`에 quote `'취소'` 스타일(붉은/회색) 추가.

**메일 템플릿**: `email_templates`에 `quote_cancelled` 시드(마이그레이션) — ko/en/zh subject+body, `enabled=true`(취소는 명시적 관리자 행동). 변수 `{{contact_name}} {{quote_id_short}} {{cancel_reason}} {{status_url}}`. sendByTemplateKey가 HTML 레이아웃으로 감싸 발송.

**관리자** 견적 상세(`quotes/[id]`)에 취소 컴포넌트(신규 `cancel-quote.tsx`, 클라이언트):
- "견적 취소" 버튼 → 사유 textarea(**필수**) + 해당 견적 `locale` 안내 + **언어 감지 경고**(사유 스크립트 ≠ 견적 locale이면 ⚠️, 비차단) → 확인.
- 이미 취소된 건이면 비활성/숨김.

**액션** `cancelQuote(quoteId, reason)`(`quotes/actions.ts`):
- `requireAdmin`. reason 공백이면 에러(취소 불가).
- quote 조회(locale,email,contact_name,status). 이미 '취소'면 무시.
- UPDATE status='취소', cancel_reason, cancelled_at.
- 이메일: `sendByTemplateKey({ key:'quote_cancelled', to:email, locale, vars:{ contact_name, quote_id_short, cancel_reason, status_url } })`.
- audit + revalidatePath.

## 공유 — 언어 감지 유틸
`src/lib/detect-script.ts`: `detectScript(text): "ko"|"zh"|"en"|"other"|"empty"`
- 한글(가–힣/자모) 있으면 `ko`; 한글 없고 한자(CJK Unified) 있으면 `zh`; 라틴 위주면 `en`; 그 외 `other`; 공백 `empty`.
- 순수 함수, 라이브러리 없음. `detect-script.test.ts`(node:test) 자체검증 1개. Part A·B 입력 힌트에 공용.

## i18n
`messages/{ko,en,zh}.json`의 `quote`에 `paused: { title, defaultMessage, contactPrompt }` 추가. (콜백 폼 라벨은 기존 사용.)

## 범위 밖 (YAGNI)
- 자동 번역, 자동 재개 예약, 헤더/플로팅 CTA 라벨 변경.

## 검증
- Part A: 토글 ON → `/ko·/en·/zh /quote`에 해당 언어 안내+CallbackForm, 빈 언어는 ko/기본문구 대체. 콜백 제출 → 관리자 견적 목록 노출. 토글 OFF → 정상 폼.
- Part B: 사유 없이 취소 차단 확인 → 취소 시 고객 언어 `quote_cancelled` 메일(사유 포함) **presentj94@gmail.com 테스트**. status '취소' 표시.
- `detect-script` 자체검증, `tsc`/`eslint`/`pnpm build` 통과.

## 건드릴 파일
- 마이그레이션(신규): `035_site_settings.sql`, `036_quotes_cancel.sql`, `037_email_template_quote_cancelled.sql`
- lib: `detect-script.ts`(+test), `queries.ts`(getSiteSettings + CACHE_TAGS.siteSettings), `status-colors.ts`(취소)
- 공개: `quote/page.tsx`(분기), `quote/quote-paused-notice.tsx`(신규, CallbackForm 재사용)
- 관리자: `settings/page.tsx`+`settings/actions.ts`+`_components/quote-intake-settings.tsx`, `quotes/[id]/page.tsx`+`quotes/[id]/cancel-quote.tsx`+`quotes/actions.ts`(cancelQuote)
- 메시지: `messages/{ko,en,zh}.json` (quote.paused.*)
