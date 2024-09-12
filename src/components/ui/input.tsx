import { cn } from "@/lib/utils"



type InputProps = React.InputHTMLAttributes<HTMLInputElement>


export function Input({ className, ...props }: InputProps) {
  return (
    <input className={cn("border-primary border-solid border-2 rounded-md px-4 py-2", className)} {...props} />
  )
}
