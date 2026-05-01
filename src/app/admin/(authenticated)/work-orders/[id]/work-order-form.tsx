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
import { updateWorkOrder } from "../actions";

const PROCESSING_TYPES = ["우레탄", "합성수지", "CNC", "금형", "EV", "기타"];
const PRIORITIES = ["낮음", "보통", "높음"];

type WorkOrder = {
  id: string;
  customer_name: string;
  contact_name: string | null;
  phone: string | null;
  product_name: string;
  processing_type: string | null;
  material: string | null;
  quantity: string | null;
  deadline: string | null;
  priority: string;
  description: string | null;
  internal_memo: string | null;
  assignee: string | null;
};

export function WorkOrderForm({ order }: { order: WorkOrder }) {
  const [state, formAction, pending] = useActionState(updateWorkOrder, {});

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={order.id} />

      {state.error && <AlertMessage>{state.error}</AlertMessage>}
      {state.success && <AlertMessage variant="success">저장되었습니다.</AlertMessage>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="customer_name">
            고객사 <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="customer_name"
            name="customer_name"
            defaultValue={order.customer_name}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product_name">
            제품명 <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="product_name"
            name="product_name"
            defaultValue={order.product_name}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact_name">담당자</Label>
          <Input id="contact_name" name="contact_name" defaultValue={order.contact_name ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">연락처</Label>
          <Input id="phone" name="phone" defaultValue={order.phone ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="processing_type">가공유형</Label>
          <Select name="processing_type" defaultValue={order.processing_type ?? ""}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {PROCESSING_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="material">소재</Label>
          <Input id="material" name="material" defaultValue={order.material ?? ""} placeholder="예: PE, POM, AL" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="quantity">수량</Label>
          <Input id="quantity" name="quantity" defaultValue={order.quantity ?? ""} placeholder="예: 50EA" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deadline">마감일</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={order.deadline ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="priority">우선순위</Label>
          <Select name="priority" defaultValue={order.priority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="assignee">담당자(내부)</Label>
          <Input id="assignee" name="assignee" defaultValue={order.assignee ?? ""} placeholder="가공 담당자 이름" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">작업 지시 / 요구사항</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={order.description ?? ""}
          rows={6}
          placeholder="공차, 표면처리, 특수 요구사항 등 가공 시 알아야 할 내용"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="internal_memo">내부 메모</Label>
        <Textarea
          id="internal_memo"
          name="internal_memo"
          defaultValue={order.internal_memo ?? ""}
          rows={3}
          placeholder="외부 노출 없는 내부 전용 메모"
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-brand-navy hover:bg-brand-navy-light text-white font-semibold"
      >
        {pending ? "저장 중..." : "변경사항 저장"}
      </Button>
    </form>
  );
}
