"use client";

import React, { useState, useRef, useCallback } from "react";

interface ComparisonSliderProps {
  originalImage: string;
  returnedImage: string;
  originalLabel?: string;
  returnedLabel?: string;
}

export function ComparisonSlider({
  originalImage,
  returnedImage,
  originalLabel = "Original Delivery",
  returnedLabel = "Returned Product",
}: ComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  return (
    <div className="space-y-3">
      {/* Visual Instruction */}
      <div className="flex items-center justify-between text-xs font-mono text-[#777777]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
          {originalLabel} ({Math.round(sliderPosition)}%)
        </span>
        <span className="text-[11px] text-[#A3A3A3]">Drag slider horizontally to inspect physical variations</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
          {returnedLabel} ({Math.round(100 - sliderPosition)}%)
        </span>
      </div>

      {/* Slider Viewport */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[560px] rounded-2xl overflow-hidden select-none border border-white/[0.08] bg-[#0E0E10] cursor-ew-resize group"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Layer 1: Returned Image (Full background) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={returnedImage}
          alt={returnedLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />

        {/* Layer 2: Original Image (Clipped from left using clip-path) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={originalImage}
          alt={originalLabel}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
          }}
        />

        {/* Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Draggable Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#18181B] border-2 border-white shadow-xl flex items-center justify-center text-white">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 9l-4 3 4 3m8-6l4 3-4 3" />
            </svg>
          </div>
        </div>

        {/* Overlay Badges */}
        <div className="absolute top-4 left-4 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-black/70 backdrop-blur-md border border-white/10 text-white shadow">
            ORIGINAL DISPATCH
          </span>
        </div>
        <div className="absolute top-4 right-4 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-black/70 backdrop-blur-md border border-white/10 text-[#D4A359] shadow">
            RETURNED INSPECTION
          </span>
        </div>
      </div>
    </div>
  );
}
