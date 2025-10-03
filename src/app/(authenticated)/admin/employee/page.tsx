"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppSidebar } from "@/components/app-sidebar"
import { Search, Calendar, X } from "lucide-react"
import { useEmployee } from "@/hooks/use-employee"
import { useSurveyResults } from "@/hooks/use-survey-results"
import { SurveyResultsDialog } from "@/components/survey-results-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  id: string
  name: string
  email: string
  job_position: string
  department: string
  branch: string
  status: "Active" | "Inactive"
  employee_status?: string
  hasSurvey?: boolean
  surveyResult?: {
    id: number
    createdAt: string
    employeeID: string
    name: string
    surveyResult: {
      date: string
      dataResult: {
        answer: string[]
        section: string
        question: string[]
      }[]
      conclutionResult: string
    }[]
    conclutionResult: string
  } | null
}

export default function EmployeePage() {
  const { employees = [], isLoading } = useEmployee()
  const { getAllSurveyResults } = useSurveyResults()

  // Debug logging
  console.log("📊 Employee Page - Survey Results:", getAllSurveyResults.data?.data)
  console.log("📊 Employee Page - Survey Loading:", getAllSurveyResults.isLoading)
  console.log("📊 Employee Page - Survey Error:", getAllSurveyResults.error)
  const [searchTerm, setSearchTerm] = useState("")
  const [employeesWithSurvey, setEmployeesWithSurvey] = useState<Employee[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("all")

  // Get available years for the year filter
  const availableYears = employeesWithSurvey
    .filter(emp => emp.hasSurvey && emp.surveyResult && Array.isArray(emp.surveyResult.surveyResult))
    .map(emp => {
      try {
        // Get the latest submission date
        const latestSubmission = emp.surveyResult!.surveyResult[emp.surveyResult!.surveyResult.length - 1]
        const createdAt = latestSubmission?.date || emp.surveyResult!.createdAt
        // Parse DD/MM/YYYY - HH:MM format
        const dateMatch = createdAt.match(/(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})/)
        if (dateMatch) {
          const [, , , year] = dateMatch
          return year
        }
        return null
      } catch {
        return null
      }
    })
    .filter((year): year is string => year !== null)
    .filter((year, index, self) => self.indexOf(year) === index)
    .sort((a, b) => b.localeCompare(a)) // Sort descending (newest first)

  // load survey responses from API and merge with employee data
  useEffect(() => {
    if (employees.length > 0) {
      if (getAllSurveyResults.data?.data) {
        // Survey data is available
        const surveyResults = getAllSurveyResults.data.data

        const merged = employees
          ?.filter((emp: Employee) => emp.employee_status !== "Resign") // Filter out resigned employees
          ?.map((emp: Employee) => {
            // Find survey result for this employee
            const surveyResult = surveyResults.find(
              (survey: { employeeID: string }) => survey.employeeID === String(emp.id)
            )

            // Check if employee has survey data
            const hasSurvey = surveyResult &&
              Array.isArray(surveyResult.surveyResult) &&
              surveyResult.surveyResult.length > 0

            console.log(`🔍 Employee ${emp.id} (${emp.name}) - Survey Result:`, {
              hasSurvey,
              surveyResult: surveyResult?.surveyResult,
              latestSubmission: surveyResult?.surveyResult?.[surveyResult.surveyResult.length - 1]
            })

            return {
              ...emp,
              hasSurvey,
              surveyResult: hasSurvey ? surveyResult : null,
            }
          })
        console.log("📊 Merged employees with survey data:", merged)
        setEmployeesWithSurvey(merged)
      } else {
        // No survey data available (either loading failed or no surveys exist yet)
        // Set all employees as no survey so they still appear in the table
        const merged = employees
          .filter((emp: Employee) => emp.employee_status !== "Resign") // Filter out resigned employees
          .map((emp: Employee) => ({
            ...emp,
            hasSurvey: false,
            surveyResult: null,
          }))
        console.log("📊 No survey results available, setting all employees as no survey:", merged)
        setEmployeesWithSurvey(merged)
      }
    }
  }, [employees, getAllSurveyResults.data, getAllSurveyResults.isError])


  // Filter employees by search term and year
  const filteredEmployees = employeesWithSurvey.filter((employee) => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase())

    // If no year filter applied or "all" selected, return search results
    if (!selectedYear || selectedYear === "all") {
      return matchesSearch
    }

    // If employee has no survey, only show if no year filter applied
    if (!employee.hasSurvey || !employee.surveyResult || !Array.isArray(employee.surveyResult.surveyResult) || employee.surveyResult.surveyResult.length === 0) {
      return matchesSearch && (!selectedYear || selectedYear === "all")
    }

    try {
      // Get the latest submission date
      const latestSubmission = employee.surveyResult.surveyResult[employee.surveyResult.surveyResult.length - 1]
      const createdAt = latestSubmission?.date || employee.surveyResult.createdAt
      console.log(`🔍 Filtering employee ${employee.name} with date: ${createdAt}`)

      // Parse DD/MM/YYYY - HH:MM format
      const dateMatch = createdAt.match(/(\d{2})\/(\d{2})\/(\d{4}) - (\d{2}):(\d{2})/)
      if (dateMatch) {
        const [, , , year] = dateMatch
        console.log(`✅ Survey year: ${year}, Selected Year: ${selectedYear}`)

        // Check year filter
        const matchesYear = year === selectedYear

        return matchesSearch && matchesYear
      } else {
        console.warn('Date format not recognized for filtering:', createdAt)
        return false
      }
    } catch (error) {
      console.warn('Error parsing survey date for employee:', employee.name, error)
      return false
    }
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employee</h1>
              <p className="text-gray-600">Easily track and manage all employee data.</p>
              {selectedYear && selectedYear !== "all" && (
                <p className="text-sm text-blue-600 mt-1">
                  📅 Filtered by survey year: <strong>{selectedYear}</strong>
                  ({filteredEmployees.filter(emp => emp.hasSurvey).length} employees with surveys in {selectedYear})
                </p>
              )}
              {getAllSurveyResults.isError && (
                <p className="text-sm text-orange-600 mt-1">
                  ⚠️ Survey data unavailable - showing employees without survey status
                </p>
              )}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Employee Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Filter by Year:
                </label>
              </div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[180px] bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{year}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedYear && selectedYear !== "all" && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedYear("all")}
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>


          {/* Employee Table */}
          <div className="bg-white">
            <div className="p-4 border-b">
              <h3 className="font-semibold">All Employees</h3>
            </div>
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status Survey</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading employees...
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No employees found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((employee, index) => (
                    <TableRow key={employee.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.job_position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.branch}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            employee.hasSurvey
                              ? "bg-black text-white"
                              : "bg-gray-200 text-gray-700"
                          }
                        >
                          {employee.hasSurvey ? "Submitted" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {employee.hasSurvey ? (
                          <SurveyResultsDialog
                            surveyId={employee.surveyResult?.id}
                            employeeId={employee.id}
                            employeeName={employee.name}
                          >
                            <Button
                              className="bg-black text-white hover:bg-gray-800"
                              size="sm"
                            >
                              View Survey
                            </Button>
                          </SurveyResultsDialog>
                        ) : (
                          <Badge className="bg-gray-200 text-gray-700">No Survey</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
