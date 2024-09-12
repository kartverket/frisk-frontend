import { cn } from "@/lib/utils";



export function Main({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <main className={cn("bg-gray-50 h-full w-full", className)}>
      {children}
    </main>
  )
}
