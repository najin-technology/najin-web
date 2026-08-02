import { Geist, Noto_Sans_KR, Noto_Sans_SC } from "next/font/google";

// 루트 레이아웃이 공개 사이트용([locale])과 관리자용(admin) 둘로 갈라지면서
// 양쪽이 같은 폰트 변수를 써야 해서 분리했다. next/font 는 모듈 스코프에서
// 한 번만 호출되면 되고, import 하는 쪽이 여럿이어도 중복 로드되지 않는다.
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  weight: ["400", "500", "700"],
  preload: true,
});

export const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  preload: false,
});

export const fontVariables = `${geistSans.variable} ${notoSansKR.variable} ${notoSansSC.variable}`;
