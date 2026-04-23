import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { CreateInviteForm, RevokeButton, CopyLinkButton } from "./client";
import { Mail, Clock, Check, X, ShieldAlert } from "lucide-react";

export const metadata = { title: "관리자 초대", description: "신규 관리자 초대 링크 관리", robots: "noindex, nofollow" };

function inviteStatus(row: {
  used_at: string | null;
  revoked_at: string | null;
  expires_at: string;
}): { label: string; color: string; icon: typeof Check } {
  if (row.used_at) return { label: "사용됨", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Check };
  if (row.revoked_at) return { label: "취소됨", color: "bg-gray-100 text-gray-500 border-gray-200", icon: X };
  if (new Date(row.expires_at) <= new Date())
    return { label: "만료됨", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock };
  return { label: "활성", color: "bg-blue-50 text-blue-700 border-blue-200", icon: ShieldAlert };
}

export default async function InvitesPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: invites } = await supabase
    .from("admin_invites")
    .select("id, token, email_hint, notes, invited_by_email, expires_at, used_at, used_by_email, revoked_at, created_at")
    .order("created_at", { ascending: false });

  const list = invites || [];
  const activeCount = list.filter((i) => !i.used_at && !i.revoked_at && new Date(i.expires_at) > new Date()).length;

  return (
    <div className="space-y-6">
      <ListPageHeader title="관리자 초대" count={activeCount} />

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <p className="font-medium mb-1">초대 링크 사용법</p>
        <ol className="list-decimal list-inside space-y-0.5 text-blue-700/90 text-xs">
          <li>아래 폼에서 초대 생성 → 링크 복사</li>
          <li>초대받을 사람에게 링크 전달 (이메일/메신저)</li>
          <li>받은 사람이 링크 열고 Google 또는 이메일로 가입</li>
          <li>가입 즉시 관리자 권한 자동 부여 (토큰 1회 사용)</li>
        </ol>
      </div>

      <CreateInviteForm />

      {list.length === 0 ? (
        <EmptyState
          icon={Mail}
          message="아직 발급된 초대가 없습니다"
          description="위 폼으로 새 초대를 생성하세요."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">상태</th>
                  <th className="px-4 py-3 text-left font-semibold">대상 (메모)</th>
                  <th className="px-4 py-3 text-left font-semibold">초대자</th>
                  <th className="px-4 py-3 text-left font-semibold">만료</th>
                  <th className="px-4 py-3 text-left font-semibold">사용 정보</th>
                  <th className="px-4 py-3 text-right font-semibold">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((row) => {
                  const status = inviteStatus(row);
                  const StatusIcon = status.icon;
                  const isUsable = !row.used_at && !row.revoked_at && new Date(row.expires_at) > new Date();
                  return (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-700">{row.email_hint || <span className="text-gray-400 italic">메모 없음</span>}</div>
                        {row.notes && <div className="text-xs text-gray-400 mt-0.5">{row.notes}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{row.invited_by_email}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 tabular-nums">
                        {new Date(row.expires_at).toLocaleString("ko-KR", {
                          year: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {row.used_at ? (
                          <span>
                            {row.used_by_email}
                            <br />
                            <span className="text-gray-400 tabular-nums">
                              {new Date(row.used_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isUsable ? (
                          <div className="flex items-center gap-1 justify-end">
                            <CopyLinkButton token={row.token} />
                            <RevokeButton id={row.id} />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
