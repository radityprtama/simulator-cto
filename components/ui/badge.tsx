import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-[13px] font-semibold px-[10px] py-[4px] transition-colors focus:outline-none focus:ring-2 focus:ring-[--blue-deep]",
  {
    variants: {
      variant: {
        default:
          "bg-[--primary] text-[--on-primary]",
        secondary:
          "bg-[--surface] text-[--ink] border border-[--hairline]",
        outline:
          "text-[--ink] border border-[--hairline] bg-transparent",
        success:
          "bg-[--success-bg] text-[--success-text]",
        error:
          "bg-[--error]/10 text-[--error]",
        brand:
          "bg-[--blue-200] text-[--blue-700]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
