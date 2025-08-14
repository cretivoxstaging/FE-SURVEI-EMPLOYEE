"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Play, Download, MessageSquare, X } from 'lucide-react' // Tambahkan X dan MessageSquare
import { AppSidebar } from "@/components/app-sidebar"
import { PhysicalWorkEnvironmentChart } from "@/components/physical-work-environtment"
import { SalarySatisfactionChart } from "@/components/salary-chart"
import { AppreciationChart } from "@/components/appreciation-chart"
import { ChatInterface } from "@/components/ui/chat-interface"

export default function Page() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [isChatOpen, setIsChatOpen] = useState(false) // State untuk mengelola visibilitas chat

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

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
  const chartData = {
    physicalWorkEnvironment: [
      { category: "Very Satisfied", count: 15, percentage: 30 },
      { category: "Satisfied", count: 20, percentage: 40 },
      { category: "Neutral", count: 8, percentage: 16 },
      { category: "Dissatisfied", count: 5, percentage: 10 },
      { category: "Very Dissatisfied", count: 2, percentage: 4 },
    ],
    salary: [
      { category: "Very Satisfied", count: 8, percentage: 16 },
      { category: "Satisfied", count: 18, percentage: 36 },
      { category: "Neutral", count: 12, percentage: 24 },
      { category: "Dissatisfied", count: 8, percentage: 16 },
      { category: "Very Dissatisfied", count: 4, percentage: 8 },
    ],
    appreciation: [
      { category: "Always", count: 12, percentage: 24 },
      { category: "Often", count: 18, percentage: 36 },
      { category: "Sometimes", count: 15, percentage: 30 },
      { category: "Rarely", count: 3, percentage: 6 },
      { category: "Never", count: 2, percentage: 4 },
    ],
  }
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
        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Hi user ! Heres an overview of your data.</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Activate Survey
              </Button>
            </div>
          </div>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Employee</CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">50</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Survey Response</CardTitle>
                <FileText className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">39</div>
                <p className="text-xs text-gray-500 mt-1">Out of 50 employees</p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Survey Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-500 text-white hover:bg-green-600">Active</Badge>
                <p className="text-xs text-gray-500 mt-2">Last updated: 2024-01-15</p>
              </CardContent>
            </Card>
          </div>
          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full sm:w-fit grid-cols-2 bg-gray-100">
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-white">
                Reports
              </TabsTrigger>
            </TabsList>
            <TabsContent value="analytics" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Physical Work Environment Chart */}
                <div className="w-full">
                  <PhysicalWorkEnvironmentChart data={chartData.physicalWorkEnvironment} />
                </div>
                {/* Salary Satisfaction Chart */}
                <div className="w-full">
                  <SalarySatisfactionChart data={chartData.salary} />
                </div>
                {/* Appreciation Chart - Full Width */}
                <div className="w-full lg:col-span-2">
                  <AppreciationChart data={chartData.appreciation} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="mt-4 sm:mt-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold">Generate Reports</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Export survey data and analytics in various formats
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4">Recent Reports</h4>
                      <div className="space-y-3">
                        {recentReports.map((report) => (
                          <div
                            key={report.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
                          >
                            <span className="font-medium text-sm sm:text-base">{report.name}</span>
                            <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
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

        {/* Floating Chat Button and Chat Interface */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-4 z-50">
            <ChatInterface onClose={toggleChat} />
          </div>
        )}

        <Button
          onClick={toggleChat}
          className="fixed bottom-4 right-4 rounded-full p-4 shadow-lg z-50"
          size="icon"
          aria-label={isChatOpen ? "Tutup chat" : "Buka chat"}
        >
          {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </Button>
      </SidebarInset>
    </SidebarProvider>
  )
}
