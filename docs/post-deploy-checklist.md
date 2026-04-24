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

## 3. `NEXT_PUBLIC_SITE_URL` 주입

- `NEXT_PUBLIC_SITE_URL` = `https://www.najin-tech.com`
- Production 환경에만 세팅. Preview는 Vercel이 자동으로 `VERCEL_PROJECT_PRODUCTION_URL`을 넣어주므로 생략 가능.

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
