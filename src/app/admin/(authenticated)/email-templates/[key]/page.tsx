import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { TemplateEditor, type TemplateData } from "./template-editor";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "메일 템플릿 편집",
  robots: "noindex, nofollow",
};

export default async function EmailTemplateEditPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  await requireAdmin();
  const { key } = await params;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("key, trigger_label_ko, subject_ko, subject_en, subject_zh, body_ko, body_en, body_zh, enabled, variables_doc")
    .eq("key", key)
    .single();

  if (error || !data) notFound();

  const tpl = data as TemplateData;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/email-templates"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-navy font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          메일 자동발송
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-brand-navy">
          {tpl.trigger_label_ko}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          키: <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{tpl.key}</code>
        </p>
      </div>

      <TemplateEditor template={tpl} />
    </div>
  );
}
