import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { documentsUrl } from "@/lib/storage-public";
import { ListPageHeader } from "@/components/admin/list-page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { ShieldCheck, Pencil } from "lucide-react";

export const metadata = {
  title: "인증서",
  description: "회사 인증서 / 특허 관리",
  robots: "noindex, nofollow",
};

type CertRow = {
  id: string;
  title_ko: string;
  title_en: string;
  title_zh: string;
  image_path: string;
  pdf_path: string | null;
  sort_order: number;
  is_published: boolean;
};

export default async function CertificationsPage() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("certifications")
    .select("id, title_ko, title_en, title_zh, image_path, pdf_path, sort_order, is_published")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as CertRow[];

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="인증서"
        count={rows.length}
        createHref="/admin/certifications/new"
        createLabel="새 인증서"
      />

      {rows.length === 0 ? (
        <EmptyState
          message="등록된 인증서가 없습니다."
          description="새 인증서를 등록하여 회사소개 페이지에 노출하세요."
          icon={ShieldCheck}
          action={{ label: "새 인증서", href: "/admin/certifications/new" }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {rows.map((cert) => (
            <Link
              key={cert.id}
              href={`/admin/certifications/${cert.id}`}
              className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md hover:border-brand-navy/40 transition-all"
            >
              <div className="relative aspect-[3/4] bg-surface-warm-50">
                {cert.image_path && cert.image_path !== "__pending__" && (
                  <Image
                    src={documentsUrl(cert.image_path)}
                    alt={cert.title_ko}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>
              <div className="p-3 space-y-1">
                <p className="font-semibold text-sm text-brand-navy line-clamp-2">{cert.title_ko}</p>
                <div className="flex items-center justify-between text-[11px]">
                  {cert.is_published ? (
                    <span className="text-emerald-700 font-bold">공개</span>
                  ) : (
                    <span className="text-gray-500 font-bold">비공개</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-gray-500 group-hover:text-brand-navy">
                    <Pencil className="w-3 h-3" />
                    편집
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
