"use client"

import * as React from "react"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  Home,
  Settings,
  Upload,
  Download,
  Printer,
  Trash2,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Lightbulb,
  Activity
} from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "#analytics", 
    icon: BarChart3,
  },
  {
    title: "Engagement",
    url: "#engagement",
    icon: TrendingUp,
  },
  {
    title: "Timing Insights",
    url: "#timing",
    icon: Calendar,
  },
  {
    title: "Top Posts",
    url: "#top-posts",
    icon: Target,
  },
  {
    title: "Peer Comparison",
    url: "#peer-comparison",
    icon: Users,
  },
  {
    title: "AI Insights",
    url: "#ai-insights",
    icon: Lightbulb,
  },
]

const sidebarActions = [
  {
    title: "Upload CSV",
    icon: Upload,
    action: "upload",
  },
  {
    title: "Download PDF",
    icon: Download,
    action: "download",
  },
  {
    title: "Print Report",
    icon: Printer,
    action: "print",
  },
  {
    title: "Clear Data",
    icon: Trash2,
    action: "clear",
  },
]

export function AppSidebar({ onAction, onNavigate, ...props }) {
  const handleNavigation = (sectionId) => {
    console.log('Navigating to:', sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (onNavigate) {
      onNavigate(sectionId)
    }
  }

  const handleAction = (action) => {
    console.log('Action clicked:', action)
    if (onAction) {
      onAction(action)
    }
  }

  React.useEffect(() => {
    console.log('✅ Sidebar ready')
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">LinkedIn Analytics</span>
            <span className="text-xs text-muted-foreground">Yearly Wrap</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="w-full justify-start"
                    onClick={() => handleNavigation(item.url.replace('#', ''))}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator />

        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton
                    tooltip={action.title}
                    className="w-full justify-start"
                    onClick={() => handleAction(action.action)}
                  >
                    <action.icon />
                    <span>{action.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}
