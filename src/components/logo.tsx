export function Logo({
  variant = "dark",
  size = "sm",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "lg";
}) {
  const color = variant === "dark" ? "#1B2A4A" : "#FFFFFF";
  const blue = "#00428B";
  const dark = "#1B2A4A";
  const isSm = size === "sm";

  return (
    <div className={`flex items-center ${isSm ? "gap-2.5" : "gap-3"}`}>
      {/* Circular mark */}
      <svg
        width={isSm ? 32 : 44}
        height={isSm ? 32 : 44}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`circle-clip-${size}-${variant}`}>
            <circle cx="20" cy="20" r="18" />
          </clipPath>
        </defs>
        {/* Circle background split */}
        <g clipPath={`url(#circle-clip-${size}-${variant})`}>
          {/* Left half - blue */}
          <rect x="0" y="0" width="20" height="40" fill={blue} />
          {/* Right half - dark */}
          <rect x="20" y="0" width="20" height="40" fill={dark} />
          {/* S-curve divider */}
          <path
            d="M20 0 C28 8, 12 16, 20 20 C28 24, 12 32, 20 40"
            fill={dark}
          />
          <path
            d="M20 0 C28 8, 12 16, 20 20"
            fill={blue}
          />
          {/* White curved accent */}
          <path
            d="M20 2 C27 9, 13 15, 20 20 C27 25, 13 31, 20 38"
            stroke="#FFFFFF"
            strokeWidth="2"
            fill="none"
          />
        </g>
        {/* Circle border */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke={variant === "dark" ? blue : "#FFFFFF"}
          strokeWidth="2"
          fill="none"
        />
      </svg>
      {/* Text */}
      <div className={`flex flex-col ${isSm ? "gap-0" : "gap-0.5"}`}>
        <span
          className={`font-bold leading-tight tracking-tight ${isSm ? "text-base" : "text-xl"}`}
          style={{ color }}
        >
          나진테크
        </span>
        <span
          className={`font-heading font-medium leading-tight tracking-widest uppercase ${isSm ? "text-[11px]" : "text-sm"}`}
          style={{ color: variant === "dark" ? "#5A6A7D" : "rgba(255,255,255,0.7)" }}
        >
          NAJIN TECHNOLOGY
        </span>
      </div>
    </div>
  );
}
