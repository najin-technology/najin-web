import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/page-header";
import { Breadcrumb } from "@/components/breadcrumb";

import { createPageMetadata } from "@/lib/metadata";

// 거의 변경 없는 정적 정책 페이지 → 1일 캐시.
export const revalidate = 86400;
export const dynamic = "force-static";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return createPageMetadata({
    locale,
    path: "/privacy",
    titles: { ko: "개인정보처리방침", en: "Privacy Policy", zh: "隐私政策" },
    descriptions: {
      ko: "나진테크 개인정보처리방침. 견적·채용·문의 시 수집되는 개인정보의 항목, 이용 목적, 보유 기간, 제3자 제공, 처리 위탁, 파기 절차 등 모든 개인정보 처리 사항을 투명하게 안내합니다.",
      en: "NAJIN TECHNOLOGY privacy policy. Transparent guide to personal data collected via quote, recruitment, and inquiry forms — categories, purposes, retention period, third-party sharing, processing delegation, and disposal procedures.",
      zh: "纳进科技隐私政策。透明告知报价、招聘、咨询表单收集的个人信息项目、使用目的、保留期限、第三方共享、处理委托及销毁程序等所有处理事项。",
    },
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <>
      <PageHeader titleKey="pageTitle" namespace="privacy" bgImage="/images/factory/workshop-1.jpg" />
      <Breadcrumb items={[{ label: t("pageTitle") }]} />

      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-gray max-w-none text-sm leading-relaxed text-brand-charcoal space-y-6">
            {locale === "ko" ? <PrivacyKo /> : locale === "zh" ? <PrivacyZh /> : <PrivacyEn />}
          </div>
        </div>
      </section>
    </>
  );
}

function PrivacyKo() {
  return (
    <>
      <p>
        나진테크(이하 &quot;회사&quot;)는 「개인정보 보호법」에 따라 정보주체의
        개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수
        있도록 다음과 같이 개인정보 처리방침을 수립·공개합니다.
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        제1조 (개인정보의 처리 목적)
      </h2>
      <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          견적 문의 접수 및 처리: 회사명, 담당자명, 연락처, 이메일, 가공 관련
          정보
        </li>
        <li>채용 지원 접수 및 처리: 성명, 연락처, 이메일, 이력서, 자기소개</li>
        <li>
          관리자 로그인(네이버 아이디로 로그인): 네이버 계정 이메일, 네이버 회원
          고유 식별자 — 관리자 인증 및 로그인 목적
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        제2조 (개인정보의 처리 및 보유기간)
      </h2>
      <p>회사는 법령에 따른 보유기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 기간 내에서 개인정보를 처리·보유합니다.</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>견적 문의 관련 정보: 문의 처리 완료 후 3년</li>
        <li>채용 지원 관련 정보: 채용 절차 완료 후 1년</li>
        <li>관리자 로그인 관련 정보: 관리자 권한 해제 또는 회원 탈퇴 시까지</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        제3조 (개인정보의 제3자 제공)
      </h2>
      <p>
        회사는 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 단,
        법률에 특별한 규정이 있는 경우에는 예외로 합니다.
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        제4조 (정보주체의 권리·의무)
      </h2>
      <p>정보주체는 회사에 대해 다음과 같은 권리를 행사할 수 있습니다.</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>개인정보 열람 요구</li>
        <li>오류 등이 있을 경우 정정 요구</li>
        <li>삭제 요구</li>
        <li>처리정지 요구</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        제5조 (개인정보의 안전성 확보 조치)
      </h2>
      <p>
        회사는 개인정보의 안전성 확보를 위해 관리적·기술적·물리적 조치를
        시행하고 있습니다.
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        제6조 (개인정보 보호 책임자)
      </h2>
      <ul className="list-none space-y-1">
        <li>회사명: 나진테크</li>
        <li>연락처: 055-367-2596</li>
        <li>주소: 경상남도 양산시 산막공단남14길 170 (북정동)</li>
      </ul>

      <p className="mt-8 text-[13px] text-brand-charcoal/70 font-medium">
        본 방침은 2024년 1월 1일부터 시행됩니다.
      </p>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <p>
        NAJIN TECHNOLOGY (hereinafter &quot;Company&quot;) establishes and discloses
        this Privacy Policy in accordance with the Personal Information
        Protection Act to protect the personal information of data subjects.
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        Article 1 (Purpose of Processing Personal Information)
      </h2>
      <p>
        The Company processes personal information for the following purposes:
      </p>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          Quote inquiries: Company name, contact person, phone, email,
          processing-related information
        </li>
        <li>
          Job applications: Name, phone, email, resume, cover letter
        </li>
        <li>
          Admin login (Login with Naver): Naver account email, Naver unique
          identifier — for administrator authentication and login
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        Article 2 (Retention Period)
      </h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Quote inquiry information: 3 years after inquiry completion</li>
        <li>Job application information: 1 year after recruitment process completion</li>
        <li>Admin login information: until administrator access is revoked or the account is deleted</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        Article 3 (Provision to Third Parties)
      </h2>
      <p>
        The Company does not provide personal information to third parties
        without the consent of the data subject, except as required by law.
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        Article 4 (Rights of Data Subjects)
      </h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Right to access personal information</li>
        <li>Right to request correction</li>
        <li>Right to request deletion</li>
        <li>Right to request suspension of processing</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        Article 5 (Security Measures)
      </h2>
      <p>
        The Company implements administrative, technical, and physical
        measures to ensure the security of personal information.
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        Article 6 (Data Protection Officer)
      </h2>
      <ul className="list-none space-y-1">
        <li>Company: NAJIN TECHNOLOGY</li>
        <li>Phone: 055-367-2596</li>
        <li>Address: 170, Sanmakgongdannam 14-gil, Yangsan-si, Gyeongsangnam-do, Korea</li>
      </ul>

      <p className="mt-8 text-[13px] text-brand-charcoal/70 font-medium">
        Effective date: January 1, 2024
      </p>
    </>
  );
}

function PrivacyZh() {
  return (
    <>
      <p>
        纳进科技（以下简称&quot;公司&quot;）根据《个人信息保护法》制定并公开本隐私政策，以保护信息主体的个人信息。
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        第一条（个人信息的处理目的）
      </h2>
      <p>公司为以下目的处理个人信息：</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>报价咨询受理及处理：公司名称、负责人姓名、联系方式、邮箱、加工相关信息</li>
        <li>招聘申请受理及处理：姓名、联系方式、邮箱、简历、自我介绍</li>
        <li>管理员登录（Naver 账号登录）：Naver 账号邮箱、Naver 会员唯一标识 — 用于管理员身份验证及登录</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        第二条（个人信息的保留期限）
      </h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>报价咨询相关信息：咨询处理完成后3年</li>
        <li>招聘申请相关信息：招聘流程完成后1年</li>
        <li>管理员登录相关信息：直至管理员权限被解除或账号注销为止</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        第三条（向第三方提供个人信息）
      </h2>
      <p>
        未经信息主体同意，公司不会向第三方提供个人信息。但法律有特别规定的情况除外。
      </p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        第四条（信息主体的权利）
      </h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>要求查阅个人信息</li>
        <li>要求更正错误</li>
        <li>要求删除</li>
        <li>要求停止处理</li>
      </ul>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        第五条（安全保障措施）
      </h2>
      <p>公司实施管理、技术及物理措施以确保个人信息安全。</p>

      <h2 className="text-lg font-semibold text-brand-navy mt-8">
        第六条（个人信息保护负责人）
      </h2>
      <ul className="list-none space-y-1">
        <li>公司名称：纳进科技</li>
        <li>联系电话：055-367-2596</li>
        <li>地址：韩国庆尚南道梁山市山幕工团南14街170号</li>
      </ul>

      <p className="mt-8 text-[13px] text-brand-charcoal/70 font-medium">
        生效日期：2024年1月1日
      </p>
    </>
  );
}
