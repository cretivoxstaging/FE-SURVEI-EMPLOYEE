"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, X, UserX, HelpCircle } from 'lucide-react'
import { HeaderNavigation } from "@/components/header-navigation"
import { PhysicalWorkEnvironmentChart } from "@/components/physical-work-environtment"
import { SalarySatisfactionChart } from "@/components/salary-chart"
import { AppreciationChart } from "@/components/appreciation-chart"
import { SurveyChatInterface } from "@/components/ui/survey-chat-interface"
import { useEmployee } from "@/hooks/use-employee"
import { useActiveSurvey } from "@/hooks/use-active-survey"
import { useSimpleChartData } from "@/hooks/use-simple-chart-data"
import { YearFilterDropdown } from "@/components/year-filter-dropdown"
import { YearlySurveyStats } from "@/components/yearly-survey-stats"
import { useYearlySurveyData } from "@/hooks/use-yearly-survey-data"
import { useQuestions } from "@/hooks/use-questions"

export default function Page() {

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState("")
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined)
  const { isActiveSurvey, toggleSurvey } = useActiveSurvey(true)
  const { employees, isLoading, isError } = useEmployee()
  const {
    isLoading: surveyLoading,
    isError: surveyError,
    getPhysicalWorkEnvironmentData,
    getSalaryData,
    getAppreciationData,
    getAvailableYears,
  } = useSimpleChartData(selectedYear)

  // Get questions data for total questions count
  const { questions: allQuestions, isLoading: questionsLoading } = useQuestions("", "", { enabled: true })

  const toggleChat = () => setIsChatOpen(!isChatOpen)

  // Set current date only on client side to avoid hydration mismatch
  useEffect(() => {
    const date = new Date()
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    setCurrentDate(formattedDate)
  }, [])

  // Get yearly survey data
  const { yearlyData } = useYearlySurveyData(employees || [])

  const totalEmployees = employees?.filter((emp: { employee_status: string }) => emp.employee_status !== "Resign").length || 0

  // Get real chart data from survey results
  const chartData = {
    physicalWorkEnvironment: getPhysicalWorkEnvironmentData(),
    salary: getSalaryData(),
    appreciation: getAppreciationData(),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNavigation />

      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Survey Satisfaction</h1>
                <p className="text-lg font-medium text-gray-600 mt-1">Employee Survey Analytics & Insights</p>
                {/* Show loading/error status in header instead of blocking content */}
                {(isLoading || surveyLoading || questionsLoading) && (
                  <p className="text-xs text-blue-600 mt-1">🔄 Loading data...</p>
                )}
                {(isError || surveyError) && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Some data unavailable - showing available information</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <YearFilterDropdown
                  availableYears={getAvailableYears()}
                  selectedYear={selectedYear}
                  onYearChange={setSelectedYear}
                />
                <Button onClick={toggleSurvey} className="bg-black text-white hover:bg-gray-800">
                  {isActiveSurvey ? "Deactivate Survey" : "Activate Survey"}
                </Button>
              </div>
            </div>

            {/* Metrics Grid - Modern Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
              <Card className="relative overflow-hidden bg-white border-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">{totalEmployees}</div>
                  <p className="text-xs text-blue-600 mt-1">Active workforce</p>
                </CardContent>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              </Card>

              <Card className="relative overflow-hidden bg-white border-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Survey Responses</CardTitle>
                  <FileText className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">1</div>
                  <p className="text-xs text-green-600 mt-1">5% completion rate</p>
                </CardContent>
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              </Card>

              <Card className="relative overflow-hidden bg-white border-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Not Responded</CardTitle>
                  <UserX className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900">{totalEmployees - 1}</div>
                  <p className="text-xs text-orange-600 mt-1">Employees pending response</p>
                </CardContent>
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              </Card>

              <Card className="relative overflow-hidden bg-white border-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-indigo-700">Total Questions</CardTitle>
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-900">{allQuestions?.length || 0}</div>
                  <p className="text-xs text-indigo-600 mt-1">Survey questions available</p>
                </CardContent>
                <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              </Card>

              <Card className="relative overflow-hidden bg-white border-2 border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Survey Status</CardTitle>
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Last updated: {currentDate}</p>
                </CardContent>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
              </Card>
            </div>

            {/* Main Content Area - Analytics Only */}
            <div className="space-y-6">
              {/* Charts Grid - 3 Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading || surveyLoading ? (
                  <div className="col-span-full flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading chart data...</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Employees: {isLoading ? "Loading..." : `${employees?.length || 0} loaded`} |
                        Survey: {surveyLoading ? "Loading..." : "Ready"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <PhysicalWorkEnvironmentChart data={chartData.physicalWorkEnvironment} />
                    <SalarySatisfactionChart data={chartData.salary} />
                    <AppreciationChart data={chartData.appreciation} />
                  </>
                )}
              </div>
            </div>

            {/* Yearly Survey Statistics */}
            {yearlyData.length > 0 && (
              <div className="mt-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Yearly Survey Analytics</h2>
                  <p className="text-gray-600">Track survey performance across different years and months</p>
                </div>
                <YearlySurveyStats data={yearlyData} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Button and Survey Chat Interface */}
      {isChatOpen && (
        <div className="fixed bottom-2 right-2 sm:bottom-20 sm:right-4 z-50">
          <SurveyChatInterface onClose={toggleChat} />
        </div>
      )}

      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 rounded-full p-3 sm:p-4 shadow-lg z-40 w-12 h-12 sm:w-14 sm:h-14"
        size="icon"
        aria-label={isChatOpen ? "Tutup chat" : "Buka chat"}
      >
        {isChatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </div>
  )
}
