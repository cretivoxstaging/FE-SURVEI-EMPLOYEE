"use client"

import { useEffect, useReducer, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, FileText, Play, Download, MessageSquare, X } from 'lucide-react'
import { AppSidebar } from "@/components/app-sidebar"
import { PhysicalWorkEnvironmentChart } from "@/components/physical-work-environtment"
import { SalarySatisfactionChart } from "@/components/salary-chart"
import { AppreciationChart } from "@/components/appreciation-chart"
import { ChatInterface } from "@/components/ui/chat-interface"
import { useEmployee } from "@/hooks/use-employee"
import { useActiveSurvey } from "@/hooks/use-active-survey"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function Page() {
  const [activeTab, setActiveTab] = useState("analytics")
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { isActiveSurvey, toggleSurvey } = useActiveSurvey(true)
  const { employees, isLoading, isError, error } = useEmployee()
  const { user, login, logout } = useAuth();
  
  const toggleChat = () => setIsChatOpen(!isChatOpen)

  const totalEmployees = employees?.length || 0
  //@ts-ignore
  const surveyResponses = employees?.filter(e => e.surveyCompleted)?.length || 0

  const recentReports = [
    { id: "r2025", name: "Employee Survey Report 2025" },
    { id: "r2024", name: "Employee Survey Report 2024" },
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
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
          <div>
            <Button onClick={toggleSurvey} className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              {isActiveSurvey ? "Deactive Survey" : "Active Survey"}
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-4 sm:p-6">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading Dashboard...</div>
          ) : isError ? (
            <div className="p-4 text-red-500">Error: {error?.message}</div>
          ) : (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Employee</CardTitle>
                    <Users className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">{totalEmployees}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Survey Response</CardTitle>
                    <FileText className="h-4 w-4 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold">{surveyResponses}</div>
                    <p className="text-xs text-gray-500 mt-1">Out of {totalEmployees} employees</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Survey Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={isActiveSurvey ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                      {isActiveSurvey ? "Active" : "Inactive"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="grid w-full sm:w-fit grid-cols-2 bg-gray-100">
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-white">Analytics</TabsTrigger>
                  <TabsTrigger value="reports" className="data-[state=active]:bg-white">Reports</TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <PhysicalWorkEnvironmentChart data={chartData.physicalWorkEnvironment} />
                    <SalarySatisfactionChart data={chartData.salary} />
                    <div className="lg:col-span-2">
                      <AppreciationChart data={chartData.appreciation} />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-4 sm:mt-6">
                  <div className="space-y-3">
                    {recentReports.map(report => (
                      <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                        <span className="font-medium">{report.name}</span>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </SidebarInset>
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
    </SidebarProvider>
  )
}

