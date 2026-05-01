"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertMessage } from "@/components/admin/alert-message";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createWorkOrder } from "../actions";
import { WORK_ORDER_STATUSES } from "@/lib/status-colors";

const PROCESSING_TYPES = ["우레탄", "합성수지", "CNC", "금형", "EV", "기타"];
const PRIORITIES = ["낮음", "보통", "높음"];

type Prefill = {
  quote_id: string | null;
  customer_id: string | null;
  customer_name: string;
  contact_name: string | null;
  phone: string | null;
  product_name: string;
  processing_type: string | null;
  material: string | null;
  quantity: string | null;
  deadline: string | null;
  description: string | null;
};

export function NewWorkOrderForm({ prefill }: { prefill: Prefill }) {
  const [state, formAction, pending] = useActionState(createWorkOrder, {});

  return (
    <form action={formAction} className="space-y-5">
      {prefill.quote_id && <input type="hidden" name="quote_id" value={prefill.quote_id} />}
      {prefill.customer_id && <input type="hidden" name="customer_id" value={prefill.customer_id} />}

      {state.error && <AlertMessage>{state.error}</AlertMessage>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="customer_name">
            고객사 <span className="text-rose-500">*</span>
          </Label>
          <Input id="customer_name" name="customer_name" defaultValue={prefill.customer_name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product_name">
            제품명 <span className="text-rose-500">*</span>
          </Label>
          <Input id="product_name" name="product_name" defaultValue={prefill.product_name} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">담당자</Label>
          <Input id="contact_name" name="contact_name" defaultValue={prefill.contact_name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">연락처</Label>
          <Input id="phone" name="phone" defaultValue={prefill.phone ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="processing_type">가공유형</Label>
          <Select name="processing_type" defaultValue={prefill.processing_type ?? ""}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {PROCESSING_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="material">소재</Label>
          <Input id="material" name="material" defaultValue={prefill.material ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">수량</Label>
          <Input id="quantity" name="quantity" defaultValue={prefill.quantity ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deadline">마감일</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={prefill.deadline ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">초기 상태</Label>
          <Select name="status" defaultValue="접수">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORK_ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">우선순위</Label>
          <Select name="priority" defaultValue="보통">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="assignee">담당자(내부)</Label>
          <Input id="assignee" name="assignee" placeholder="가공 담당자 이름" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">작업 지시 / 요구사항</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={prefill.description ?? ""}
          rows={5}
          placeholder="공차, 표면처리 등 가공 시 알아야 할 내용"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="internal_memo">내부 메모</Label>
        <Textarea id="internal_memo" name="internal_memo" rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white font-semibold"
        >
          {pending ? "생성 중..." : "발주 생성"}
        </Button>
      </div>
    </form>
  );
}
