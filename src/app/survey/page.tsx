"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useEmployee } from "@/hooks/use-employee"
import { useSection } from "@/hooks/use-sections"
import { useSurveySubmission } from "@/hooks/use-survey-submission"
import { useYearlySubmissionCheck } from "@/hooks/use-yearly-submission-check"
import { SurveyStatusGuard } from "@/components/survey-status-guard"
import { toast } from "sonner"

export default function SurveyPage() {
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const { sections, isLoading: sectionsLoading, isError: sectionsError, error: sectionsErrorObj } = useSection()
  const { employees, isLoading } = useEmployee()
  const { submitSurvey } = useSurveySubmission()
  const router = useRouter()

  // Check if selected employee has already submitted this year
  const { hasSubmittedThisYear, submissionData, isLoading: submissionCheckLoading } = useYearlySubmissionCheck(selectedEmployeeId)

  // Debug logging
  console.log("🔍 Survey Page Debug:", {
    selectedEmployeeId,
    hasSubmittedThisYear,
    submissionData,
    submissionCheckLoading,
    currentYear: new Date().getFullYear()
  })

  // Auto-redirect to thank you page if already submitted
  useEffect(() => {
    if (selectedEmployeeId && hasSubmittedThisYear && submissionData && !submissionCheckLoading) {
      console.log("🔄 Auto-redirecting to thank you page - user already submitted this year")
      router.push('/survey/thankyou')
    }
  }, [selectedEmployeeId, hasSubmittedThisYear, submissionData, submissionCheckLoading, router])

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
    hasSubmittedThisYear,
    submissionData
  })

  // simpan jawaban user per section
  const [sectionAnswers, setSectionAnswers] = useState<Record<string, Record<string, string | string[]>>>({})

  // Convert section answers to the format expected by API
  const convertAnswersForAPI = () => {
    return Object.entries(sectionAnswers).map(([sectionId, answers]) => ({
      section: sectionId,
      question: Object.keys(answers),
      answer: Object.values(answers) as string[]
    }))
  }

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
      toast.error("Anda sudah mengisi survey tahun ini!", {
        description: `Survey sudah disubmit pada ${submissionData.createdAt}`,
        duration: 5000,
        icon: <AlertCircle className="w-4 h-4" />,
      })
      return
    }

    // reset jawaban tiap mulai survey baru
    setSectionAnswers({})

    // simpan employee di localStorage (dipakai di section)
    localStorage.setItem("selectedEmployee", JSON.stringify(selectedEmployee))

    // ambil section pertama
    const firstSectionId = sections[0].id

    // langsung route ke section pertama
    router.push(`/survey/section/${firstSectionId}`)
  }



  // submit ke API
  const handleSubmitSurvey = () => {
    if (!selectedEmployee) return

    const apiAnswers = convertAnswersForAPI()

    const payload = {
      employeeID: selectedEmployee.id,
      name: selectedEmployee.name,
      surveyResult: apiAnswers,
      conclutionResult: "submit",
    }

    submitSurvey.mutate(payload, {
      onSuccess: (res) => {
        console.log("Survey submitted:", res)
        alert("Survey berhasil dikirim!")
        // Clear all survey answers
        setSectionAnswers({})
        router.push("/") // redirect ke halaman lain setelah submit
      },
      onError: (err: Error) => {
        alert("Gagal submit survey: " + err.message)
      },
    })
  }


  const selectedEmployeeData = employees?.find(
    (emp: { id: number }) => emp.id === Number(selectedEmployeeId)
  )

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

  // Show loading state while checking submission status
  if (selectedEmployeeId && submissionCheckLoading) {
    return (
      <SurveyStatusGuard>
        <section className="flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Submission Status</h2>
            <p className="text-gray-600">Please wait while we verify your survey status...</p>
          </div>
        </section>
      </SurveyStatusGuard>
    )
  }

  // If employee has already submitted this year, show Google Form style completion page
  if (selectedEmployeeId && hasSubmittedThisYear && submissionData) {
    return (
      <SurveyStatusGuard>
        <section className="flex flex-col items-center justify-center px-4 py-12 min-h-screen bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Google Form style icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Survey Already Completed
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              <strong>{selectedEmployeeData?.name}</strong> has already completed the Annual Survey for <strong>{submissionData.year}</strong>.
            </p>

            {/* Submission details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Submitted on:</strong>
              </p>
              <p className="text-sm font-medium text-gray-800">
                {submissionData.createdAt}
              </p>
            </div>

            {/* Google Form style message */}
            <div className="border-t pt-6">
              <p className="text-sm text-gray-500 mb-4">
                This form can only be submitted once per year.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can participate again next year.
              </p>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setSelectedEmployeeId("")
                    setSelectedEmployee(null)
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Select Different Employee
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
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

  return (
    <SurveyStatusGuard>
      <section className="flex flex-col items-center justify-center px-4 py-12">
        <h1 className="text-4xl xl:text-6xl font-bold text-center leading-tight mb-8">
          Annual <br /> Survey Employee
        </h1>

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

            <PopoverContent side="bottom" align="start" sideOffset={8} className="w-full p-0 z-50">
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

          {/* Debug info untuk sections */}
          {sections && (
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
          )}

          <Button
            onClick={handleStartSurvey}
            className={`md:mt-6 w-full border border-b-4 cursor-pointer transition-all duration-300 border-r-4 disabled:opacity-50 disabled:cursor-not-allowed ${hasSubmittedThisYear
              ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
              : "bg-white text-black border-black hover:bg-white hover:border"
              }`}
            disabled={!selectedEmployeeId || sectionsLoading || !sections || sections.length === 0 || hasSubmittedThisYear}
          >
            {sectionsLoading ? "Loading Survey..." :
              !sections || sections.length === 0 ? "No Sections Available" :
                hasSubmittedThisYear ? "Survey Already Completed" :
                  "Start Survey !"}
          </Button>

          {/* Pesan jika user sudah submit */}
          {hasSubmittedThisYear && submissionData && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm font-medium text-red-800">
                  Anda sudah mengisi survey tahun ini!
                </p>
              </div>
              <p className="text-xs text-red-600">
                Survey disubmit pada: <strong>{submissionData.createdAt}</strong>
              </p>
              <p className="text-xs text-red-600 mt-1">
                Anda dapat mengisi survey lagi tahun depan.
              </p>
            </div>
          )}

          {/* tombol submit akhir survey */}
          {Object.keys(sectionAnswers).length > 0 && (
            <Button
              onClick={handleSubmitSurvey}
              className="mt-4 w-full bg-black text-white"
              disabled={submitSurvey.isPending}
            >
              {submitSurvey.isPending ? "Submitting..." : "Submit Survey"}
            </Button>
          )}

          {!selectedEmployeeId && (
            <p className="text-sm text-gray-500 mt-2">Please select an employee to start the survey</p>
          )}
        </div>
      </section>
    </SurveyStatusGuard>
  )
}
