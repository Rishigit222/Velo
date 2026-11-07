import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass" | "bordered";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative rounded-2xl transition-all duration-300 overflow-hidden";

    const variantStyles = {
      default:
        "bg-[#191919] border border-white/[0.08] text-[#F5F5F5] shadow-xl shadow-black/40",
      elevated:
        "bg-[#202020] border border-white/[0.11] text-[#F5F5F5] shadow-2xl shadow-black/60",
      glass:
        "bg-[#141416]/80 backdrop-blur-md border border-white/[0.08] text-[#F5F5F5]",
      bordered:
        "bg-transparent border border-white/[0.1] text-[#F5F5F5] hover:border-white/20",
    };

    const interactiveStyles = interactive
      ? "hover:border-white/20 hover:bg-[#1E1E1E] hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], interactiveStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 sm:p-8 flex flex-col space-y-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xl sm:text-2xl font-semibold tracking-tight text-white", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm sm:text-base text-[#A3A3A3] leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 sm:p-8 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("p-6 sm:p-8 pt-0 flex items-center justify-between mt-auto border-t border-white/[0.06] pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
