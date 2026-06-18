"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Download, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { MultiFileUploader } from "@/components/admin/multi-file-uploader";
import { addQuoteQuotationFile, removeQuoteQuotationFile } from "../actions";

type QuotationFile = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  signedUrl: string | null;
};

const QUOTATION_EXTS = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "hwp"];

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function QuotationFiles({
  quoteId,
  files,
}: {
  quoteId: string;
  files: QuotationFile[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return await addQuoteQuotationFile(quoteId, fd);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const res = await removeQuoteQuotationFile(id, quoteId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("삭제됨");
        router.refresh();
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-brand-navy">
          견적서 (발송용 첨부)
          {files.length > 0 && (
            <span className="text-gray-600 font-bold tabular-nums ml-1">{files.length}</span>
          )}
        </h2>
        <p className="text-[13px] text-gray-500 mt-1">
          상태를 &lsquo;견적발송&rsquo;으로 바꾸면 이 파일들이 고객 메일에 첨부됩니다.
        </p>
      </div>
      <div className="p-5 space-y-3">
        {files.length > 0 && (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-charcoal truncate">{f.fileName}</p>
                  <p className="text-[13px] text-gray-500 font-medium tabular-nums mt-0.5">
                    {formatSize(f.fileSize)}
                  </p>
                </div>
                {f.signedUrl && (
                  <a
                    href={f.signedUrl}
                    download={f.fileName}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-navy transition-colors"
                    title="다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(f.id, f.fileName)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <MultiFileUploader
          onUpload={handleUpload}
          onComplete={() => router.refresh()}
          maxSizeMb={20}
          allowedExtensions={QUOTATION_EXTS}
        />
      </div>
    </div>
  );
}
