"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertCertification, deleteCertification } from "../actions";
import { documentsUrl } from "@/lib/storage-public";
import { toast } from "sonner";

export type CertData = {
  id: string | null;
  title_ko: string;
  title_en: string;
  title_zh: string;
  image_path: string | null;
  pdf_path: string | null;
  sort_order: number;
  is_published: boolean;
};

export function CertEditor({ cert }: { cert: CertData }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertCertification, { ok: false });
  const [deletePending, startDelete] = useTransition();

  const [titleKo, setTitleKo] = useState(cert.title_ko);
  const [titleEn, setTitleEn] = useState(cert.title_en);
  const [titleZh, setTitleZh] = useState(cert.title_zh);
  const [sortOrder, setSortOrder] = useState(cert.sort_order);
  const [isPublished, setIsPublished] = useState(cert.is_published);

  // After a successful CREATE, redirect to the edit URL of the new cert.
  if (state.ok && state.id && !cert.id) {
    router.replace(`/admin/certifications/${state.id}`);
  }

  function handleDelete() {
    if (!cert.id) return;
    if (!confirm("이 인증서를 삭제하시겠습니까? 첨부 파일도 함께 삭제됩니다.")) return;
    startDelete(async () => {
      const res = await deleteCertification(cert.id!);
      if (res.ok) {
        toast.success("삭제되었습니다.");
        router.push("/admin/certifications");
      } else {
        toast.error(res.error ?? "삭제 실패");
      }
    });
  }

  const hasImage = cert.image_path && cert.image_path !== "__pending__";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={cert.id ?? "new"} />

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {state.error}
        </div>
      )}
      {state.ok && cert.id && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-medium">
          저장되었습니다.
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <Label htmlFor="title_ko">제목 (KO) <span className="text-red-600">*</span></Label>
          <Input
            id="title_ko"
            name="title_ko"
            value={titleKo}
            onChange={(e) => setTitleKo(e.target.value)}
            required
            placeholder="예: ISO 9001 품질경영시스템 인증서"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="title_en">제목 (EN)</Label>
          <Input
            id="title_en"
            name="title_en"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="e.g. ISO 9001 Quality Management System"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="title_zh">제목 (ZH)</Label>
          <Input
            id="title_zh"
            name="title_zh"
            value={titleZh}
            onChange={(e) => setTitleZh(e.target.value)}
            placeholder="例：ISO 9001 质量管理体系认证"
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <Label htmlFor="image">
            인증서 이미지 {!cert.id && <span className="text-red-600">*</span>}
          </Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            required={!cert.id}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-gray-500">JPG/PNG/WEBP, 최대 10MB</p>
          {hasImage && (
            <a
              href={documentsUrl(cert.image_path!)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-brand-blue hover:underline"
            >
              현재 이미지 다운로드
            </a>
          )}
        </div>

        <div>
          <Label htmlFor="pdf">PDF 원본 (선택)</Label>
          <Input
            id="pdf"
            name="pdf"
            type="file"
            accept="application/pdf,.pdf"
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-gray-500">PDF, 최대 30MB</p>
          {cert.pdf_path && (
            <a
              href={documentsUrl(cert.pdf_path)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-brand-blue hover:underline"
            >
              현재 PDF 다운로드
            </a>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <Label htmlFor="sort_order">정렬 순서</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            className="mt-1.5 max-w-[150px]"
          />
          <p className="mt-1 text-xs text-gray-500">작은 숫자가 먼저 노출됩니다.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="is_published" className="cursor-pointer">웹사이트에 공개</Label>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <div>
          {cert.id && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePending}
            >
              {deletePending ? "삭제 중..." : "삭제"}
            </Button>
          )}
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
