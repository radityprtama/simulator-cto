import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-[14px] leading-[1.4] transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-[--blue-deep] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[--primary] text-[--on-primary] px-6 py-[11px] hover:bg-[--primary]/90",
        secondary: "bg-transparent text-[--ink] border border-[--ink] px-6 py-[11px] hover:bg-[--surface]",
        outline: "bg-transparent text-[--ink] border border-[--hairline] px-6 py-[11px] hover:bg-[--surface]",
        ghost: "bg-transparent text-[--ink] hover:bg-[--surface]",
      },
      size: {
        default: "",
        xs: "px-3 py-1 text-xs",
        sm: "px-4 py-2 text-xs",
        lg: "px-8 py-4 text-base",
        icon: "size-10 p-0 flex items-center justify-center",
        "icon-xs": "size-6 p-0 flex items-center justify-center",
        "icon-sm": "size-8 p-0 flex items-center justify-center",
        "icon-lg": "size-12 p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
