# SEO / GEO 운영 가이드

신규 도메인(`najin-tech.com`, <1년)을 빠르게 검색 결과 1페이지에 진입시키기 위한 운영 가이드 모음. 코드 작업분과 별개로, **사용자(운영자)가 직접 수행해야 하는 외부 작업**을 정리.

## 문서 목록

1. [naver-blog-migration.md](./naver-blog-migration.md) — 옛 네이버 블로그 → 공식 사이트 권위 전이 (가장 즉시 효과 큼)
2. [backlink-checklist.md](./backlink-checklist.md) — 산업 디렉터리·로컬·위키데이터 등록 체크리스트
3. [content-calendar.md](./content-calendar.md) — 월 4건 콘텐츠 발행 캘린더 + longtail 키워드 사전
4. [naver-sa-sop.md](./naver-sa-sop.md) — Naver Search Advisor 매주 운영 SOP

## 우선순위

```
Week 1  → 1. 옛 블로그 사이드바·프로필 정비 (사용자: 30분)
        → 2. 네이버 플레이스, GBP, 카카오맵 등록 (사용자: 1시간)
        → 3. Naver SA 매주 SOP 시작 (매주 5분)
Week 2~4 → 4. 옛 블로그 트래픽 상위 글에 공식 사이트 안내 박스 추가 (주 5~10개)
         → 5. 양산상공회의소·자동차산업협회 등 P1 디렉터리 등록
Month 2  → 6. 콘텐츠 캘린더 시작 (월 4건 발행)
         → 7. 잡코리아·사람인 회사 페이지
Month 3+ → 8. 위키데이터 등록 (영문 entity)
         → 9. 보도자료 발행 (인증·수상·신규 거래처 이벤트 발생 시)
```

## 효과 측정 KPI (월 1회)

| KPI | 도구 | 3개월 목표 | 6개월 목표 | 12개월 목표 |
|---|---|---|---|---|
| GSC 노출수 (월) | Google Search Console | 1,000+ | 5,000+ | 20,000+ |
| GSC 클릭수 (월) | Google Search Console | 50+ | 250+ | 1,000+ |
| Naver SA 색인률 | Naver Search Advisor | 80%+ | 90%+ | 95%+ |
| 외부 백링크 도메인 수 | Ahrefs / Moz / GSC | 30+ | 100+ | 200+ |
| "나진테크" 검색 순위 | 직접 검색 | 5위~10위 | 1~3위 | 1위 안정 |

## 코드 작업분 (이 문서 범위 외)

기술적 SEO 코드 작업분은 별도로 진행 중 — `admin-simplify` 브랜치에 누적 (PR #68).

주요 변경:
- `src/app/sitemap.ts`, `sitemap-images.xml`, `feed.xml`, `robots.ts` (이미 구현)
- `src/app/llms.txt`, `llms-full.txt` — GEO/AI 친화 문서
- `src/app/{apple-icon, twitter-image, manifest}` — PWA·SNS 메타
- `src/app/layout.tsx` — Organization/LocalBusiness/WebSite JSON-LD
- `src/lib/schema/*` — BreadcrumbList, JobPosting 스키마 헬퍼
- `src/lib/metadata.ts` — x-default hreflang
- 페이지별 BreadcrumbList JSON-LD 확장 (about/business/portfolio/careers/clients)
