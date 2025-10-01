"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, FileText, TrendingUp } from "lucide-react"

interface YearlyStats {
  year: string
  totalSubmissions: number
  totalEmployees: number
  completionRate: number
  months: {
    month: string
    submissions: number
  }[]
}

interface YearlySurveyStatsProps {
  data: YearlyStats[]
}

export function YearlySurveyStats({ data }: YearlySurveyStatsProps) {
  const currentYear = new Date().getFullYear().toString()
  const currentYearData = data.find(d => d.year === currentYear)
  const previousYearData = data.find(d => d.year === (currentYear - 1).toString())

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (rate >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  const getMonthName = (monthNumber: string) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    return months[parseInt(monthNumber) - 1] || monthNumber
  }

  return (
    <div className="space-y-6">
      {/* Current Year Overview */}
      {currentYearData && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar className="w-5 h-5" />
              Current Year ({currentYear}) Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{currentYearData.totalSubmissions}</div>
                <div className="text-sm text-blue-700">Total Submissions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{currentYearData.totalEmployees}</div>
                <div className="text-sm text-blue-700">Total Employees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">{currentYearData.completionRate}%</div>
                <div className="text-sm text-blue-700">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year Comparison */}
      {currentYearData && previousYearData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Year-over-Year Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Submissions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{currentYear}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{currentYearData.totalSubmissions}</span>
                      <Badge className="bg-blue-100 text-blue-800">Current</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{currentYear - 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{previousYearData.totalSubmissions}</span>
                      <Badge className="bg-gray-100 text-gray-800">Previous</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Completion Rate</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{currentYear}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{currentYearData.completionRate}%</span>
                      <Badge className={getCompletionRateColor(currentYearData.completionRate)}>
                        {currentYearData.completionRate >= 80 ? "Excellent" :
                          currentYearData.completionRate >= 60 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{currentYear - 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{previousYearData.completionRate}%</span>
                      <Badge className={getCompletionRateColor(previousYearData.completionRate)}>
                        {previousYearData.completionRate >= 80 ? "Excellent" :
                          previousYearData.completionRate >= 60 ? "Good" : "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown */}
      {currentYearData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Monthly Breakdown ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentYearData.months.map((month) => (
                <div key={month.month} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{getMonthName(month.month)}</div>
                  <div className="text-2xl font-bold text-gray-900">{month.submissions}</div>
                  <div className="text-xs text-gray-500">submissions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Years Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Years Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((yearData) => (
              <div key={yearData.year} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-900">{yearData.year}</div>
                  <div className="text-sm text-gray-600">
                    {yearData.totalSubmissions} submissions from {yearData.totalEmployees} employees
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCompletionRateColor(yearData.completionRate)}>
                    {yearData.completionRate}% completion
                  </Badge>
                  {yearData.year === currentYear && (
                    <Badge className="bg-blue-100 text-blue-800">Current Year</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
