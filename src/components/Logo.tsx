import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight select-none",
        SIZES[size],
        className
      )}
    >
      <span className="text-ink">Ev</span>
      <span className="text-evvy">vy</span>
      <span className="text-evvy">.</span>
    </span>
  );
}
