import React from "react";
import { CheckCircle2, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderStatus, UserRole } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "purple"
    | "outline"
    | "verified";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-slate-100 text-slate-800 border-slate-200",
    success:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    verified:
      "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold shadow-xs",
    warning:
      "bg-amber-50 text-amber-700 border-amber-200",
    danger:
      "bg-rose-50 text-rose-700 border-rose-200",
    info:
      "bg-blue-50 text-blue-700 border-blue-200",
    purple:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
    outline:
      "border border-slate-300 text-slate-700 bg-white",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border transition-colors select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Green Verification Indicator as required by design specification
 */
export function VerificationIndicator({
  label = "Verified Genuine",
  score,
  className,
}: {
  label?: string;
  score?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
        className
      )}
    >
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      <span>{label}</span>
      {score !== undefined && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px]">
          {score}%
        </span>
      )}
    </span>
  );
}

/**
 * Cryptographic Seal Indicator
 */
export function TamperEvidentSeal({
  hash,
  className,
}: {
  hash?: string;
  className?: string;
}) {
  const shortHash = hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : "SHA-256 Valid";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200",
        className
      )}
    >
      <ShieldCheck className="h-3 w-3 text-blue-600" />
      <span>{shortHash}</span>
    </span>
  );
}

/**
 * Maps order statuses directly to badge variants
 */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; variant: BadgeProps["variant"] }> = {
    pending: { label: "Pending", variant: "warning" },
    confirmed: { label: "Confirmed", variant: "info" },
    shipped: { label: "Shipped", variant: "purple" },
    delivered: { label: "Delivered", variant: "success" },
    return_requested: { label: "Return Requested", variant: "warning" },
    returned: { label: "Returned", variant: "default" },
    cancelled: { label: "Cancelled", variant: "danger" },
  };

  const config = map[status] || { label: status, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

/**
 * Maps user roles directly to badge variants
 */
export function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, { label: string; variant: BadgeProps["variant"] }> = {
    buyer: { label: "Buyer", variant: "info" },
    seller: { label: "Seller", variant: "purple" },
    admin: { label: "Admin", variant: "danger" },
  };

  const config = map[role] || { label: role, variant: "default" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
