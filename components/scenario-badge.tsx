import React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ScenarioBadgeProps {
  type: "crisis" | "technical" | "talent" | "political" | "opportunity" | "routine"
  urgency: "low" | "medium" | "high" | "critical"
  className?: string
}

export function ScenarioBadge({
  type,
  urgency,
  className,
}: ScenarioBadgeProps) {
  // Scenario type styles map
  const typeStyles = {
    crisis: "bg-[--coral] text-white border-0",
    technical: "bg-[--blue] text-white border-0",
    talent: "bg-[--magenta] text-white border-0",
    political: "bg-[--purple] text-white border-0",
    opportunity: "bg-green-600 text-white border-0",
    routine: "bg-[--surface] text-[--steel] border border-[--hairline]",
  }[type] || "bg-[--surface] text-[--steel] border border-[--hairline]"

  // Urgency styles map
  const urgencyStyles = {
    critical: "bg-[--coral]/15 text-[--coral] border-0",
    high: "bg-amber-100 text-amber-700 border-0",
    medium: "bg-[--blue-200] text-[--blue-700] border-0",
    low: "bg-[--surface] text-[--steel] border border-[--hairline]",
  }[urgency] || "bg-[--surface] text-[--steel] border border-[--hairline]"

  // Display names
  const typeLabels = {
    crisis: "CRISIS",
    technical: "TECHNICAL",
    talent: "TALENT",
    political: "POLITICAL",
    opportunity: "OPPORTUNITY",
    routine: "ROUTINE",
  }[type] || type.toUpperCase()

  const urgencyLabels = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  }[urgency] || urgency

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Badge className={cn("text-[11px] uppercase py-[2px] px-[8px] font-semibold tracking-wider", typeStyles)}>
        {typeLabels}
      </Badge>
      <Badge className={cn("text-[11px] py-[2px] px-[8px] font-semibold", urgencyStyles)}>
        {urgencyLabels}
      </Badge>
    </div>
  )
}
