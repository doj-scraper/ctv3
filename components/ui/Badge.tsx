// components/ui/Badge.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'accent' | 'outline' | 'destructive'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: "bg-ct-bg-secondary text-ct-text-secondary border-ct-text-secondary/20",
    accent: "bg-ct-accent/10 text-ct-accent border-ct-accent/20",
    outline: "text-ct-text border-ct-text-secondary/20",
    destructive: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
