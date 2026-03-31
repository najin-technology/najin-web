import { Inbox, Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  message,
  description,
  icon: Icon = Inbox,
  action,
}: {
  message: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-600">{message}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">{description}</p>
      )}
      {action && (
        <Link href={action.href} className="inline-block mt-5">
          <Button size="sm" className="bg-brand-navy hover:bg-brand-charcoal text-white gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
