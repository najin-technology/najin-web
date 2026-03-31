const variants = {
  error: {
    dot: "bg-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  success: {
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  info: {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
};

export function AlertMessage({
  variant = "error",
  children,
}: {
  variant?: keyof typeof variants;
  children: React.ReactNode;
}) {
  const v = variants[variant];

  return (
    <div
      role="alert"
      className={`${v.bg} border ${v.border} ${v.text} px-3 py-2.5 rounded-lg text-sm flex items-center gap-2`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${v.dot} flex-shrink-0`} />
      {children}
    </div>
  );
}
