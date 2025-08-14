import type React from "react"

interface AdminContentProps {
  children: React.ReactNode
}

export function AdminContent({ children }: AdminContentProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 min-h-full">{children}</div>
    </div>
  )
}
