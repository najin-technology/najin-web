import { Badge } from "@/components/ui/badge";

const quoteStatusConfig: Record<string, { variant: "secondary" | "default" | "outline" | "destructive"; className?: string }> = {
  접수: { variant: "secondary" },
  검토중: { variant: "default", className: "bg-blue-600" },
  견적발송: { variant: "default", className: "bg-amber-500" },
  완료: { variant: "default", className: "bg-green-600" },
};

const applicationStatusConfig: Record<string, { variant: "secondary" | "default" | "outline" | "destructive"; className?: string }> = {
  서류검토: { variant: "secondary" },
  면접예정: { variant: "default", className: "bg-blue-600" },
  합격: { variant: "default", className: "bg-green-600" },
  불합격: { variant: "destructive" },
};

export function StatusBadge({
  status,
  type,
}: {
  status: string;
  type: "quote" | "application";
}) {
  const configs = type === "quote" ? quoteStatusConfig : applicationStatusConfig;
  const config = configs[status] || { variant: "secondary" as const };

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
}
