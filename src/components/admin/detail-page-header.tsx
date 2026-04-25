import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function DetailPageHeader({
  backHref,
  title,
  subtitle,
}: {
  backHref: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Link href={backHref}>
        <Button variant="ghost" size="icon-sm" className="rounded-lg hover:bg-gray-100" aria-label="뒤로 가기">
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-lg font-bold text-brand-navy">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}
