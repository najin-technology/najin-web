import { SITE_URL } from "@/lib/env";

// 예전 app/layout.tsx 의 <body> 최상단에 인라인돼 있던 사이트 전역 JSON-LD.
// 루트 레이아웃이 공개/관리자 둘로 갈라지면서 공개 쪽에서만 쓰도록 분리했다.
// (관리자 페이지는 noindex 라 구조화 데이터가 필요 없다.)
const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "나진테크 | NAJIN TECHNOLOGY",
  alternateName: ["나진테크", "NAJIN TECHNOLOGY", "纳进科技"],
  url: SITE_URL,
  inLanguage: ["ko-KR", "en-US", "zh-CN"],
  publisher: {
    "@type": "Organization",
    name: "나진테크",
    url: SITE_URL,
  },
};

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "나진테크",
  alternateName: "NAJIN TECHNOLOGY",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo/najin-logo.png`,
  foundingDate: "2002-12",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+82-55-367-2596",
    contactType: "customer service",
    areaServed: "KR",
    availableLanguage: ["Korean", "English", "Chinese"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "산막공단남14길 170",
    addressLocality: "양산시",
    addressRegion: "경상남도",
    addressCountry: "KR",
  },
  knowsAbout: [
    "Urethane Molding",
    "CNC Precision Machining",
    "Synthetic Resin Processing",
    "Mold Fabrication",
    "EV Parts Manufacturing",
  ],
  award: [
    "ISO 9001 Quality Management Certification",
    "CLEAN Workplace Certification",
    "Urethane Mold Base Patent",
  ],
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    minValue: 20,
    maxValue: 50,
  },
  naics: "326199",
};

const LOCAL_BUSINESS = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "나진테크",
  url: SITE_URL,
  image: `${SITE_URL}/images/factory/workshop-1.jpg`,
  telephone: "+82-55-367-2596",
  faxNumber: "+82-55-367-2597",
  email: "kinghak1@naver.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "산막공단남14길 170",
    addressLocality: "양산시",
    addressRegion: "경상남도",
    addressCountry: "KR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 35.335,
    longitude: 129.0265,
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:30",
    closes: "17:30",
  },
};

export function SiteJsonLd() {
  return (
    <>
      {[WEBSITE, ORGANIZATION, LOCAL_BUSINESS].map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
