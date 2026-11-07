import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080808] disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-white text-[#0a0a0a] hover:bg-[#eaeaea] font-semibold border border-white/90 shadow-[0_2px_12px_rgba(255,255,255,0.12)] focus:ring-white/40",
      secondary:
        "bg-[#181818] text-white hover:bg-[#242424] border border-white/[0.12] hover:border-white/25 focus:ring-white/20",
      outline:
        "border border-white/[0.12] bg-transparent hover:bg-white/[0.06] hover:border-white/25 text-white focus:ring-white/20",
      ghost:
        "bg-transparent hover:bg-white/[0.06] text-[#A3A3A3] hover:text-white",
      accent:
        "bg-[#5278FF] text-white hover:bg-[#4168ee] border border-[#5278FF]/40 shadow-[0_2px_14px_rgba(82,120,255,0.25)] focus:ring-[#5278FF]",
      emerald:
        "bg-[#49B99A]/15 text-[#49B99A] border border-[#49B99A]/30 hover:bg-[#49B99A]/25 font-semibold focus:ring-[#49B99A]",
    };

    const sizeStyles = {
      sm: "h-9 px-3.5 text-xs gap-1.5",
      md: "h-11 px-5 text-sm gap-2",
      lg: "h-12 px-7 text-sm sm:text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
