import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export interface SectionHeadingProps {
  badge?: string;
  badgeVariant?: "default" | "primary" | "success" | "warning";
  title: string;
  serifHighlight?: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  badge,
  badgeVariant = "primary",
  title,
  serifHighlight,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const isCentered = align === "center";

  // If serifHighlight is provided and exists in title, split and format with Playfair Display italic
  let renderedTitle: React.ReactNode = title;
  if (serifHighlight && title.includes(serifHighlight)) {
    const parts = title.split(serifHighlight);
    renderedTitle = (
      <>
        {parts[0]}
        <span className="font-[family-name:var(--font-serif)] italic font-normal silver-gradient-text">
          {serifHighlight}
        </span>
        {parts.slice(1).join(serifHighlight)}
      </>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col space-y-4 mb-12 sm:mb-16",
        isCentered ? "items-center text-center mx-auto" : "items-start text-left",
        className
      )}
    >
      {badge && (
        <Badge
          variant={badgeVariant}
          className="uppercase tracking-widest text-[11px] font-semibold py-1 px-3.5"
        >
          {badge}
        </Badge>
      )}

      <h2
        className={cn(
          "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.12]",
          isCentered ? "max-w-4xl" : "max-w-3xl"
        )}
      >
        {renderedTitle}
      </h2>

      {subtitle && (
        <p
          className={cn(
            "text-base sm:text-lg md:text-xl text-[#A3A3A3] font-normal leading-relaxed",
            isCentered ? "max-w-2xl" : "max-w-2xl"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
