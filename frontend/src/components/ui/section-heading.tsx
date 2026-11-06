import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export interface SectionHeadingProps {
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  badge,
  badgeVariant = "info",
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "space-y-3.5",
        align === "center" ? "text-center mx-auto max-w-4xl" : "text-left max-w-3xl",
        className
      )}
    >
      {badge && (
        <div className={align === "center" ? "flex justify-center" : "flex justify-start"}>
          <Badge variant={badgeVariant} className="px-3.5 py-1 font-bold tracking-wide uppercase text-[11px]">
            {badge}
          </Badge>
        </div>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  );
}
