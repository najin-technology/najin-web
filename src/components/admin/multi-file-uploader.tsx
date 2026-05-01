"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type UploadFn = (file: File) => Promise<{ error?: string; success?: boolean }>;

const DEFAULT_ALLOWED = [
  "pdf", "dwg", "dxf", "step", "stp", "igs", "iges",
  "stl", "obj", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx",
];

export function MultiFileUploader({
  onUpload,
  onComplete,
  maxSizeMb = 50,
  allowedExtensions = DEFAULT_ALLOWED,
}: {
  onUpload: UploadFn;
  onComplete?: () => void;
  maxSizeMb?: number;
  allowedExtensions?: string[];
}) {
  const [pending, startTransition] = useTransition();
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const acceptStr = allowedExtensions.map((e) => `.${e}`).join(",");

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const localErrors: string[] = [];
    const valid: File[] = [];
    for (const f of list) {
      const ext = f.name.split(".").pop()?.toLowerCase();
      if (!ext || !allowedExtensions.includes(ext)) {
        localErrors.push(`${f.name}: 허용되지 않는 형식`);
        continue;
      }
      if (f.size > maxSizeMb * 1024 * 1024) {
        localErrors.push(`${f.name}: ${maxSizeMb}MB 초과`);
        continue;
      }
      valid.push(f);
    }
    setErrors(localErrors);

    if (valid.length === 0) return;

    startTransition(async () => {
      let successCount = 0;
      for (const f of valid) {
        const res = await onUpload(f);
        if (res.error) {
          toast.error(`${f.name}: ${res.error}`);
        } else {
          successCount++;
        }
      }
      if (successCount > 0) toast.success(`${successCount}개 파일 업로드 완료`);
      onComplete?.();
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  return (
    <div className="space-y-2">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-6 py-10 cursor-pointer transition-colors ${
          dragOver
            ? "border-brand-copper bg-brand-copper/5"
            : pending
              ? "border-gray-200 bg-gray-50/50"
              : "border-gray-300 bg-gray-50/50 hover:border-brand-navy/30 hover:bg-brand-navy/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={acceptStr}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={pending}
        />
        {pending ? (
          <>
            <Loader2 className="w-8 h-8 text-brand-copper animate-spin" />
            <p className="text-base font-semibold text-brand-charcoal">업로드 중...</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-500" />
            <p className="text-base font-semibold text-brand-charcoal">
              파일 끌어다 놓기 또는 클릭하여 선택
            </p>
            <p className="text-[13px] text-gray-600 font-medium">
              PDF, DWG, DXF, STEP, IGES, STL, OBJ, JPG, PNG, DOC, XLSX (최대 {maxSizeMb}MB)
            </p>
          </>
        )}
      </label>

      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[13px] text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {err}
              <button
                type="button"
                onClick={() => setErrors(errors.filter((_, j) => j !== i))}
                className="ml-auto opacity-70 hover:opacity-100"
                aria-label="에러 닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
