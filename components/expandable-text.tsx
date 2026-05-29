"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface ExpandableTextProps {
  text: string
  clamp?: 1 | 2 | 3 | 4
  maxExpandedHeight?: string
  className?: string
}

export function ExpandableText({
  text,
  clamp = 3,
  maxExpandedHeight = "200px",
  className,
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Clamp class mapping
  const clampClass = {
    1: "line-clamp-1",
    2: "line-clamp-2",
    3: "line-clamp-3",
    4: "line-clamp-4",
  }[clamp]

  return (
    <div className={cn("relative flex flex-col items-start gap-1 w-full", className)}>
      <div
        className={cn(
          "w-full transition-all duration-300 relative",
          isExpanded
            ? "overflow-y-auto"
            : cn("overflow-hidden", clampClass)
        )}
        style={isExpanded ? { maxHeight: maxExpandedHeight } : undefined}
      >
        <span className="whitespace-pre-wrap">{text}</span>
        
        {/* Fade gradient overlay at the bottom if collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-[--canvas] pointer-events-none" />
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-semibold text-[--blue-deep] cursor-pointer hover:underline mt-1 focus:outline-none focus:ring-1 focus:ring-[--blue-deep] rounded"
      >
        {isExpanded ? "Collapse ↑" : "Read more ↓"}
      </button>
    </div>
  )
}
