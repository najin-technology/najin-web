"use client";

import { useActionState } from "react";
import { createCustomer } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

export function NewCustomerForm() {
  const [state, formAction, pending] = useActionState(createCustomer, {});

  return (
    <form action={formAction} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div>
        <Label htmlFor="company_name" className="text-sm">
          회사명 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="company_name"
          name="company_name"
          required
          placeholder="예: 현대자동차"
          className="mt-1.5 text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="primary_contact_name" className="text-sm">담당자</Label>
          <Input
            id="primary_contact_name"
            name="primary_contact_name"
            placeholder="예: 홍길동"
            className="mt-1.5 text-base"
          />
        </div>
        <div>
          <Label htmlFor="primary_contact_phone" className="text-sm">전화</Label>
          <Input
            id="primary_contact_phone"
            name="primary_contact_phone"
            type="tel"
            placeholder="010-0000-0000"
            className="mt-1.5 text-base"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="primary_contact_email" className="text-sm">이메일</Label>
        <Input
          id="primary_contact_email"
          name="primary_contact_email"
          type="email"
          placeholder="contact@company.com"
          className="mt-1.5 text-base"
        />
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm">메모</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="고객 관련 메모 (관리자만 볼 수 있음)"
          className="mt-1.5 text-sm"
        />
      </div>

      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={pending} className="bg-brand-navy hover:bg-brand-navy-light text-white">
          {pending ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
          고객 등록
        </Button>
      </div>

      <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
        등록 후 상세 페이지에서 거래처 그리드 노출 설정·상태·태그 편집 가능.
      </p>
    </form>
  );
}
