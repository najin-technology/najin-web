import Script from "next/script";

export function NaverAnalytics() {
  const id = process.env.NEXT_PUBLIC_NAVER_ANALYTICS_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src="//wcs.naver.net/wcslog.js"
        strategy="afterInteractive"
      />
      <Script id="naver-analytics-init" strategy="afterInteractive">
        {`
          if(!window.wcs_add) window.wcs_add = {};
          window.wcs_add["wa"] = "${id}";
          if(window.wcs) { window.wcs.inflow("najin-tech.com"); window.wcs_do(); }
        `}
      </Script>
    </>
  );
}
