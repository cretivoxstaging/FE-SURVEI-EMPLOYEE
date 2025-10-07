'use client'
import * as React from "react"
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
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

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import Image from "next/image"

const menuData = {
  general: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Employee", url: "/admin/employee", icon: Users },
  ],
  surveyManagement: [
    { title: "Survey Configuration", url: "/admin/survey/configuration", icon: FileText },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [isLogoutOpen, setIsLogoutOpen] = React.useState(false)
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsLogoutOpen(false)
    window.location.href = "/auth/login"
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200">
            <LayoutDashboard className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <Image src="/CBN-logo.jpg" className="font-semibold text-lg" alt="CBN" width={100} height={100} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          {/* Sidebar Groups */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 text-sm font-medium">General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuData.general.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className={`${pathname === item.url ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}
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
                      className={`${pathname === item.url ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}
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
        </div>

        {/* Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <SidebarMenu>
            {/* Logout */}
            <SidebarMenuItem>
              <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
                <DialogTrigger asChild>
                  <SidebarMenuButton asChild className="text-gray-600 hover:bg-gray-100 flex items-center gap-2">
                    <button type="button">
                      <LogOut className="size-4" />
                      <span>Logout</span>
                    </button>
                  </SidebarMenuButton>
                </DialogTrigger>

                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                  </DialogHeader>
                  <div className="py-2 text-gray-700">
                    Are you sure you want to logout?
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleLogout}>Logout</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
