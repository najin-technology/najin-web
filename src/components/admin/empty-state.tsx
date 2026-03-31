import { Inbox, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  message,
  icon: Icon = Inbox,
  action,
}: {
  message: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
}) {
  return (
    <div className="text-center py-12 px-4">
      <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{message}</p>
      {action && (
        <Link href={action.href} className="inline-block mt-4">
          <Button variant="outline" size="sm">
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}
