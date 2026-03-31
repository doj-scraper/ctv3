// components/ui/Input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
        <input
          type={type}
          className={cn(
          "flex h-10 w-full rounded-md border border-ct-text-secondary/20 bg-ct-bg-secondary px-3 py-2 text-sm text-ct-text placeholder:text-ct-text-secondary/50 transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ct-bg disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
