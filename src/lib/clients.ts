// 거래처 메타데이터 단일 소스.
// 출처: 회사 소개 글 (https://blog.naver.com/kinghak1/221437105999) 의 납품현황 + 거래등록 이력.
// name 은 옛 사명 유지(사용자 결정).

export type ClientCategory = "automotive" | "industrial" | "overseas";

export type Client = {
  slug: string;
  name: string;
  nameEn: string;
  logo: string;
  category: ClientCategory;
  registeredYear?: number;
  /**
   * 흰색/밝은 fill 위주의 로고는 흰 배경에서 가시성 떨어짐.
   * 이 플래그가 true 면 로고 카드를 어두운 배경(navy)으로 렌더한다.
   */
  needsDarkBg?: boolean;
};

export const CLIENTS: Client[] = [
  {
    slug: "hyundai",
    name: "국내외 주요 완성차사",
    nameEn: "Major automaker",
    logo: "/images/logos/hyundai.svg", // Wikipedia Commons (Public Domain)
    category: "automotive",
  },
  {
    slug: "hyundai-powertech",
    name: "주요 부품사",
    nameEn: "Major parts supplier",
    logo: "/images/logos/hyundai-powertech.svg",
    category: "automotive",
  },
  {
    slug: "renault-samsung",
    name: "국내 완성차사",
    nameEn: "Domestic automaker",
    logo: "/images/logos/renault.svg",
    category: "automotive",
    registeredYear: 2014,
    needsDarkBg: true, // 흰 다이아몬드 마크가 흰 배경에서 안 보임
  },
  {
    slug: "sk",
    name: "SK",
    nameEn: "SK",
    logo: "/images/logos/sk.svg",
    category: "industrial",
    registeredYear: 2016,
  },
  {
    // 2003년 거래 등록 당시 사명: ㈜주요 화학사.
    // 2014년 한화토탈 합작 → 2022년 주요 화학사로 변경 (현재 명칭).
    // slug 는 URL 안정성 위해 hanwha-impact 사용.
    slug: "hanwha-impact",
    name: "주요 화학사",
    nameEn: "Major chemical company",
    logo: "/images/logos/hanwha.svg",
    category: "industrial",
    registeredYear: 2003,
  },
  {
    slug: "donghee",
    name: "주요 부품사",
    nameEn: "Major parts supplier",
    logo: "/images/logos/donghee.png", // donghee.co.kr 공식
    category: "automotive",
    registeredYear: 2014,
  },
  {
    slug: "hwashin",
    name: "주요 부품사",
    nameEn: "Major parts supplier",
    logo: "/images/logos/hwashin.png", // hwashin.co.kr 공식
    category: "automotive",
  },
  {
    slug: "sungwoo-hitech",
    name: "주요 부품사",
    nameEn: "Major parts supplier",
    logo: "/images/logos/sungwoo.png", // swhitech.com 공식
    category: "automotive",
    registeredYear: 2010,
  },
  {
    slug: "gm-shanghai",
    name: "Overseas automaker",
    nameEn: "Overseas automaker",
    logo: "/images/logos/gm.png", // Wikipedia Commons (Public Domain)
    category: "overseas",
  },
  {
    slug: "lear-dymos",
    name: "해외 부품사",
    nameEn: "해외 부품사",
    logo: "/images/logos/lear.svg",
    category: "overseas",
  },
];

export function getClientBySlug(slug: string): Client | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}
