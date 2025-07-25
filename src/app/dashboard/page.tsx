"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Play, Download } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"

export default function Page() {
  const [activeTab, setActiveTab] = useState("analytics")

  const recentReports = [
    {
      name: "Employee Survey Report 2025",
      id: "report-2025",
    },
    {
      name: "Employee Survey Report 2024",
      id: "report-2024",
    },
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex-1" />
          <div className="px-4">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Hi user ! Here an overview of your data.</p>
            </div>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Play className="w-4 h-4 mr-2" />
              Activate Survey
            </Button>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Employee</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">50</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Survey Response</CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold">39</div>
                <p className="text-xs text-gray-500 mt-1">Out of 50 employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Survey Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-500 text-white hover:bg-green-600 rounded-full px-4 py-2 text-xl">Active</Badge>
                <p className="text-xs text-gray-500 mt-2">Last updated: 2024-01-15</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-fit grid-cols-2 bg-gray-100">
              <TabsTrigger value="analytics" className="cursor-pointer data-[state=active]:bg-white">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="cursor-pointer data-[state=active]:bg-white">
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="mt-6">
              <Card className="min-h-[400px]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Analytics content will be displayed here
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold">Generate Reports</h3>
                      <p className="text-gray-600">Export survey data and analytics in various formats</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Recent Reports</h4>
                      <div className="space-y-3">
                        {recentReports.map((report) => (
                          <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <span className="font-medium">{report.name}</span>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
