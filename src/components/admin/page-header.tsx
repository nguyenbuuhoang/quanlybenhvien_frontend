"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  showBackButton?: boolean
}

export function PageHeader({ title, description, action, showBackButton = false }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in-0 slide-in-from-top-4 duration-500">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      {action && <div className="animate-in fade-in-0 slide-in-from-right-4 duration-500 delay-150">{action}</div>}
    </div>
  )
}
