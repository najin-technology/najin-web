"use client";

import { useActionState, useState, useEffect } from "react";
import { createJobPosting, updateJobPosting } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FormStatusBar } from "@/components/admin/form-status-bar";
import { AlertMessage } from "@/components/admin/alert-message";

type JobPostingData = {
  id?: string;
  title_ko: string;
  title_en: string | null;
  department: string | null;
  employment_type: string | null;
  description_ko: string | null;
  description_en: string | null;
  requirements_ko: string | null;
  requirements_en: string | null;
  benefits_ko: string | null;
  benefits_en: string | null;
  is_active: boolean;
  deadline: string | null;
};

export function JobPostingForm({
  posting,
  mode,
}: {
  posting?: JobPostingData;
  mode: "create" | "edit";
}) {
  const action = mode === "create" ? createJobPosting : updateJobPosting;
  const [state, formAction, pending] = useActionState(action, {});
  const [isActive, setIsActive] = useState(posting?.is_active ?? true);
  const [tabValue, setTabValue] = useState("ko");

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab) setTabValue(tab);
  }, []);

  return (
    <form action={formAction} className="space-y-6">
      {posting?.id && <input type="hidden" name="id" value={posting.id} />}
      <input type="hidden" name="is_active" value={String(isActive)} />

      {state.error && (
        <AlertMessage>{state.error}</AlertMessage>
      )}

      <FormStatusBar checked={isActive} onCheckedChange={setIsActive} />

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">기본 정보</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="department">부서</Label>
          <Input
            id="department"
            name="department"
            defaultValue={posting?.department || ""}
            placeholder="예: 생산팀"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="employment_type">고용형태</Label>
          <Input
            id="employment_type"
            name="employment_type"
            defaultValue={posting?.employment_type || ""}
            placeholder="예: 정규직"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">마감일</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={posting?.deadline || ""}
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-2">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">콘텐츠</p>
      </div>

      <Tabs value={tabValue} onValueChange={(v) => {
        setTabValue(v);
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("tab", v);
          window.history.replaceState({}, "", url.toString());
        }
      }}>
        <TabsList>
          <TabsTrigger value="ko">한국어</TabsTrigger>
          <TabsTrigger value="en">English</TabsTrigger>
        </TabsList>

        <TabsContent value="ko" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title_ko">제목 (한국어) *</Label>
            <Input
              id="title_ko"
              name="title_ko"
              defaultValue={posting?.title_ko || ""}
              required
              placeholder="채용공고 제목을 입력하세요"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_ko">상세 설명 (한국어)</Label>
            <Textarea
              id="description_ko"
              name="description_ko"
              defaultValue={posting?.description_ko || ""}
              placeholder="업무 내용을 입력하세요"
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements_ko">자격 요건 (한국어)</Label>
            <Textarea
              id="requirements_ko"
              name="requirements_ko"
              defaultValue={posting?.requirements_ko || ""}
              placeholder="자격 요건을 입력하세요"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits_ko">복리후생 (한국어)</Label>
            <Textarea
              id="benefits_ko"
              name="benefits_ko"
              defaultValue={posting?.benefits_ko || ""}
              placeholder="복리후생을 입력하세요"
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="en" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title_en">Title (English)</Label>
            <Input
              id="title_en"
              name="title_en"
              defaultValue={posting?.title_en || ""}
              placeholder="Enter job posting title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description_en">Description (English)</Label>
            <Textarea
              id="description_en"
              name="description_en"
              defaultValue={posting?.description_en || ""}
              placeholder="Enter job description"
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requirements_en">Requirements (English)</Label>
            <Textarea
              id="requirements_en"
              name="requirements_en"
              defaultValue={posting?.requirements_en || ""}
              placeholder="Enter requirements"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits_en">Benefits (English)</Label>
            <Textarea
              id="benefits_en"
              name="benefits_en"
              defaultValue={posting?.benefits_en || ""}
              placeholder="Enter benefits"
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-brand-navy hover:bg-brand-navy-light text-white rounded-lg shadow-sm min-w-[100px]"
        >
          {pending
            ? "저장 중..."
            : mode === "create"
              ? "등록하기"
              : "수정하기"}
        </Button>
      </div>
    </form>
  );
}
