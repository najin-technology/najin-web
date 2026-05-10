import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CertEditor, type CertData } from "./cert-editor";

export const metadata = {
  title: "인증서 편집",
  robots: "noindex, nofollow",
};

const EMPTY: CertData = {
  id: null,
  title_ko: "",
  title_en: "",
  title_zh: "",
  image_path: null,
  pdf_path: null,
  sort_order: 0,
  is_published: true,
};

export default async function CertEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  let cert: CertData = EMPTY;

  if (id !== "new") {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("certifications")
      .select("id, title_ko, title_en, title_zh, image_path, pdf_path, sort_order, is_published")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) notFound();
    cert = data as CertData;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/certifications"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-navy font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          인증서 목록
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-navy">
          {cert.id ? "인증서 편집" : "새 인증서"}
        </h1>
      </div>

      <CertEditor cert={cert} />
    </div>
  );
}
