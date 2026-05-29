import React from "react"
import { cn } from "@/lib/utils"

interface VibrantCardProps {
  color: "coral" | "blue" | "magenta" | "purple" | "black"
  children: React.ReactNode
  className?: string
}

export function VibrantCard({
  color,
  children,
  className,
}: VibrantCardProps) {
  const bgStyle = {
    coral: "bg-[--coral]",
    blue: "bg-[--blue]",
    magenta: "bg-[--magenta]",
    purple: "bg-[--purple]",
    black: "bg-[--primary]",
  }[color] || "bg-[--primary]"

  return (
    <div
      className={cn(
        "rounded-[32px] p-8 text-white overflow-hidden relative shadow-none border-0",
        bgStyle,
        className
      )}
    >
      {/* Internal radial gradient overlay (decorative depth — no external shadow) */}
      <div
        className="absolute inset-0 rounded-[32px] pointer-events-none"
        style={{
          background: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 60%)"
        }}
      />
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </div>
  )
}
