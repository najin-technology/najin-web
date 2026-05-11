import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

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

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      ...(data.email ? { reply_to: data.email } : {}),
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

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      ...(data.email ? { reply_to: data.email } : {}),
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
