"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { User, Shield, Menu, X, Settings, LayoutDashboard as Dashboard } from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Dashboard,
    description: "Trang dashboard",
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: User,
    description: "Quản lý danh sách người dùng hệ thống",
  },
  {
    title: "Quản lý Role & Permission",
    href: "/admin/roles",
    icon: Shield,
    description: "Quản lý vai trò và quyền hạn",
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const SidebarButton = ({ item, isActive }: { item: (typeof menuItems)[0]; isActive: boolean }) => {
    const Icon = item.icon

    const button = (
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start transition-all duration-200 group relative overflow-hidden h-10",
          isCollapsed ? "px-3" : "px-4",
          isActive
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm border border-blue-200"
            : "hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        {/* Active indicator */}
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />}

        <Icon
          className={cn(
            "flex-shrink-0 transition-all duration-200",
            isCollapsed ? "h-5 w-5 mx-auto" : "h-4 w-4 mr-3",
            isActive ? "text-blue-600" : "text-gray-600 group-hover:text-gray-900",
          )}
        />

        {!isCollapsed && <span className="truncate font-medium transition-all duration-200 text-sm">{item.title}</span>}
      </Button>
    )

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <p>{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "relative flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out shadow-sm",
          isCollapsed ? "w-16" : "w-64",
          "md:relative absolute z-50 h-full",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white h-16",
            isCollapsed ? "justify-center px-2" : "justify-between px-4", // reduced padding when collapsed
          )}
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Admin Panel</h2>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hover:bg-gray-100 transition-all duration-200 flex-shrink-0",
              isCollapsed ? "h-10 w-10 p-0" : "h-8 w-8 p-0", // larger button when collapsed for better proportion
            )}
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-4 w-4" />} {/* larger icon when collapsed */}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href} className="block">
                  <SidebarButton item={item} isActive={isActive} />
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </TooltipProvider>
  )
}
