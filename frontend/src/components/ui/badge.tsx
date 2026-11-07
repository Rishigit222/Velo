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
      "bg-white/[0.05] border-white/[0.09] text-[#B5B5B5] hover:border-white/20",
    outline:
      "bg-transparent border-white/[0.12] text-[#B5B5B5] hover:border-white/25",
    primary:
      "bg-white/[0.08] border-white/20 text-[#D4D4D4]",
    success:
      "bg-[#49B99A]/10 border-[#49B99A]/25 text-[#49B99A]",
    warning:
      "bg-[#E5A83B]/10 border-[#E5A83B]/25 text-[#E5A83B]",
    danger:
      "bg-rose-500/10 border-rose-500/25 text-rose-300",
    muted:
      "bg-[#1A1A1A] border-white/[0.06] text-[#777777]",
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
      className={cn("bg-[#49B99A]/10 text-[#49B99A] border-[#49B99A]/25", className)}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#49B99A] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#49B99A]"></span>
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
        "font-mono text-[11px] bg-[#141414] border-white/[0.08] text-[#A3A3A3] gap-1.5",
        className
      )}
      title={hash}
    >
      <svg
        className="w-3 h-3 text-[#D4D4D4]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      <span>SHA-256:</span>
      <span className="text-[#F5F5F5]">{shortHash}</span>
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
