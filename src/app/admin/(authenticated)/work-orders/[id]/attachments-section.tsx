"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Eye, Image as ImageIcon, FileText, Box } from "lucide-react";
import { toast } from "sonner";
import { MultiFileUploader } from "@/components/admin/multi-file-uploader";
import { CadViewer } from "./cad-viewer";
import {
  addWorkOrderAttachment,
  removeWorkOrderAttachment,
} from "../actions";

type Attachment = {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  signedUrl: string | null;
};

const VIEWABLE_2D = ["dxf"];
const VIEWABLE_3D = ["step", "stp", "igs", "iges", "stl", "obj"];
const VIEWABLE_NATIVE = ["pdf", "jpg", "jpeg", "png"];

function getExt(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function fileIcon(ext: string) {
  if (["jpg", "jpeg", "png"].includes(ext)) return <ImageIcon className="w-4 h-4 text-blue-500" />;
  if (["dwg", "dxf", "step", "stp", "igs", "iges", "stl", "obj"].includes(ext)) {
    return <Box className="w-4 h-4 text-brand-copper" />;
  }
  return <FileText className="w-4 h-4 text-gray-500" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function AttachmentsSection({
  workOrderId,
  attachments: initialAttachments,
}: {
  workOrderId: string;
  attachments: Attachment[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [viewer, setViewer] = useState<{ url: string; name: string; ext: string } | null>(null);

  const handleUpload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return await addWorkOrderAttachment(workOrderId, fd);
  };

  const handleDelete = (attachmentId: string, fileName: string) => {
    if (!confirm(`'${fileName}'을(를) 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const res = await removeWorkOrderAttachment(attachmentId, workOrderId);
      if (res.error) toast.error(res.error);
      else {
        toast.success("삭제됨");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      {initialAttachments.length > 0 && (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white">
          {initialAttachments.map((att) => {
            const ext = getExt(att.fileName);
            const canPreview2d = VIEWABLE_2D.includes(ext);
            const canPreview3d = VIEWABLE_3D.includes(ext);
            const canPreviewNative = VIEWABLE_NATIVE.includes(ext);
            const isDwg = ext === "dwg";

            return (
              <li key={att.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-surface-warm-50 flex items-center justify-center flex-shrink-0">
                  {fileIcon(ext)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brand-charcoal truncate">
                    {att.fileName}
                    <span className="ml-1.5 text-[10px] uppercase font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded tracking-wider">
                      {ext}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{formatSize(att.fileSize)}</span>
                    {isDwg && (
                      <span className="text-brand-copper" title="DWG는 다운로드 후 PC CAD 뷰어로 열어주세요. DXF로 export 시 인앱 미리보기 가능">
                        💡 DXF로 export하면 인앱 보기 가능
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {(canPreview2d || canPreview3d) && att.signedUrl && (
                    <button
                      type="button"
                      onClick={() => setViewer({ url: att.signedUrl!, name: att.fileName, ext })}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-navy transition-colors"
                      title="미리보기"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {canPreviewNative && att.signedUrl && (
                    <a
                      href={att.signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-navy transition-colors"
                      title="새 탭에서 보기"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  {att.signedUrl && (
                    <a
                      href={att.signedUrl}
                      download={att.fileName}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-brand-navy transition-colors"
                      title="다운로드"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(att.id, att.fileName)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <MultiFileUploader
        onUpload={handleUpload}
        onComplete={() => router.refresh()}
      />

      {viewer && (
        <CadViewer
          url={viewer.url}
          fileName={viewer.name}
          ext={viewer.ext}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
