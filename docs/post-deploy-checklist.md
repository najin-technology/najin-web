# 배포 후 체크리스트 — 보안 + SEO/GEO

이 PR이 머지되면 아래 외부 시스템 등록/환경변수 주입이 필요합니다.
순서대로 진행하는 걸 추천합니다.

---

## 1. Upstash Redis (rate limit 백엔드)

1. Vercel Dashboard → 프로젝트 → Storage 탭
2. "Create Database" → "Upstash for Redis"
3. 무료 tier 선택 (10k req/day)
4. 생성 완료 시 `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`이 **자동으로 Vercel env에 주입됨**
5. 주입 확인: Settings → Environment Variables에서 Production/Preview 두 환경에 존재 확인
6. 주입 안 되어 있으면 rate limit이 조용히 비활성화되며 서버 로그에 경고 남음 (`[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN missing`)

## 2. Cloudflare Turnstile (봇/어뷰즈 방어)

1. Cloudflare Dashboard → Turnstile
2. "Add site" → 도메인 `najin-tech.com`, `www.najin-tech.com`
3. Widget Mode: **Invisible** (사람에겐 대부분 챌린지 미노출)
4. Site Key + Secret Key 발급
5. Vercel → Settings → Environment Variables에 추가:
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = <site key>
   - `TURNSTILE_SECRET_KEY` = <secret key>
6. Production + Preview 두 환경 모두에 세팅
7. Dev 환경에서는 없어도 됨(dev는 검증 통과로 fallback)

## 3. `NEXT_PUBLIC_SITE_URL` 주입 ✅ (이미 설정됨)

- `NEXT_PUBLIC_SITE_URL` = `https://www.najin-tech.com` — Production 환경에 이미 주입 완료
- Preview/Development는 `env.ts` fallback 로직이 `VERCEL_PROJECT_PRODUCTION_URL` 또는 `https://www.najin-tech.com`을 사용
- 확인: `vercel env ls` → `NEXT_PUBLIC_SITE_URL | Encrypted | Production`

## 4. Google Search Console 등록

1. https://search.google.com/search-console
2. 속성 추가 → URL 접두사 → `https://www.najin-tech.com`
3. 인증 방법: "HTML 태그" 선택 → content 값 복사
4. Vercel env:
   - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` = <content 값>
5. 재배포 → Search Console에서 "인증" 클릭
6. 인증 완료 후 왼쪽 메뉴 → Sitemaps → `https://www.najin-tech.com/sitemap.xml` 제출

## 5. Naver 서치어드바이저 등록 (Naver Webmaster Tools)

1. https://searchadvisor.naver.com
2. 사이트 등록 → `https://www.najin-tech.com`
3. 소유확인 → "HTML 태그" → content 값 복사
4. Vercel env:
   - `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` = <content 값>
5. 재배포 → 서치어드바이저에서 "확인" 클릭
6. 인증 후 왼쪽 메뉴 → 요청 → 사이트맵 제출 → `sitemap.xml` 입력
7. RSS 있으면 추가 제출. 본 사이트는 없음.
8. 연관검색어 등록 신청: 서치어드바이저 → 도구 → "연관검색어 신청" (선택)

## 6. Naver 스마트플레이스 / Naver Places 등록 (지도 노출)

1. https://smartplace.naver.com → 업체 등록
2. 사업자 정보: 나진테크, 사업자등록번호, 주소(산막공단남14길 170, 양산시, 경상남도)
3. 전화번호, 영업시간(월-금 08:30-17:30), 홈페이지 URL(`https://www.najin-tech.com`), 이메일
4. 키워드: "나진테크", "우레탄 성형", "CNC 정밀가공", "금형 제작", "양산 제조업체"
5. 사진 업로드 (공장 외관, 작업장 내부, 대표 제품)
6. 심사 완료(수 영업일) → "나진테크" 검색 시 지도 결과 노출

## 7. Google Analytics 4

1. https://analytics.google.com → 관리 → 속성 생성
2. 속성 이름: "나진테크", 시간대: 대한민국, 통화: KRW
3. 데이터 스트림 → 웹 → `https://www.najin-tech.com`
4. 측정 ID (`G-XXXXXXXXXX`) 복사
5. Vercel env:
   - `NEXT_PUBLIC_GA4_MEASUREMENT_ID` = `G-XXXXXXXXXX`
6. 재배포 → GA4 Realtime 리포트에서 접속 확인

## 8. Naver Analytics

1. https://analytics.naver.com → 사이트 등록
2. 도메인: `www.najin-tech.com`
3. 사이트 ID 발급
4. Vercel env:
   - `NEXT_PUBLIC_NAVER_ANALYTICS_ID` = <사이트 ID>
5. 재배포 → Naver Analytics 실시간 방문자 확인

## 9. Kakao OAuth (admin 한국 로그인 옵션, 선택)

로그인 페이지에 **카카오로 로그인** 버튼이 추가되어 있음. 활성화하려면:

1. https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
2. 앱 이름: "나진테크 관리자" (또는 자유)
3. 플랫폼 → Web 플랫폼 등록 → 사이트 도메인: `https://www.najin-tech.com`
4. 제품 설정 → 카카오 로그인 → 활성화 ON
5. Redirect URI 등록:
   - `https://<your-supabase-project>.supabase.co/auth/v1/callback`
   - Supabase URL은 `NEXT_PUBLIC_SUPABASE_URL`에서 확인
6. 동의 항목 → 이메일(선택동의) 활성
7. 보안 → Client Secret 코드 생성 (활성 상태)
8. Supabase Dashboard → Authentication → Providers → Kakao → Enable
   - REST API Key (앱 키 탭) → Client ID 필드
   - Client Secret 코드 → Client Secret 필드
9. Save → 끝. 로그인 페이지 "카카오로 로그인" 버튼 동작

**주의**: Kakao는 signup 시 Supabase user에 `role: admin`이 자동 부여되지 않음. 첫 Kakao 로그인 후:
- `/admin/invites`에서 그 이메일로 초대 발송 → 수락
- 또는 Supabase SQL Editor에서 수동으로 `UPDATE auth.users SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"') WHERE email = '...'`

## 10. Naver SSO — Supabase 미지원 (참고)

**Naver 아이디로 로그인 API는 무료입니다** (https://developers.naver.com, 25,000 req/day quota).
하지만 Supabase는 Naver를 기본 제공자로 지원하지 **않습니다** (Google, Kakao, GitHub 등은 지원).

Naver SSO를 admin에 붙이려면 옵션:
- (A) **권장하지 않음**: 커스텀 Next.js API route로 직접 OAuth 2.0 플로우 구현 + Supabase admin API로 user 생성/링크. 개발 2-3시간, 유지보수 비용.
- (B) **권장**: Kakao OAuth 사용 (위 9번). Supabase 네이티브, 10분 세팅. Admin 로그인 수요가 높은 한국 시장에서 Kakao 사용률이 Naver와 비슷하거나 높음.
- (C) 그냥 Google + 이메일/비번 유지. 이미 동작 중.

현재 PR은 옵션 B를 반영(카카오 버튼 추가). Naver 커스텀 통합이 꼭 필요하면 별도 작업 티켓으로.

---

## 배포 후 검증 체크리스트

### SEO
- [ ] `curl https://www.najin-tech.com/sitemap.xml | grep najin-webapp` → 결과 0건
- [ ] `curl https://www.najin-tech.com/robots.txt` → Sitemap이 najin-tech.com 기반
- [ ] 브라우저 devtools → `<head>`에 `google-site-verification`, `naver-site-verification` meta 존재
- [ ] 브라우저 devtools → `application/ld+json` script 2개(Organization, LocalBusiness) 존재
- [ ] `/ko/business` 페이지 JSON-LD에 Service 5개(@graph) 존재
- [ ] Google `site:najin-tech.com` 검색 → 정상 노출 (수 일 소요)
- [ ] Naver `site:najin-tech.com` 검색 → 정상 노출 (수 일 소요)
- [ ] `"나진테크"` 검색 → 홈이 상위 노출 (수 주 소요, SEO 기반 요소 포함)

### 보안
- [ ] 관리자 로그인에 Turnstile 위젯 렌더링 (봇이 아니면 대부분 invisible)
- [ ] 잘못된 비번 6번 연속 → 6번째부터 "시도가 너무 잦습니다" 메시지
- [ ] `/quote` 폼 제출 4번 연속 → 4번째부터 "제출이 너무 잦습니다" 메시지
- [ ] admin 로그인 후 31분 대기 → 다음 admin 요청 시 `?reason=idle`로 리다이렉트되고 안내 메시지 표시
- [ ] Cloudflare Turnstile 대시보드에 challenge 시도 로그 누적
- [ ] Vercel 로그 → `[ratelimit]` 경고 없음 (Upstash 정상 연결)

### Analytics
- [ ] `/admin/analytics` 접근 → 4개 KPI 카드 숫자 표시
- [ ] 외부 대시보드 카드 3개 모두 새 탭으로 열림
- [ ] GA4 Realtime에 접속 기록
- [ ] Naver Analytics Realtime에 접속 기록
- [ ] Vercel Analytics에 페이지뷰 기록

---

## 일정 감각

- Search Console / 서치어드바이저 소유확인 → 당일
- 사이트맵 제출 → 당일
- Google 인덱싱 → 2-7일
- Naver 인덱싱 → 3-14일
- 연관검색어 등록 심사 → 2-4주
- 스마트플레이스 심사 → 3-7영업일
- "나진테크" 브랜드 검색 상위 노출 → 4-8주 (콘텐츠 업데이트와 피드백 루프 필요)
