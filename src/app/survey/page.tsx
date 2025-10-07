"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronsUpDown, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEmployee } from "@/hooks/use-employee"
import { useSection } from "@/hooks/use-sections"
import { useSurveyProgress } from "@/hooks/use-survey-progress"
import { useSubmissionCheck } from "@/hooks/use-submission-check"
import { SurveyStatusGuard } from "@/components/survey-status-guard"
import Image from "next/image"

export default function SurveyPage() {
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const { sections, isLoading: sectionsLoading, isError: sectionsError, error: sectionsErrorObj } = useSection()
  const { employees, isLoading } = useEmployee()
  const router = useRouter()

  // Survey progress management
  const {
    progressData,
    initializeProgress,
    isSurveyInProgress,
    clearProgress
  } = useSurveyProgress()

  // Check if selected employee has already submitted this year
  const {
    hasSubmittedThisYear,
    submissionData,
    isLoading: submissionCheckLoading
  } = useSubmissionCheck(selectedEmployeeId)

  // Auto-redirect to completed page if already submitted
  useEffect(() => {
    if (selectedEmployeeId && hasSubmittedThisYear && submissionData && !submissionCheckLoading) {
      console.log("🔄 Auto-redirecting to completed page - user already submitted this year")
      router.push('/survey/completed')
    }
  }, [selectedEmployeeId, hasSubmittedThisYear, submissionData, submissionCheckLoading, router])

  // Debug logging
  console.log("🔍 Survey Page Debug:", {
    selectedEmployeeId,
    isSurveyInProgress: isSurveyInProgress(),
    progressData,
    hasSubmittedThisYear,
    submissionData,
    currentYear: new Date().getFullYear()
  })

  // Debug logging seperti di survey configuration
  console.log("📊 Survey Page - Sections data:", sections);
  console.log("📊 Survey Page - Sections loading:", sectionsLoading);
  console.log("📊 Survey Page - Sections error:", sectionsError, sectionsErrorObj);

  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string
    name: string
    department: string
    position: string
  } | null>(null)

  // Debug logging for selectedEmployee
  console.log("🔍 Selected Employee Debug:", {
    selectedEmployee,
    selectedEmployeeId,
    isSurveyInProgress: isSurveyInProgress(),
    progressData
  })


  useEffect(() => {
    const saved = localStorage.getItem("selectedEmployee")
    if (saved) {
      const emp = JSON.parse(saved)
      setSelectedEmployee(emp)
      setSelectedEmployeeId(emp.id)
    }
  }, [])

  useEffect(() => {
    if (selectedEmployee) {
      localStorage.setItem("selectedEmployee", JSON.stringify(selectedEmployee))
    }
  }, [selectedEmployee])

  const handleStartSurvey = () => {
    if (!selectedEmployee || !sections?.length) return

    // Check if user has already submitted this year
    if (hasSubmittedThisYear && submissionData) {
      console.log("🚫 User already submitted this year, redirecting to thank you page")
      router.push('/survey/completed')
      return
    }

    // Check if date is selected
    if (!selectedDate) {
      alert("Please select a survey date before starting")
      return
    }

    // Initialize survey progress with selected date
    initializeProgress(selectedEmployee.id, selectedEmployee.name, sections[0].id)

    // simpan employee dan tanggal di localStorage (dipakai di section)
    localStorage.setItem("selectedEmployee", JSON.stringify(selectedEmployee))
    localStorage.setItem("selectedSurveyDate", selectedDate)

    // ambil section pertama
    const firstSectionId = sections[0].id

    // langsung route ke section pertama
    router.push(`/survey/section/${firstSectionId}`)
  }

  // Handle continue existing survey
  const handleContinueSurvey = () => {
    if (progressData && sections && sections.length > 0) {
      // Find the first incomplete section or continue from current
      const incompleteSection = sections.find(section =>
        !progressData.completedSections.includes(section.id)
      )

      const targetSection = incompleteSection || sections.find(s => s.id === progressData.currentSectionId) || sections[0]
      router.push(`/survey/section/${targetSection.id}`)
    }
  }





  const selectedEmployeeData = employees?.find(
    (emp: { id: number }) => emp.id === Number(selectedEmployeeId)
  )

  // Show loading state while checking submission status
  if (selectedEmployeeId && submissionCheckLoading) {
    return (
      <SurveyStatusGuard>
        <section className="flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-white">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border-2 border-black">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-black mb-2">Checking Submission Status</h2>
            <p className="text-gray-600">Please wait while we verify your survey status...</p>
          </div>
        </section>
      </SurveyStatusGuard>
    )
  }

  // Check if employee has already submitted this year
  if (selectedEmployeeId && hasSubmittedThisYear && submissionData) {
    return (
      <SurveyStatusGuard>
        <section className="flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-white">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border-2 border-black">
            {/* Success icon */}
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-black mb-4">
              Survey Already Completed
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              <strong>{selectedEmployeeData?.name}</strong> has already completed the Annual Survey for <strong>{submissionData.year}</strong>.
            </p>

            {/* Submission details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Submitted on:</strong>
              </p>
              <p className="text-sm font-medium text-black">
                {submissionData.createdAt}
              </p>
            </div>

            {/* Message */}
            <div className="border-t-2 border-gray-200 pt-6">
              <p className="text-sm text-gray-500 mb-4">
                This form can only be submitted once per year.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can participate again next year.
              </p>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/survey/thankyou')}
                  className="w-full bg-black hover:bg-gray-800 text-white border-2 border-black"
                >
                  View Submission Details
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:bg-gray-100"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </section>
      </SurveyStatusGuard>
    )
  }

  // Error handling seperti di survey configuration
  if (sectionsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading sections: {sectionsErrorObj?.message}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }



  return (
    <SurveyStatusGuard>
      <section className="flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl xl:text-6xl font-bold text-center leading-tight mb-8">
          CBN <br /> EMPLOYEE SURVEY
        </h1>
        <Image src="/LOGOBRANCH.png" alt="CBN Logo" width={200} height={200} />

        <div className="flex flex-col gap-2 items-center w-full max-w-md">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-10 border border-black bg-transparent"
              >
                {selectedEmployeeId
                  ? selectedEmployeeData?.name
                  : isLoading
                    ? "Loading..."
                    : "Select Employee Name..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              side="bottom"
              align="start"
              sideOffset={8}
              className="w-full p-0 z-50"
              avoidCollisions={false}
              collisionPadding={20}
            >
              <Command>
                <CommandInput placeholder="Search employee..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {employees?.map((emp: { id: number; name: string; job_position: string }) => (
                      <CommandItem
                        key={emp.id}
                        value={emp.name}
                        onSelect={() => {
                          const isSame = String(emp.id) === selectedEmployeeId
                          const employeeId = String(emp.id)
                          console.log("🔍 Employee Selected:", {
                            empId: emp.id,
                            empIdType: typeof emp.id,
                            employeeId,
                            employeeIdType: typeof employeeId,
                            empName: emp.name
                          })
                          setSelectedEmployeeId(isSame ? "" : employeeId)
                          setSelectedEmployee(isSame ? null : {
                            id: employeeId,
                            name: emp.name,
                            department: emp.job_position,
                            position: emp.job_position
                          })
                          setOpen(false)
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{emp.name}</span>
                          <span className="text-sm text-gray-500">{emp.job_position}</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedEmployeeId === String(emp.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {selectedEmployeeData && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border w-full text-center">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{selectedEmployeeData.job_position}</span>
              </p>
            </div>
          )}

          {/* Date Selection Form */}
          {selectedEmployeeData && (
            <div className="w-full mb-6">
              <Label htmlFor="survey-date" className="text-sm font-bold text-black mb-2 block">
                Survey Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="survey-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 bg-white border-2 border-black rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                  placeholder="Select survey date"
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Select the date for this survey submission
              </p>
            </div>
          )}

          {/* Debug info untuk sections */}
          {/* {sections && (
            <div className="w-full mb-4 p-3 bg-gray-50 rounded-lg text-sm">
              <p className="font-medium">Available Sections: {sections.length}</p>
              <div className="mt-2 space-y-1">
                {sections.map((section: { id: string; title: string }, index: number) => (
                  <p key={section.id} className="text-gray-600">
                    {index + 1}. {section.title} (ID: {section.id})
                  </p>
                ))}
              </div>
            </div>
          )} */}



          {/* Survey progress info */}
          {progressData && progressData.employeeId === selectedEmployeeId && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-bold text-black">Survey in Progress</span>
                </div>
                <span className="text-sm font-bold text-black">
                  {progressData.completedSections.length}/{sections?.length || 0} completed
                </span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progressData.completedSections.length / (sections?.length || 1)) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Started: {new Date(progressData.startTime).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Survey action buttons */}
          {progressData && progressData.employeeId === selectedEmployeeId ? (
            <div className="space-y-3">
              <Button
                onClick={handleContinueSurvey}
                className="w-full h-12 font-medium rounded-xl transition-all duration-200 border-2 bg-black hover:bg-gray-800 text-white border-black shadow-lg hover:shadow-xl"
              >
                Continue Survey
              </Button>
              <Button
                onClick={() => {
                  clearProgress()
                  setSelectedEmployeeId("")
                  setSelectedEmployee(null)
                  setSelectedDate("")
                }}
                variant="outline"
                className="w-full border-2 border-gray-300 hover:bg-gray-100 text-gray-600 font-medium py-3 rounded-xl transition-all duration-200"
              >
                Start New Survey
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartSurvey}
              className="w-full h-12 font-medium rounded-xl transition-all duration-200 border-2 bg-black hover:bg-gray-800 text-white border-black shadow-lg hover:shadow-xl"
              disabled={!selectedEmployeeId || !selectedDate || sectionsLoading || !sections || sections.length === 0}
            >
              {sectionsLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Loading Survey...
                </div>
              ) : !sections || sections.length === 0 ? (
                "No Sections Available"
              ) : !selectedDate ? (
                "Select Date to Start Survey"
              ) : (
                "Start Survey"
              )}
            </Button>
          )}

          {!selectedEmployeeId && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Please select your employee profile to begin the survey
            </p>
          )}
        </div>
      </section>
    </SurveyStatusGuard>
  )
}
