"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MetricBarProps {
  label: string
  value: number
  icon?: React.ReactNode
  showValue?: boolean
  className?: string
  invertColorLogic?: boolean
}

export function MetricBar({
  label,
  value,
  icon,
  showValue = true,
  className,
  invertColorLogic = false,
}: MetricBarProps) {
  // MiniMax color logic based on the spec:
  // value > 60 -> blue
  // 40-60 -> amber
  // < 40 -> coral
  // < 20 -> coral + pulse
  
  // Wait, if invertColorLogic is true (e.g. for Technical Debt where high is bad),
  // we can invert the values.
  const adjustedValue = invertColorLogic ? 100 - value : value;

  let colorClass = "text-[--blue]";
  let pulseClass = "";

  if (adjustedValue < 20) {
    colorClass = "text-[--error]";
    pulseClass = "animate-pulse";
  } else if (adjustedValue < 40) {
    colorClass = "text-[--error]";
  } else if (adjustedValue <= 60) {
    colorClass = "text-amber-500";
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-1.5 font-medium text-[--slate]">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{label}</span>
        </span>
        {showValue && (
          <span className={cn("font-semibold transition-all duration-300 ease-out", colorClass, pulseClass)}>
            {value}%
          </span>
        )}
      </div>
      
      {/* Progress uses its own internal color logic which maps to this adjusted value, 
          but we pass value directly to it. Let's make sure that Progress uses the inverted calculation 
          if it represents Technical Debt. Let's pass the adjustedValue as progress value if needed, 
          but actually standard Progress component determines colors from its value prop. 
          So for Progress to color technical debt correctly (high debt = bad = red/coral), 
          we should pass adjustedValue so that high debt gets colored red.
          Wait, let's verify: "Note: Tech Debt bar is INVERTED (red = high debt)".
          Yes! If Tech Debt value is 70, then adjustedValue is 30, which is < 40 -> colored red.
          If Tech Debt value is 20, then adjustedValue is 80, which is > 60 -> colored blue (low debt = good).
          So passing the adjustedValue to Progress is EXACTLY correct!
      */}
      <Progress 
        value={adjustedValue} 
        className={cn("h-1.5 transition-all duration-300 ease-out", pulseClass)} 
      />
    </div>
  )
}
