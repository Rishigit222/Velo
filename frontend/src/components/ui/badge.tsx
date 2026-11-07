import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "outline"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "muted";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium rounded-full border transition-colors select-none";

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs gap-1.5",
    md: "px-3 py-1 text-xs gap-2",
  };

  const variantStyles = {
    default:
      "bg-white/[0.06] border-white/10 text-zinc-300 hover:border-white/20",
    outline:
      "bg-transparent border-white/15 text-zinc-300 hover:border-white/25",
    primary:
      "bg-[#3867FF]/15 border-[#3867FF]/35 text-[#85a6ff] shadow-[0_0_12px_rgba(56,103,255,0.2)]",
    success:
      "bg-[#20C997]/15 border-[#20C997]/35 text-[#5ee3bc] shadow-[0_0_12px_rgba(32,201,151,0.2)]",
    warning:
      "bg-[#F59E0B]/15 border-[#F59E0B]/35 text-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    danger:
      "bg-rose-500/15 border-rose-500/35 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
    muted:
      "bg-zinc-800/60 border-zinc-700/50 text-zinc-400",
  };

  return (
    <span
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}

export function VerificationBadge({
  label = "Verified Authentic",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Badge
      variant="success"
      className={cn("bg-[#20C997]/10 text-[#20C997] border-[#20C997]/30", className)}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20C997] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#20C997]"></span>
      </span>
      <span>{label}</span>
    </Badge>
  );
}

export function HashBadge({
  hash,
  className,
}: {
  hash: string;
  className?: string;
}) {
  const shortHash =
    hash.length > 16 ? `${hash.slice(0, 8)}...${hash.slice(-8)}` : hash;

  return (
    <Badge
      variant="default"
      className={cn(
        "font-mono text-[11px] bg-[#111111] border-white/10 text-zinc-400 gap-1.5",
        className
      )}
      title={hash}
    >
      <svg
        className="w-3 h-3 text-[#3867FF]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span>SHA-256:</span>
      <span className="text-zinc-200">{shortHash}</span>
    </Badge>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: "PENDING" | "VERIFIED" | "DISPUTED" | "RESOLVED" | "FLAGGED" | string;
  className?: string;
}) {
  switch (status.toUpperCase()) {
    case "VERIFIED":
    case "PASSED":
    case "INTACT":
      return (
        <Badge variant="success" className={className}>
          ● {status}
        </Badge>
      );
    case "PENDING":
    case "IN_REVIEW":
    case "PROCESSING":
      return (
        <Badge variant="warning" className={className}>
          ◐ {status}
        </Badge>
      );
    case "DISPUTED":
    case "FLAGGED":
    case "DAMAGED":
      return (
        <Badge variant="danger" className={className}>
          ✕ {status}
        </Badge>
      );
    case "RESOLVED":
      return (
        <Badge variant="primary" className={className}>
          ✓ {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="default" className={className}>
          {status}
        </Badge>
      );
  }
}
