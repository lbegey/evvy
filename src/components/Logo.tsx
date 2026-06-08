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
        "font-extrabold tracking-tight select-none",
        SIZES[size],
        className
      )}
    >
      <span className="text-foreground">E</span>
      <span className="text-blue-500">v</span>
      <span className="text-foreground">vy.</span>
    </span>
  );
}
