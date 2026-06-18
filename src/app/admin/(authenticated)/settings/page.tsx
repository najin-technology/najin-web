import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSiteSettings } from "@/lib/queries";
import { ConnectedAccounts } from "./_components/connected-accounts";
import { QuoteIntakeSettings } from "./_components/quote-intake-settings";

export const metadata = {
  title: "설정",
  description: "관리자 계정 설정",
  robots: "noindex, nofollow",
};

type IdentityRow = {
  provider: string;
  email: string | null;
  subject: string | null;
  linkedAt: string | null;
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; error?: string }>;
}) {
  const user = await requireAdmin();
  const { linked, error } = await searchParams;

  const admin = getSupabaseAdmin();
  const identities: IdentityRow[] = [];

  if (admin) {
    const { data: fullUser } = await admin.auth.admin.getUserById(user.id);
    if (fullUser?.user?.identities) {
      for (const id of fullUser.user.identities) {
        identities.push({
          provider: id.provider,
          email: (id.identity_data?.email as string | undefined) ?? null,
          subject: id.id,
          linkedAt: id.created_at ?? null,
        });
      }
    }
  }

  const settings = await getSiteSettings();
  const naverLinked = Boolean(user.app_metadata?.naver_id);
  const naverEmail = (user.app_metadata?.naver_email as string | undefined) ?? null;
  const hasGoogle = identities.some((i) => i.provider === "google");
  const hasEmail = identities.some((i) => i.provider === "email");

  return (
    <div className="space-y-8 max-w-2xl">
      <header className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-copper">
          관리자 · 설정
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-brand-navy">계정 연결</h1>
        <p className="text-sm text-gray-600">
          여러 로그인 방식을 이 관리자 계정에 연결할 수 있습니다.
        </p>
      </header>

      {linked && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-900">
          {linked === "naver" && "네이버 계정이 연결되었습니다."}
          {linked === "google" && "Google 계정이 연결되었습니다."}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
          연결 실패: {error.replace(/_/g, " ")}
        </div>
      )}

      <ConnectedAccounts
        email={user.email ?? null}
        naverLinked={naverLinked}
        naverEmail={naverEmail}
        hasGoogle={hasGoogle}
        googleEmail={identities.find((i) => i.provider === "google")?.email ?? null}
        hasEmail={hasEmail}
      />

      <QuoteIntakeSettings initial={settings} />

      <footer className="text-[13px] text-gray-600 pt-6 border-t border-gray-100 leading-relaxed font-medium">
        Tip: 한 관리자에 여러 로그인 수단을 연결해두면 특정 서비스가 장애여도 다른 방법으로 접속할 수 있습니다.
      </footer>
    </div>
  );
}
