import { Resend } from "resend";

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

// resend v6 생성자는 키가 없으면 throw 한다. 모듈 최상단에서 만들면
// RESEND_API_KEY 미설정 환경(프리뷰·키 로테이션 중)에서 이 모듈을 import 하는
// 견적/채용 서버 액션 모듈 평가 자체가 실패해 페이지가 통째로 500 이 된다.
// email-templates.ts 와 동일하게 lazy 로 만든다.
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

export async function sendQuoteNotification(data: {
  company_name: string;
  contact_name: string;
  phone: string;
  email?: string;
  processing_type: string;
  material?: string;
  quantity?: string;
  deadline?: string;
  description?: string;
}) {
  if (!NOTIFICATION_EMAIL) return;
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      // resend v6 는 camelCase `replyTo` 만 읽는다. snake_case 로 넘기면
      // 초과 속성이라 타입 체크도 안 걸리고 조용히 버려진다.
      ...(data.email ? { replyTo: data.email } : {}),
      subject: `[견적문의] ${data.company_name} - ${data.contact_name}`,
      text: `새로운 견적 문의가 접수되었습니다.

회사명: ${data.company_name}
담당자: ${data.contact_name}
연락처: ${data.phone}
이메일: ${data.email || "-"}
가공종류: ${data.processing_type}
소재: ${data.material || "-"}
수량: ${data.quantity || "-"}
희망납기: ${data.deadline || "-"}

상세내용:
${data.description || "-"}

---
나진테크 웹사이트 자동 알림`,
    });
  } catch (e) {
    console.error("Failed to send quote notification:", e);
  }
}

export async function sendApplicationNotification(data: {
  name: string;
  phone: string;
  email?: string;
  position: string;
  cover_letter?: string;
}) {
  if (!NOTIFICATION_EMAIL) return;
  const resend = getResend();
  if (!resend) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      ...(data.email ? { replyTo: data.email } : {}),
      subject: `[채용지원] ${data.name} - ${data.position}`,
      text: `새로운 채용 지원서가 접수되었습니다.

이름: ${data.name}
연락처: ${data.phone}
이메일: ${data.email || "-"}
지원포지션: ${data.position}

자기소개:
${data.cover_letter || "-"}

---
나진테크 웹사이트 자동 알림`,
    });
  } catch (e) {
    console.error("Failed to send application notification:", e);
  }
}
