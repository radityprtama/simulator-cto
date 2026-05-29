"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "@/lib/utils"

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  const val = typeof value === "number" ? value : 0;
  
  let indicatorColor = "bg-[--blue]";
  if (val < 20) {
    indicatorColor = "bg-[--coral] animate-pulse";
  } else if (val < 40) {
    indicatorColor = "bg-[--coral]";
  } else if (val <= 60) {
    indicatorColor = "bg-amber-400";
  }

  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("w-full", className)}
      {...props}
    >
      {children}
      <ProgressPrimitive.Track
        className="relative block h-1.5 w-full overflow-hidden rounded-full bg-[--hairline]"
        data-slot="progress-track"
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn("h-full transition-all duration-300 ease-out", indicatorColor)}
          style={{ width: `${val}%` }}
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  )
}

export { Progress }
