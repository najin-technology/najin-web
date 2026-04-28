import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { AcceptInviteClient } from "./client";
import { ShieldAlert, Clock, X } from "lucide-react";

export const metadata = { title: "관리자 초대", robots: "noindex, nofollow" };

async function loadInvite(token: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("admin_invites")
    .select("id, token, email_hint, invited_by_email, expires_at, used_at, revoked_at, notes")
    .eq("token", token)
    .maybeSingle();
  return data;
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Token is UUID; validate format cheaply to avoid unnecessary DB hits
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(token)) notFound();

  const invite = await loadInvite(token);

  // Determine invite state
  let state: "valid" | "expired" | "used" | "revoked" | "notfound" = "valid";
  if (!invite) state = "notfound";
  else if (invite.used_at) state = "used";
  else if (invite.revoked_at) state = "revoked";
  else if (new Date(invite.expires_at) <= new Date()) state = "expired";

  // Already-authenticated user check
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xl shadow-gray-200/60">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy-dark flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-brand-navy">나진테크 관리자 초대</h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">
              수락하면 관리자 권한이 부여됩니다
            </p>
          </div>

          {state === "valid" && invite && (
            <AcceptInviteClient
              token={invite.token}
              emailHint={invite.email_hint}
              invitedByEmail={invite.invited_by_email}
              expiresAt={invite.expires_at}
              isAlreadyAuthenticated={!!currentUser}
              currentUserEmail={currentUser?.email || null}
            />
          )}

          {state === "expired" && (
            <InvalidState
              icon={Clock}
              color="amber"
              title="만료된 초대"
              description="이 초대 링크는 유효 기간이 지났습니다. 초대자에게 새 링크를 요청하세요."
              meta={invite ? { 초대자: invite.invited_by_email } : undefined}
            />
          )}
          {state === "used" && (
            <InvalidState
              icon={X}
              color="gray"
              title="이미 사용된 초대"
              description="이 초대 링크는 이미 사용되었습니다. 초대자에게 새 링크를 요청하세요."
              meta={invite ? { 초대자: invite.invited_by_email } : undefined}
            />
          )}
          {state === "revoked" && (
            <InvalidState
              icon={X}
              color="gray"
              title="취소된 초대"
              description="이 초대 링크는 초대자에 의해 취소되었습니다."
              meta={invite ? { 초대자: invite.invited_by_email } : undefined}
            />
          )}
          {state === "notfound" && (
            <InvalidState
              icon={X}
              color="red"
              title="유효하지 않은 초대"
              description="이 링크는 존재하지 않거나 잘못된 토큰입니다."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function InvalidState({
  icon: Icon,
  color,
  title,
  description,
  meta,
}: {
  icon: typeof X;
  color: "amber" | "red" | "gray";
  title: string;
  description: string;
  meta?: Record<string, string>;
}) {
  const colors = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <div className={`rounded-lg border px-4 py-4 ${colors[color]} text-center`}>
      <Icon className="w-7 h-7 mx-auto mb-2" />
      <p className="font-bold text-base">{title}</p>
      <p className="text-[13px] mt-1 opacity-90 font-medium leading-relaxed">{description}</p>
      {meta && (
        <dl className="mt-3 text-[13px] space-y-1">
          {Object.entries(meta).map(([k, v]) => (
            <div key={k} className="flex items-center justify-center gap-1">
              <dt className="opacity-70 font-medium">{k}:</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
