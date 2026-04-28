import { Inbox, Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  message,
  description,
  icon: Icon = Inbox,
  action,
  iconBg,
}: {
  message: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
  iconBg?: string;
}) {
  return (
    <div className="text-center py-16 px-4 stat-number">
      <div className={`w-14 h-14 rounded-xl ${iconBg || "bg-gray-100"} flex items-center justify-center mx-auto mb-4`}>
        <Icon className="w-7 h-7 text-gray-500" />
      </div>
      <p className="text-base font-semibold text-brand-charcoal">{message}</p>
      {description && (
        <p className="text-sm text-gray-600 mt-1.5 max-w-[300px] mx-auto leading-relaxed font-medium">{description}</p>
      )}
      {action && (
        <Link href={action.href} className="inline-block mt-5">
          <Button size="sm" className="bg-brand-navy hover:bg-brand-navy-light text-white gap-1.5">
            <Plus className="w-4 h-4" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
