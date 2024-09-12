import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "default" | "outline" | "destructive";
}

const defaultStyles = "disabled:opacity-50"

const buttonVariants: Record<ButtonProps["variant"], string> = {
  default: "rounded-md bg-primary px-4 py-2 text-white",
  outline: "rounded-md border border-primary px-4 py-2 text-primary",
  destructive: "rounded-md bg-red-500 px-4 py-2 text-white",
}

export function Button({ className, children, variant = "default", ...props }: ButtonProps) {

  return (
    <button className={cn(defaultStyles, buttonVariants[variant], className)} {...props}>
      {children}
    </button>
  )
}
