import * as React from "react"
import { cn } from "../../libs/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive"
  }
>(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "rounded-lg border p-4",
        {
          "bg-red-50 text-red-900 border-red-200": variant === "destructive",
          "bg-gray-50 text-gray-900 border-gray-200": variant === "default",
        },
        className
      )}
      {...props}
    />
  )
})
Alert.displayName = "Alert"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertDescription }