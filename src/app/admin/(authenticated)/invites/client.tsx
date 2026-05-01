"use client";

import { useActionState, useState, useTransition } from "react";
import { createInvite, revokeInvite } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Trash2, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateInviteForm() {
  const [state, formAction, pending] = useActionState(createInvite, {});
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  if (state?.success && state.token && showSuccess !== state.token) {
    setShowSuccess(state.token);
  }

  const inviteUrl = state?.token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/admin/invite/${state.token}`
    : "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-navy/5 flex items-center justify-center">
          <Plus className="w-4 h-4 text-brand-navy" />
        </div>
        <h2 className="text-sm font-semibold text-brand-navy">새 초대 생성</h2>
      </div>

      <form action={formAction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="email_hint" className="text-[13px] font-medium">대상 메모 (선택)</Label>
          <Input
            id="email_hint"
            name="email_hint"
            placeholder="예: 김부장 / 디자인팀"
            className="text-sm mt-1"
          />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="notes" className="text-[13px] font-medium">설명 (선택)</Label>
          <Input
            id="notes"
            name="notes"
            placeholder="예: 견적 검토용 임시 권한"
            className="text-sm mt-1"
          />
        </div>
        <div className="md:col-span-1">
          <Label htmlFor="expiry" className="text-[13px] font-medium">만료</Label>
          <select
            id="expiry"
            name="expiry"
            defaultValue="7d"
            className="block w-full mt-1 h-9 text-sm rounded-md border border-input px-3 bg-background"
          >
            <option value="1d">1일</option>
            <option value="3d">3일</option>
            <option value="7d">7일 (기본)</option>
            <option value="30d">30일</option>
          </select>
        </div>

        <div className="md:col-span-3 flex items-center justify-between">
          <p className="text-[13px] text-gray-500 font-medium">
            초대 링크는 1회용입니다. 공유 후 즉시 만료시킬 수 있습니다.
          </p>
          <Button
            type="submit"
            disabled={pending}
            className="bg-brand-navy hover:bg-brand-navy-light text-white"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "초대 링크 생성"}
          </Button>
        </div>
      </form>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{state.error}</p>
      )}

      {showSuccess && state?.token && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <Check className="w-4 h-4" />
            초대 링크가 생성되었습니다 — 아래 링크를 복사해 전달하세요.
          </div>
          <div className="flex items-center gap-2 bg-white rounded-md border border-emerald-200 px-3 py-2">
            <code className="flex-1 text-[13px] text-brand-charcoal truncate font-mono font-medium">{inviteUrl}</code>
            <CopyInline text={inviteUrl} />
          </div>
        </div>
      )}
    </div>
  );
}

function CopyInline({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("링크가 복사되었습니다");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("복사 실패");
        }
      }}
      className="inline-flex items-center gap-1 text-[13px] font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-1 rounded hover:bg-emerald-100"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "복사됨" : "복사"}
    </button>
  );
}

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/admin/invite/${token}` : "";

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("링크가 복사되었습니다");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("복사 실패");
        }
      }}
      className="inline-flex items-center gap-1 text-[13px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
      title="초대 링크 복사"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "복사됨" : "링크"}
    </button>
  );
}

export function RevokeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        if (!confirm("이 초대를 취소합니다. 링크를 받은 사용자는 더 이상 가입할 수 없습니다.")) return;
        startTransition(async () => {
          await revokeInvite(id);
          toast.success("초대가 취소되었습니다");
        });
      }}
      className="inline-flex items-center gap-1 text-[13px] font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
      title="초대 취소"
    >
      {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      취소
    </button>
  );
}
