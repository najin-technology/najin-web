"use client";

import { Mail, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { disconnectNaver } from "../actions";

type Props = {
  email: string | null;
  naverLinked: boolean;
  naverEmail: string | null;
  naverDisconnectDisabled: boolean;
  hasGoogle: boolean;
  googleEmail: string | null;
  googleDisconnectDisabled: boolean;
  hasEmail: boolean;
};

const LOCKOUT_REASON = "마지막 로그인 수단은 해제할 수 없습니다";

export function ConnectedAccounts({
  email,
  naverLinked,
  naverEmail,
  naverDisconnectDisabled,
  hasGoogle,
  googleEmail,
  googleDisconnectDisabled,
  hasEmail,
}: Props) {
  const handleLinkGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/settings?linked=google` },
    });
    if (error) {
      alert(
        "Google 연결 실패: " +
          error.message +
          "\n\nSupabase 대시보드에서 'Manual Linking'이 활성화되어 있는지 확인해주세요."
      );
    }
  };

  // 구글 식별자(UserIdentity)를 찾아 unlink. 성공 시 콜백 실행.
  const unlinkGoogle = async (afterUnlink?: () => Promise<void> | void) => {
    const supabase = createSupabaseBrowserClient();
    const { data, error: idErr } = await supabase.auth.getUserIdentities();
    const googleIdentity = data?.identities.find((i) => i.provider === "google");
    if (idErr || !googleIdentity) {
      alert("Google 연결 정보를 찾을 수 없습니다.");
      return false;
    }
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) {
      alert("Google 연결 해제 실패: " + error.message);
      return false;
    }
    await afterUnlink?.();
    return true;
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm("Google 연결을 해제하시겠습니까?")) return;
    const ok = await unlinkGoogle();
    if (ok) window.location.href = "/admin/settings?unlinked=google";
  };

  const handleChangeGoogle = async () => {
    if (
      !confirm(
        "기존 Google 연결을 해제한 뒤 새 Google 계정 연결을 진행합니다.\n연결을 완료하지 않으면 Google 연결이 해제된 상태로 남습니다. 계속할까요?"
      )
    )
      return;
    // 기존 연결 해제 후 곧바로 새 계정 연결(OAuth 리다이렉트).
    await unlinkGoogle(handleLinkGoogle);
  };

  const handleLinkNaver = () => {
    window.location.href = "/api/admin/auth/naver/link/start";
  };

  const handleDisconnectNaver = async () => {
    if (!confirm("네이버 연결을 해제하시겠습니까?")) return;
    const result = await disconnectNaver();
    if (!result.ok) {
      alert(result.error ?? "네이버 연결 해제에 실패했습니다.");
      return;
    }
    window.location.href = "/admin/settings?unlinked=naver";
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        연결된 로그인 방식
      </h2>

      <ProviderRow
        name="이메일 / 비밀번호"
        connected={hasEmail}
        label={hasEmail ? email : "계정에 등록된 이메일"}
        icon={<Mail className="w-5 h-5" strokeWidth={1.5} />}
        actionDisabled
      />

      <ProviderRow
        name="Google"
        connected={hasGoogle}
        label={hasGoogle ? googleEmail : null}
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        }
        onLink={handleLinkGoogle}
        onChange={handleChangeGoogle}
        onDisconnect={handleUnlinkGoogle}
        disconnectDisabled={googleDisconnectDisabled}
      />

      <ProviderRow
        name="네이버"
        connected={naverLinked}
        label={naverLinked ? naverEmail : null}
        icon={
          <div className="w-5 h-5 rounded-sm bg-[#03C75A] flex items-center justify-center">
            <svg viewBox="0 0 20 20" className="w-3 h-3" fill="white">
              <path d="M13.5 10.6L6.4 0H0v20h6.5V9.4L13.6 20H20V0h-6.5v10.6z" />
            </svg>
          </div>
        }
        onLink={handleLinkNaver}
        onChange={handleLinkNaver}
        onDisconnect={handleDisconnectNaver}
        disconnectDisabled={naverDisconnectDisabled}
      />
    </section>
  );
}

function ProviderRow({
  name,
  connected,
  label,
  icon,
  onLink,
  onChange,
  onDisconnect,
  disconnectDisabled = false,
  actionDisabled = false,
}: {
  name: string;
  connected: boolean;
  label: string | null;
  icon: React.ReactNode;
  onLink?: () => void;
  onChange?: () => void;
  onDisconnect?: () => void;
  disconnectDisabled?: boolean;
  actionDisabled?: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-surface-warm-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-brand-navy">{name}</p>
          {connected && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              연결됨
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-600 truncate mt-0.5 font-medium">
          {label ?? "연결안됨"}
        </p>
      </div>

      {actionDisabled ? (
        <span className="text-xs text-gray-500 flex-shrink-0 font-medium">자동 생성</span>
      ) : connected ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          {onChange && (
            <Button type="button" variant="outline" size="sm" onClick={onChange}>
              변경
            </Button>
          )}
          {onDisconnect && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDisconnect}
              disabled={disconnectDisabled}
              title={disconnectDisabled ? LOCKOUT_REASON : undefined}
            >
              해제
            </Button>
          )}
        </div>
      ) : (
        onLink && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onLink}
            className="flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            연결하기
          </Button>
        )
      )}
    </div>
  );
}
