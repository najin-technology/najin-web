# 메일 HTML 템플릿 + 견적서 첨부 — 설계 스펙

작성일: 2026-06-18
브랜치: `admin-mail-i18n-resend-check`

## 배경 / 문제

관리자 대시보드의 고객 자동발송 메일(견적 접수·상태변경 회신)은 현재 **평문(`text:`)** 으로만 나간다. 직전 작업에서 ko/en/zh 다국어 본문은 채웠고 언어별 발송은 검증됐으나, 사용자 피드백은 두 가지다.

1. **외형이 빈약하고 비전문적이다.** 평문이라 브랜딩·구조가 없다.
2. **진행상황 링크가 제대로 동작하지 않는다.** 평문 본문에 `진행 상황: {{status_url}}` 형태로 URL이 들어가, 메일 클라이언트의 자동 링크화/줄바꿈 때문에 클릭 시 도메인 루트(홈페이지)로만 가는 경우가 있다.

추가로, **관리자가 견적서 파일을 수동 업로드해 '견적발송' 메일에 첨부**하고 싶다는 요구가 나왔다(현재 견적서 PDF 생성·첨부 기능은 전무).

## 목표

- 고객용 4개 템플릿을 **공용 HTML 레이아웃**으로 감싸 전문적인 외형으로 발송한다.
- 진행상황 링크를 **명시적 CTA 버튼**(`<a href>`)으로 바꿔 링크 깨짐을 해소한다.
- 관리자가 견적 상세에서 견적서 파일을 업로드하고, **상태를 '견적발송'으로 바꾸면 그 파일이 메일에 자동 첨부**되게 한다.
- 코드는 최소로. 관리자 템플릿 편집 UX(평문 편집)는 유지한다.

## 현재 상태 (확인됨)

- 발송: `resend` v6.9.4. 모든 메일이 `text:` 단독. HTML/`@react-email` 인프라 없음.
- 발송 함수: `sendByTemplateKey`(`src/lib/email-templates.ts`) — DB `email_templates`에서 `subject_${locale} || subject_ko`, `body_${locale} || body_ko` 선택 후 `renderTemplate`로 `{{var}}` 치환.
- 테스트 발송: `sendTestEmail`(`src/app/admin/(authenticated)/email-templates/actions.ts`) — `{key,to,locale}`, `SAMPLE_VARS`, 시간당 10건 제한.
- 상태변경 발송: `notifyStatusChange`(`src/app/admin/(authenticated)/quotes/actions.ts`) — 상태→템플릿키 매핑, `quotes.locale`로 언어 결정. 단일/일괄(`updateQuoteStatus`/`bulkUpdateQuoteStatus`) 모두 경유.
- 상태 4종: 접수(메일 없음) → 검토중(`quote_status_reviewing`) → 견적발송(`quote_status_sent`) → 완료(`quote_status_completed`).
- 첨부 인프라: `attachments` 테이블(`parent_table CHECK IN ('quotes','applications', ...)`, `parent_id`, `file_url`, `file_name`, `file_size`, `mime_type`, `created_at`) — **`kind` 칼럼 없음**. 고객 견적폼 첨부가 `parent_table='quotes'`로 저장됨. 업로드 UI는 `MultiFileUploader`(`@/components/admin/multi-file-uploader`) + work-orders 액션 패턴이 선례.
- 견적 상세(`quotes/[id]/page.tsx`)는 이미 `getQuoteAttachmentUrls`로 고객 첨부를 표시.
- 상태 변수: `{{contact_name}} {{company_name}} {{quote_id_short}} {{status_url}} {{processing_type}}`.

## 접근

### A. 공용 HTML 레이아웃 — `src/lib/email-layout.ts` (신규)

`renderEmailHtml({ bodyText, locale, statusUrl }): string` — 테이블 기반 마크업 + 인라인 CSS(메일 클라이언트 호환).

- **헤더**: `NAJIN TECHNOLOGY` 텍스트 워드마크 + 브랜드 컬러 바. (로고 이미지는 미사용 — 클라이언트 이미지 차단 회피. 추후 호스팅 로고로 교체 가능.)
- **본문**: `bodyText`를 HTML escape → 줄바꿈을 문단(`<p>`)/`<br>`로 변환.
- **CTA 버튼**: `statusUrl`이 있을 때만 `<a href="{statusUrl}">{라벨}</a>` 버튼. 라벨은 언어별 — ko `진행 상황 확인` / en `Track your request` / zh `查询进度`. (`LOCALE_CTA_LABELS` 맵으로 코드에 보관.)
- **푸터**: 회사명, 사이트 링크(`NEXT_PUBLIC_SITE_URL`), 소액 안내.
- 동반 평문 폴백 생성: `bodyText` + `"\n\n{라벨}: {statusUrl}"`.

자체검증: `email-layout`에 assert 기반 self-check 1개(escape 적용, 줄바꿈 변환, statusUrl 유무에 따른 CTA 분기, 언어별 라벨).

### B. 발송 변경

- `sendByTemplateKey`: 기존 선택·치환 후 `renderEmailHtml`로 HTML 생성. `resend.emails.send`에 **`html` + `text` 동시** 전달(text=폴백). 시그니처에 선택적 `attachments?: { filename: string; content: string }[]` 추가, 있으면 그대로 Resend `attachments`에 전달.
- `sendTestEmail`: 동일하게 HTML 렌더(테스트=실발송 외형 일치). 첨부는 테스트 대상 아님.
- **DB 본문 정리**: 모든 `body_*`(ko/en/zh × 4 = 12개)에서 `진행 상황/Track/进度查询 … {{status_url}}` 줄 제거(레이아웃이 CTA 담당 → 중복 방지). `{{quote_id_short}}` 등 나머지 본문은 유지. → 마이그레이션 1개로 12개 body UPDATE.

### C. 견적서 첨부

- **스키마**: 마이그레이션 — `ALTER TABLE attachments ADD COLUMN kind TEXT NOT NULL DEFAULT 'customer';`. 관리자 견적서 업로드 = `kind='quotation'`. 기존/고객 도면 = `'customer'`.
- **UI**: `quotes/[id]/page.tsx`에 "견적서 첨부(발송용)" 섹션 추가 — `MultiFileUploader` 재사용한 클라이언트 컴포넌트(work-orders `AttachmentsSection` 패턴 복제, 최소화). 업로드/삭제 = 신규 server action `addQuoteQuotationFile(quoteId, fd)` / `removeQuoteQuotationFile(attachmentId, quoteId)` (work-orders 액션 복제: 스토리지 업로드 + `attachments` insert with `kind='quotation'`). 스토리지 버킷은 기존 `quote-attachments` 재사용.
- **고객 첨부 getter 분리**: `getQuoteAttachmentUrls`는 `kind <> 'quotation'`(고객 도면)만, 견적서용 신규 getter는 `kind='quotation'`만 반환.
- **발송 연동**: `notifyStatusChange`에서 `templateKey === 'quote_status_sent'`이면 해당 견적의 `kind='quotation'` 파일을 service-role로 다운로드 → base64 → `sendByTemplateKey({..., attachments})`로 전달. 단일·일괄 경로 공통(이미 `notifyStatusChange` 단일 통로).

## 엣지 케이스

- **견적발송인데 첨부 없음**: 첨부 없이 발송(현행 동작 유지), 관리자에게 안내 토스트("첨부파일 없이 발송됨").
- **첨부 용량**: Resend 메시지 총 ~40MB 한도. 합계 초과 시 첨부 스킵 + 경고 로그(견적폼의 파일당 10MB 제한 정책 재사용).
- **일괄 발송**: 각 견적은 자기 `kind='quotation'` 파일만 첨부.
- **HTML escape**: 본문/변수의 `< > &` 등은 escape하여 마크업 깨짐·인젝션 방지.

## 테스트 (presentj94@gmail.com)

1. 테스트 발송으로 ko/en/zh HTML 외형 확인 — 헤더/푸터/문단, **CTA 버튼 클릭 시 status URL로 정확히 이동**.
2. 테스트 견적에 샘플 PDF 업로드 → 상태 '견적발송' 전환 → 메일에 첨부 포함 수신 확인.
3. 첨부 없는 견적을 '견적발송'으로 → 첨부 없이 정상 발송 + 안내 토스트.
4. `email-layout` 자체검증 통과.

## 범위 밖 (YAGNI)

- 견적서 PDF 자동생성(수동 업로드로 결정).
- 로고 이미지 헤더(텍스트 워드마크로 시작).
- 내부 관리자 알림메일(`sendQuoteNotification`/`sendApplicationNotification`/헬스체크) HTML화 — 내부용이라 평문 유지.
- 콜백 폼 메일.

## 건드릴 파일

- 신규: `src/lib/email-layout.ts`, 견적서 첨부 섹션 클라이언트 컴포넌트(`quotes/[id]/` 내), 마이그레이션 2개(`attachments.kind`, 본문 정리).
- 수정: `src/lib/email-templates.ts`, `src/app/admin/(authenticated)/email-templates/actions.ts`, `src/app/admin/(authenticated)/quotes/actions.ts`, `src/app/admin/(authenticated)/quotes/[id]/page.tsx`.
- 참조(복제 패턴): `src/app/admin/(authenticated)/work-orders/actions.ts`, `.../work-orders/[id]/attachments-section.tsx`, `@/components/admin/multi-file-uploader`.
