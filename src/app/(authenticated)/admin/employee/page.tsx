"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppSidebar } from "@/components/app-sidebar"
import { Search, Calendar, X, Download } from "lucide-react"
import { useEmployee } from "@/hooks/use-employee"
import { useSurveyResults } from "@/hooks/use-survey-results"
import { SurveyResultsDialog } from "@/components/survey-results-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as XLSX from 'xlsx'
import { useQuestions } from "@/hooks/use-questions"
import { apiClient } from "@/lib/api-client"
import type { ConfigQuestion, ApiQuestion } from "@/types/survey"

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

  // Get questions for mapping
  const { questions: allQuestions } = useQuestions("", "", { enabled: true })

  const [searchTerm, setSearchTerm] = useState("")
  const [employeesWithSurvey, setEmployeesWithSurvey] = useState<Employee[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("all")

  // Function to export survey responses to Excel using same logic as Survey Results
  const exportToExcel = async () => {
    // Filter employees who have survey responses
    const employeesWithResponses = filteredEmployees.filter(emp => emp.hasSurvey && emp.surveyResult)

    if (employeesWithResponses.length === 0) {
      alert('No survey responses found to export.')
      return
    }

    console.log(`🔍 Starting Excel export for ${employeesWithResponses.length} employees`)

    // Create question map using same logic as Survey Results
    const questionMap = new Map<string, ConfigQuestion>()

    // Use processed questions first (same as Survey Results)
    allQuestions?.forEach((q) => {
      const stringId = String(q.id)
      questionMap.set(stringId, q)
      questionMap.set(q.id, q)
      if (typeof q.id === "number") {
        questionMap.set(String(q.id), q)
      }
    })


    // If we don't have processed questions, fetch raw API data
    if (questionMap.size === 0) {
      try {
        const response = await apiClient.get("/api/v1/question")
        const rawQuestions = response.data?.data || response.data || []

        rawQuestions.forEach((q: ApiQuestion) => {
          const stringId = String(q.id)
          const configQuestion: ConfigQuestion = {
            id: stringId,
            text: q.text || q.question || "",
            type: q.type === "multiple-choice" ? "multiple-choice" :
              q.type === "textarea" ? "textarea" :
                q.type === "rating" ? "rating" : "textarea",
            options: q.option ? Object.values(q.option) : undefined,
            required: Boolean(q.required),
          }
          questionMap.set(stringId, configQuestion)
          questionMap.set(String(q.id), configQuestion)
          if (typeof q.id === "number") {
            questionMap.set(String(q.id), configQuestion)
          }
        })
      } catch (error) {
        console.error("Failed to fetch questions for export:", error)
      }
    }

    console.log(`🔍 Question Map created:`, {
      totalQuestions: allQuestions?.length || 0,
      mapSize: questionMap.size,
      allKeys: Array.from(questionMap.keys()).sort((a, b) => Number(a) - Number(b)),
      sampleQuestions: Array.from(questionMap.values()).slice(0, 5).map(q => ({
        id: q.id,
        text: q.text?.substring(0, 50) + "...",
        type: q.type,
      }))
    })

    // Force fetch all questions to ensure we have complete coverage
    try {
      console.log("🔍 Force fetching all questions to ensure complete coverage...")
      const response = await apiClient.get("/api/v1/question")
      const rawQuestions = response.data?.data || response.data || []
      console.log(`🔍 Raw questions fetched:`, rawQuestions.length)

      rawQuestions.forEach((q: ApiQuestion) => {
        const stringId = String(q.id)
        if (!questionMap.has(stringId)) {
          const configQuestion: ConfigQuestion = {
            id: stringId,
            text: q.text || q.question || "",
            type: q.type === "multiple-choice" ? "multiple-choice" :
              q.type === "textarea" ? "textarea" :
                q.type === "rating" ? "rating" : "textarea",
            options: q.option ? Object.values(q.option) : undefined,
            required: Boolean(q.required),
          }
          questionMap.set(stringId, configQuestion)
          questionMap.set(String(q.id), configQuestion)
          if (typeof q.id === "number") {
            questionMap.set(String(q.id), configQuestion)
          }
        }
      })

      console.log(`🔍 Question Map after force fetch:`, {
        mapSize: questionMap.size,
        allKeys: Array.from(questionMap.keys()).sort((a, b) => Number(a) - Number(b)),
      })
    } catch (error) {
      console.error("Failed to force fetch questions:", error)
    }

    // First, collect all unique questions (section + question text) from all survey responses
    // Use Map with section+question as key to preserve all questions (including duplicates in different sections)
    const allQuestionKeys = new Map<string, { section: string; question: string; index: number }>()
    let questionIndex = 0

    employeesWithResponses.forEach(employee => {
      if (employee.surveyResult?.surveyResult && Array.isArray(employee.surveyResult.surveyResult)) {
        const latestSubmission = employee.surveyResult.surveyResult[employee.surveyResult.surveyResult.length - 1]
        if (latestSubmission?.dataResult && Array.isArray(latestSubmission.dataResult)) {
          latestSubmission.dataResult.forEach((sectionResult) => {
            if (sectionResult.question && Array.isArray(sectionResult.question)) {
              sectionResult.question.forEach((q, idx) => {
                const section = sectionResult.section || 'Unknown Section'
                const questionText = Array.isArray(q) ? q[0] : q // Handle both string and array
                if (questionText) {
                  // Create unique key: section + question + position
                  const uniqueKey = `${section}::${questionText}::${idx}`
                  if (!allQuestionKeys.has(uniqueKey)) {
                    allQuestionKeys.set(uniqueKey, {
                      section,
                      question: questionText,
                      index: questionIndex++
                    })
                  }
                }
              })
            }
          })
        }
      }
    })

    console.log(`🔍 All questions found (including duplicates):`, Array.from(allQuestionKeys.values()))
    console.log(`🔍 Total questions:`, allQuestionKeys.size)

    // Process data using same logic as Survey Results - directly from surveyResult.dataResult
    const excelData = employeesWithResponses.map((employee, index) => {
      const baseData: Record<string, string | number> = {
        'No': index + 1,
        'Employee Name': employee.name,
        'Email': employee.email,
        'Position': employee.job_position,
        'Department': employee.department,
        'Branch': employee.branch,
        'Survey Status': 'Submitted',
        'Created At': employee.surveyResult?.createdAt || '',
      }

      // Initialize all questions with empty values first using new format
      console.log(`🔍 Initializing questions for ${employee.name}:`, allQuestionKeys.size)
      allQuestionKeys.forEach((value) => {
        const columnName = `${value.section} - ${value.question}`
        baseData[columnName] = ''
        console.log(`🔍 Initialized: "${columnName}"`)
      })

      // Process survey responses using same logic as Survey Results
      if (employee.surveyResult?.surveyResult && Array.isArray(employee.surveyResult.surveyResult)) {
        const latestSubmission = employee.surveyResult.surveyResult[employee.surveyResult.surveyResult.length - 1]
        if (latestSubmission?.dataResult && Array.isArray(latestSubmission.dataResult)) {
          console.log(`🔍 Processing ${employee.name}:`, {
            totalSections: latestSubmission.dataResult.length,
            sections: latestSubmission.dataResult.map(s => ({
              section: s.section,
              questionCount: Array.isArray(s.question) ? s.question.length : 0,
              answerCount: Array.isArray(s.answer) ? s.answer.length : 0
            }))
          })

          latestSubmission.dataResult.forEach((sectionResult) => {
            if (sectionResult.section && sectionResult.question && sectionResult.answer) {
              const section = sectionResult.section
              const questions = Array.isArray(sectionResult.question) ? sectionResult.question : []
              const answers = Array.isArray(sectionResult.answer) ? sectionResult.answer : []

              questions.forEach((q, qIndex) => {
                const questionText = Array.isArray(q) ? q[0] : q // Handle both string and array format
                const answer = answers[qIndex] || ''

                // Create column name with section prefix to avoid conflicts
                const columnName = `${section} - ${questionText}`

                // Handle array answers (join with comma)
                const answerValue = Array.isArray(answer) ? answer.join(', ') : answer

                console.log(`🔍 Mapping: "${columnName}" = "${answerValue}"`)
                baseData[columnName] = answerValue
              })
            }
          })
        }
      }

      const questionKeys = Object.keys(baseData).filter(key =>
        !['No', 'Employee Name', 'Email', 'Position', 'Department', 'Branch', 'Survey Status', 'Created At'].includes(key)
      )

      console.log(`🔍 Final data for ${employee.name}:`, {
        totalKeys: Object.keys(baseData).length,
        questionKeys: questionKeys.length,
        questionKeysList: questionKeys
      })

      return baseData
    })

    console.log(`🔍 Excel Export Summary:`, {
      totalEmployees: employeesWithResponses.length,
      sampleData: excelData[0] ? {
        employeeName: excelData[0]['Employee Name'],
        totalColumns: Object.keys(excelData[0]).length,
        questionColumns: Object.keys(excelData[0]).filter(key =>
          !['No', 'Employee Name', 'Email', 'Position', 'Department', 'Branch', 'Survey Status', 'Created At'].includes(key)
        ).length
      } : null
    })

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 5 },   // No
      { wch: 25 },  // Employee Name
      { wch: 30 },  // Email
      { wch: 20 },  // Position
      { wch: 15 },  // Department
      { wch: 15 },  // Branch
      { wch: 15 },  // Survey Status
      { wch: 20 },  // Created At
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Survey Responses')

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `survey_responses_${currentDate}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)

    console.log(`✅ Excel file exported successfully: ${filename}`)
  }

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
            <div className="flex items-center gap-3">
              <Button
                onClick={exportToExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={filteredEmployees.filter(emp => emp.hasSurvey).length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
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
                            <Badge
                              className="bg-black text-white hover:bg-gray-800"
                            >
                              View Survey
                            </Badge>
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
