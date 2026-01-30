import { useEffect } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "../../lib/utils"

export interface NavItem {
  name: string
  id: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
}

export function TubeLightNavbar({ items, activeId, onChange, className }: NavBarProps) {
  useEffect(() => {
    // Keep internal handleResize for potential future mobile-specific logic
    // but without causing unused state warnings
    const handleResize = () => {}
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-8 sm:top-0 left-1/2 -translate-x-1/2 z-50 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-hayl-surface/80 border border-hayl-border backdrop-blur-xl py-2 px-2 rounded-full shadow-premium">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeId === item.id

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative cursor-pointer text-xs font-heading font-black px-6 py-2.5 rounded-full transition-all uppercase tracking-widest",
                "text-hayl-muted hover:text-hayl-text",
                isActive && "text-hayl-text",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden flex items-center justify-center">
                <Icon size={20} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-hayl-text/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-hayl-text rounded-t-full">
                    <div className="absolute w-12 h-6 bg-hayl-text/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-hayl-text/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-hayl-text/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
