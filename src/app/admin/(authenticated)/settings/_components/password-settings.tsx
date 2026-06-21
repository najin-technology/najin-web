"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertMessage } from "@/components/admin/alert-message";
import { changePassword } from "../actions";

export function PasswordSettings({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const mismatch = confirm.length > 0 && next !== confirm;
  const tooShort = next.length > 0 && next.length < 8;
  const ready = next.length >= 8 && next === confirm && (!hasPassword || current.length > 0);
  const verb = hasPassword ? "변경" : "설정";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    startTransition(async () => {
      setMsg(null);
      const result = await changePassword({
        currentPassword: hasPassword ? current : undefined,
        newPassword: next,
      });
      if (!result.ok) {
        setMsg({ type: "error", text: result.error ?? `비밀번호 ${verb}에 실패했습니다.` });
        return;
      }
      setMsg({ type: "success", text: `비밀번호가 ${verb}되었습니다.` });
      setCurrent("");
      setNext("");
      setConfirm("");
    });
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
        비밀번호 {verb}
      </h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200/80 rounded-2xl p-5 space-y-4"
      >
        {!hasPassword && (
          <p className="text-[13px] text-gray-600 font-medium">
            비밀번호를 설정하면 SSO 없이 이메일/비밀번호로도 로그인할 수 있습니다.
          </p>
        )}
        {hasPassword && (
          <div className="space-y-1.5">
            <Label htmlFor="current-password">현재 비밀번호</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="new-password">새 비밀번호 (8자 이상)</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            aria-invalid={tooShort}
          />
          {tooShort && (
            <p className="text-xs text-red-600 font-medium">비밀번호는 8자 이상이어야 합니다.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={mismatch}
          />
          {mismatch && (
            <p className="text-xs text-red-600 font-medium">비밀번호가 일치하지 않습니다.</p>
          )}
        </div>

        {msg && <AlertMessage variant={msg.type}>{msg.text}</AlertMessage>}

        <Button
          type="submit"
          disabled={!ready || pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white font-semibold"
        >
          {pending ? "처리 중..." : `비밀번호 ${verb}`}
        </Button>
      </form>
    </section>
  );
}
