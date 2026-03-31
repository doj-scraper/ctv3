// components/ui/Button.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: "bg-ct-accent text-ct-bg hover:shadow-glow",
      secondary: "bg-ct-bg-secondary text-ct-text hover:bg-ct-bg-secondary/80",
      outline: "border border-ct-accent text-ct-accent hover:bg-ct-accent/10",
      ghost: "text-ct-text-secondary hover:text-ct-text hover:bg-ct-bg-secondary",
    }
    
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    }

    return (
        <button
          ref={ref}
          className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ct-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ct-bg disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
