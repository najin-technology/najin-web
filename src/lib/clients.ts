// 거래처 메타데이터는 customers 테이블에서 관리한다.
// 이 파일은 타입과 generateStaticParams 용 fallback slug 리스트만 보유한다.
//
// 데이터 조회: src/lib/queries.ts 의 getClientGrid / getClientGridRowBySlug 사용.
// 편집: admin /admin/customers/[id] 의 "거래처 표시 설정" 섹션.

export type Client = {
  slug: string;
  name: string;
  nameEn: string | null;
  logo: string;
  category: string | null;
  registeredYear?: number | null;
  needsDarkBg?: boolean;
};

/**
 * Fallback slug 리스트.
 * generateStaticParams 등에서 DB 접근 실패 시 사용. 평소엔 DB 가 source of truth.
 * 거래처 실명 노출 방지를 위해 의도적으로 비어있음 — 빌드 시 DB 조회가 실패하면
 * /clients/[slug] 는 dynamic 라우트로 폴백되어 런타임에 DB 조회 후 렌더된다.
 */
export const FALLBACK_CLIENT_SLUGS: string[] = [];
