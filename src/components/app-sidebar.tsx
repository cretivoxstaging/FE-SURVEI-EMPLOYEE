import type * as React from "react"
import { LayoutDashboard, Users, FileText } from "lucide-react"
import { usePathname } from "next/navigation" // Import usePathname untuk mendapatkan URL saat ini

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Data menu untuk sidebar
const menuData = {
  general: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Employee",
      url: "/employee",
      icon: Users,
    },
  ],
  surveyManagement: [
    {
      title: "Survey Configuration",
      url: "/survey-configuration",
      icon: FileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // Dapatkan current pathname untuk menentukan item yang aktif

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-semibold text-lg">Dashboard</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-sm font-medium">General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.general.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}  // Periksa apakah pathname saat ini cocok dengan URL item
                    className={`
                      ${pathname === item.url ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}
                    `}
                  >
                    <a href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-sm font-medium">Survey Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuData.surveyManagement.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url} 
                    className={`
                      ${pathname === item.url ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}
                    `}
                  >
                    <a className="cursor-pointer" href={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
