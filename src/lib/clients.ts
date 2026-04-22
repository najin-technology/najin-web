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
};

export const CLIENTS: Client[] = [
  {
    slug: "hyundai",
    name: "현대자동차",
    nameEn: "Hyundai Motor",
    logo: "/images/logos/hyundai.svg", // Wikipedia Commons (Public Domain)
    category: "automotive",
  },
  {
    slug: "hyundai-powertech",
    name: "현대파워텍",
    nameEn: "Hyundai Powertech",
    logo: "/images/logos/hyundai-powertech.svg",
    category: "automotive",
  },
  {
    slug: "renault-samsung",
    name: "르노삼성",
    nameEn: "Renault Samsung",
    logo: "/images/logos/renault.svg",
    category: "automotive",
    registeredYear: 2014,
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
    slug: "hanwha-chemical",
    name: "한화케미칼",
    nameEn: "Hanwha Chemical",
    logo: "/images/logos/hanwha.svg",
    category: "industrial",
    registeredYear: 2003,
  },
  {
    slug: "donghee",
    name: "동희산업",
    nameEn: "Donghee Industrial",
    logo: "/images/logos/donghee.png", // donghee.co.kr 공식
    category: "automotive",
    registeredYear: 2014,
  },
  {
    slug: "hwashin",
    name: "화신",
    nameEn: "Hwashin",
    logo: "/images/logos/hwashin.png", // hwashin.co.kr 공식
    category: "automotive",
  },
  {
    slug: "sungwoo-hitech",
    name: "성우하이텍",
    nameEn: "Sungwoo Hitech",
    logo: "/images/logos/sungwoo.png", // swhitech.com 공식
    category: "automotive",
    registeredYear: 2010,
  },
  {
    slug: "gm-shanghai",
    name: "GM Shanghai",
    nameEn: "GM Shanghai",
    logo: "/images/logos/gm.png", // Wikipedia Commons (Public Domain)
    category: "overseas",
  },
  {
    slug: "lear-dymos",
    name: "Lear Dymos",
    nameEn: "Lear Dymos",
    logo: "/images/logos/lear.svg",
    category: "overseas",
  },
];

export function getClientBySlug(slug: string): Client | undefined {
  return CLIENTS.find((c) => c.slug === slug);
}
