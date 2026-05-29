import React from "react"
import { cn } from "@/lib/utils"

interface WeekGridProps {
  week: number // 1 to 12
  className?: string
}

export function WeekGrid({
  week,
  className,
}: WeekGridProps) {
  const totalWeeks = 12

  return (
    <div className={cn("flex flex-col gap-2 w-fit", className)}>
      <div className="grid grid-cols-4 gap-1.5 w-fit">
        {Array.from({ length: totalWeeks }).map((_, index) => {
          const cellWeek = index + 1
          const isCompleted = cellWeek < week
          const isCurrent = cellWeek === week

          return (
            <div
              key={index}
              className={cn(
                "w-[18px] h-[18px] rounded-[4px] transition-all",
                isCompleted && "bg-[--primary]",
                isCurrent && "bg-[--coral] animate-pulse",
                !isCompleted && !isCurrent && "bg-[--hairline]"
              )}
            />
          )
        })}
      </div>
      
      <span className="text-xs text-[--slate]">
        Week {Math.min(totalWeeks, Math.max(1, week))} of 12
      </span>
    </div>
  )
}
