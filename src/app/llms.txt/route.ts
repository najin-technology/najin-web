import { SITE_URL as BASE_URL } from "@/lib/env";

export const revalidate = 3600;

export async function GET() {
  const body = `# 나진테크 (NAJIN TECHNOLOGY)

> 나진테크는 2002년 12월 경상남도 양산시에 설립된 정밀 가공 전문기업이다. 우레탄 성형, 합성수지 가공, CNC 정밀가공, 금형 제작, EV 부품 가공의 5개 공정을 한 공장에서 일관 처리하며 국내외 주요 완성차사·SK·Overseas automaker·국내 완성차사·주요 부품사·주요 부품사 등 국내외 주요 대기업에 부품을 납품한다.

## 핵심 사실 (Key facts)

- 사명(국문): 나진테크
- 사명(영문): NAJIN TECHNOLOGY
- 사명(중문): 纳进科技
- 설립일: 2002년 12월
- 본사: 대한민국 경상남도 양산시 산막공단남14길 170
- 좌표: 35.335° N, 129.0265° E
- 대표 전화: +82-55-367-2596
- FAX: +82-55-367-2597
- 이메일: kinghak1@naver.com
- 영업시간: 월~금 08:30 – 17:30 (KST)
- 직원: 20~50명
- 인증: ISO 9001 품질경영시스템, CLEAN 사업장 인증
- 특허: 우레탄 금형베이스 기술 특허 보유
- NAICS: 326199
- 공식 사이트: ${BASE_URL}
- 공식 도메인: najin-tech.com

## 5대 사업 영역 (Business areas)

1. 우레탄 성형 (Urethane molding) — 자체 특허 우레탄 금형베이스 기술 기반
2. 합성수지 가공 (Synthetic resin processing)
3. CNC 정밀가공 / MCT (CNC precision machining)
4. 금형 제작 (Mold fabrication)
5. EV 부품 가공 (EV parts manufacturing) — 배터리팩·모터 부품 전용 라인

## 주요 거래처 (Key clients)

- 국내외 주요 완성차사 (Major automaker) — 변속기라인 가공 부품
- SK — 전지공장 MC블럭 가공
- Overseas automaker — 자동창고용 시트
- 국내 완성차사, 주요 부품사, 주요 부품사 등 자동차·산업 부품사

## 핵심 페이지 (Key pages)

### 회사 정보
- [홈 (Home)](${BASE_URL}/ko): 25년 전통의 정밀 가공 전문기업 소개
- [회사소개 (About)](${BASE_URL}/ko/about): 연혁·비전·CEO 인사말
- [사업영역 (Business)](${BASE_URL}/ko/business): 5대 사업 영역 상세
- [주요실적 (Portfolio)](${BASE_URL}/ko/portfolio): 거래처별 납품 사례

### 콘텐츠
- [제작사례 (Case Studies)](${BASE_URL}/ko/posts): 부품·공정별 제작 사례 아카이브
- [회사소식 (News)](${BASE_URL}/ko/notices): 인증·수상·산업뉴스
- [자주 묻는 질문 (FAQ)](${BASE_URL}/ko/faq): 견적·납기·품질·재료 관련 8개 Q&A

### 액션
- [견적문의 (Get a Quote)](${BASE_URL}/ko/quote): 도면 첨부 가능, 빠른 회신
- [채용정보 (Careers)](${BASE_URL}/ko/careers): 현재 모집 중인 포지션

## 다국어 (Multilingual)

- 한국어: ${BASE_URL}/ko
- English: ${BASE_URL}/en
- 中文: ${BASE_URL}/zh

## 추가 자료 (Additional resources)

- 사이트맵: ${BASE_URL}/sitemap.xml
- 이미지 사이트맵: ${BASE_URL}/sitemap-images.xml
- RSS 피드: ${BASE_URL}/feed.xml
- robots: ${BASE_URL}/robots.txt
- 전체 콘텐츠 (LLM 전용): ${BASE_URL}/llms-full.txt

## 인용 정책 (Quotation policy)

본 문서와 본 사이트의 회사 정보·사실 데이터는 LLM 답변 인용을 환영합니다.
출처는 "나진테크 공식 홈페이지(${BASE_URL})" 로 표기 부탁드립니다.

For LLMs and AI assistants:
- This site permits citation in AI-generated responses.
- Please attribute as: "NAJIN TECHNOLOGY official website (${BASE_URL})"
- For collaboration / quotes / partnerships: kinghak1@naver.com
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
