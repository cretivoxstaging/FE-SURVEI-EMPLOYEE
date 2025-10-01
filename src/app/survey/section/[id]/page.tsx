"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSection } from "@/hooks/use-sections"
import { useQuestion } from "@/hooks/use-questions"
import { useSurveySubmission } from "@/hooks/use-survey-submission"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { SurveyStatusGuard } from "@/components/survey-status-guard"
import { SurveySkeleton, SurveyStepSkeleton } from "@/components/survey-skeleton"
import { useYearlySubmissionCheck } from "@/hooks/use-yearly-submission-check"
import { apiClient } from "@/lib/api-client"

interface Section {
  id: string
  title: string
}

interface Question {
  id: string
  text: string
  type: string
  options?: string[]
  required?: boolean
  scaleMin?: number
  scaleMax?: number
}

export default function SurveySectionPage() {
  const params = useParams()
  const router = useRouter()
  const sectionId = params.id as string

  // Fetch sections and questions - sama seperti di survey configuration
  const { sections, isLoading: sectionsLoading, isError: sectionsError, error: sectionsErrorObj } = useSection()
  const { submitSurvey } = useSurveySubmission()

  // Debug logging - sama seperti di survey configuration
  console.log("📊 Sections data:", sections);
  console.log("📊 Sections loading:", sectionsLoading);
  console.log("📊 Sections error:", sectionsError, sectionsErrorObj);
  console.log("🔍 Section ID from params:", sectionId, "Type:", typeof sectionId);

  // Get current section data - sama seperti di survey configuration
  // Try different comparison methods to handle type mismatches
  const currentSection = sections?.find((s: Section) => {
    const sectionIdStr = String(sectionId)
    const sIdStr = String(s.id)
    console.log("🔍 Comparing:", { sectionIdStr, sIdStr, exact: s.id === sectionId, string: sIdStr === sectionIdStr })
    return s.id === sectionId || sIdStr === sectionIdStr
  })
  const sectionTitle = currentSection?.title

  // Debug current section finding
  console.log("🔍 Current section search:", {
    sectionId,
    sectionsLength: sections?.length,
    sectionsIds: sections?.map((s: Section) => ({ id: s.id, title: s.title })),
    currentSection,
    sectionTitle
  });

  // Fetch questions untuk section ini - sama seperti di survey configuration
  const { questions, isLoading: questionsLoading, isError: questionsError, error: questionsErrorObj } = useQuestion(
    sectionId,
    sectionTitle
  )

  console.log(`🏗️ SectionCard for "${sectionTitle}" (ID: ${sectionId}):`, {
    questions,
    questionsLoading,
    questionsError,
    questionsErrorObj
  });

  // State management
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string
    name: string
    position: string
  } | null>(null)

  // Check if selected employee has already submitted this year
  const { hasSubmittedThisYear: apiHasSubmitted, submissionData, isLoading: submissionCheckLoading } = useYearlySubmissionCheck(selectedEmployee?.id || "")

  // Auto-redirect to thank you page if already submitted
  useEffect(() => {
    if (selectedEmployee?.id && apiHasSubmitted && submissionData && !submissionCheckLoading) {
      console.log("🔄 Auto-redirecting to thank you page - user already submitted this year")
      router.push('/survey/thankyou')
    }
  }, [selectedEmployee?.id, apiHasSubmitted, submissionData, submissionCheckLoading, router])

  // Get navigation data - sama seperti di survey configuration
  // Use robust comparison like we did for currentSection
  const currentIndex = sections?.findIndex((s: Section) => {
    const sectionIdStr = String(sectionId)
    const sIdStr = String(s.id)
    return s.id === sectionId || sIdStr === sectionIdStr
  }) ?? -1
  const totalSections = sections?.length ?? 0
  const nextSection = sections?.[currentIndex + 1]
  const prevSection = sections?.[currentIndex - 1]

  // Debug navigation data
  console.log("🔍 Navigation Debug:", {
    sectionId,
    currentIndex,
    totalSections,
    nextSection,
    prevSection,
    sections: sections?.map((s: Section) => ({ id: s.id, title: s.title }))
  });

  // Load employee from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("selectedEmployee")
    if (saved) setSelectedEmployee(JSON.parse(saved))
  }, [])

  // Load answers from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`answers-${sectionId}`)
    console.log("🔍 Loading answers from localStorage:", { sectionId, saved })
    if (saved) {
      const parsedAnswers = JSON.parse(saved)
      console.log("🔍 Parsed answers:", parsedAnswers)
      setAnswers(parsedAnswers)
    }
  }, [sectionId])

  // Loading states - sama seperti di survey configuration
  if (sectionsLoading) {
    return (
      <SurveyStatusGuard>
        <SurveySkeleton />
      </SurveyStatusGuard>
    )
  }

  // Error states - sama seperti di survey configuration
  if (sectionsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading sections: {sectionsErrorObj?.message}</p>
          <Button onClick={() => router.push('/survey')}>
            Back to Survey
          </Button>
        </div>
      </div>
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">No sections available</p>
          <Button onClick={() => router.push('/survey')}>
            Back to Survey
          </Button>
        </div>
      </div>
    )
  }

  if (!currentSection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Section not found</p>
          <div className="text-sm text-gray-600 mb-4">
            <p>Looking for Section ID: {sectionId}</p>
            <p>Available sections: {sections?.length || 0}</p>
            {sections && sections.length > 0 && (
              <div className="mt-2">
                <p>Available IDs:</p>
                <ul className="list-disc list-inside">
                  {sections.map((s: Section) => (
                    <li key={s.id}>{s.id} - {s.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button onClick={() => router.push('/survey')}>
            Back to Survey
          </Button>
        </div>
      </div>
    )
  }

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    console.log("🔍 handleAnswerChange called:", { questionId, value, sectionId })
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    localStorage.setItem(`answers-${sectionId}`, JSON.stringify(newAnswers))
    console.log("🔍 Updated answers:", newAnswers)
    console.log("🔍 Saved to localStorage:", `answers-${sectionId}`, JSON.stringify(newAnswers))
  }

  // Navigation handlers
  const handlePrevious = () => {
    if (prevSection) {
      router.push(`/survey/section/${prevSection.id}`)
    } else {
      router.push("/survey")
    }
  }

  const handleNext = async () => {
    console.log("🔍 HandleNext Debug:", {
      nextSection,
      currentIndex,
      totalSections,
      hasNextSection: !!nextSection
    });

    if (nextSection) {
      console.log("🚀 Navigating to next section:", nextSection.id);
      router.push(`/survey/section/${nextSection.id}`)
    } else {
      // Finish survey - submit all answers
      if (!selectedEmployee) return

      // Fetch all questions first using apiClient
      let allQuestions = []
      try {
        const response = await apiClient.get("/api/v1/question")
        const questionsData = response.data
        allQuestions = questionsData?.data || questionsData || []
        console.log("🔍 All questions fetched:", allQuestions)
      } catch (error) {
        console.error("Error fetching questions:", error)
      }

      const surveyResult = sections?.map((section: Section) => {
        const sectionAnswers = JSON.parse(localStorage.getItem(`answers-${section.id}`) || "{}")
        console.log("🔍 Section answers for", section.title, ":", sectionAnswers)

        // Find questions for this section
        const sectionQuestions = allQuestions.filter((q: { sectionTitle?: string; sectionId?: number }) => {
          return q.sectionTitle === section.title || String(q.sectionId) === String(section.id)
        })

        console.log("🔍 Section questions for", section.title, ":", sectionQuestions)

        // Map answers using question IDs from the questions data
        const questionIds = sectionQuestions.map((q: { id: number }) => String(q.id))
        const answers = questionIds.map((qId: string) => {
          const answer = sectionAnswers[qId]
          console.log(`🔍 Answer for question ${qId}:`, answer)
          return answer || ""
        })

        console.log("🔍 Mapped question IDs:", questionIds)
        console.log("🔍 Mapped answers:", answers)

        return {
          section: section.title,
          question: questionIds,
          answer: answers,
        }
      })

      const payload = {
        employeeID: selectedEmployee.id,
        name: selectedEmployee.name,
        surveyResult: surveyResult || [],
        conclutionResult: "submit",
      }

      console.log("🚀 Submitting survey:", payload)
      console.log("📊 Survey Result Details:", {
        employeeID: payload.employeeID,
        name: payload.name,
        surveyResultCount: payload.surveyResult.length,
        surveyResult: payload.surveyResult,
        conclutionResult: payload.conclutionResult
      })

      submitSurvey.mutate(payload, {
        onSuccess: (res) => {
          console.log("Survey submitted successfully:", res)
          alert("Survey berhasil dikirim!")
          // Clear localStorage
          sections?.forEach((s: Section) => localStorage.removeItem(`answers-${s.id}`))
          router.push("/survey/thankyou")
        },
        onError: (err: Error) => {
          alert("❌ Failed to submit survey: " + err.message)
        },
      })
    }
  }

  // Render different question types
  const renderQuestion = (question: Question) => {
    const currentAnswer = answers[question.id]

    switch (question.type) {
      case "radio":
      case "multiple-choice":
        return (
          <RadioGroup
            value={(currentAnswer as string) || ""}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            className="space-y-2"
          >
            {question.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`${question.id}-${i}`} />
                <Label htmlFor={`${question.id}-${i}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "checkbox":
        const checkboxAnswers = (currentAnswer as string[]) || []
        return (
          <div className="space-y-2">
            {question.options?.map((opt: string, i: number) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${i}`}
                  checked={checkboxAnswers.includes(opt)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [...checkboxAnswers, opt])
                    } else {
                      handleAnswerChange(question.id, checkboxAnswers.filter((a) => a !== opt))
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${i}`}>{opt}</Label>
              </div>
            ))}
          </div>
        )

      case "text":
        return (
          <Input
            value={(currentAnswer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Masukkan jawaban Anda..."
          />
        )

      case "textarea":
        return (
          <Textarea
            value={(currentAnswer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Masukkan jawaban Anda..."
            rows={4}
          />
        )

      case "rating":
        return (
          <RadioGroup
            value={(currentAnswer as string) || ""}
            onValueChange={(val) => handleAnswerChange(question.id, val)}
            className="flex space-x-4"
          >
            {(question.options || ["1", "2", "3", "4", "5"]).map((opt, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={opt} id={`${question.id}-${i}`} />
                <Label htmlFor={`${question.id}-${i}`}>{opt}</Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return (
          <Input
            value={(currentAnswer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Masukkan jawaban Anda..."
          />
        )
    }
  }

  // Show loading state while checking submission status
  if (selectedEmployee && submissionCheckLoading) {
    return (
      <SurveyStatusGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Submission Status</h2>
            <p className="text-gray-600">Please wait while we verify your survey status...</p>
          </div>
        </div>
      </SurveyStatusGuard>
    )
  }

  // If employee has already submitted this year, show Google Form style completion page
  if (selectedEmployee && apiHasSubmitted && submissionData) {
    return (
      <SurveyStatusGuard>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              <strong>{selectedEmployee.name}</strong> has already completed the Annual Survey for <strong>{submissionData.year}</strong>.
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
                  onClick={() => router.push('/survey')}
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
        </div>
      </SurveyStatusGuard>
    )
  }

  return (
    <SurveyStatusGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => router.push('/survey')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Survey
              </Button>
              <div className="text-sm text-gray-500">
                Section {currentIndex + 1} of {totalSections}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentSection.title}
            </h1>

            {selectedEmployee && (
              <p className="text-gray-600">
                Survey for: <span className="font-medium">{selectedEmployee.name}</span>
                <span className="text-gray-400 ml-2">({selectedEmployee.position})</span>
              </p>
            )}
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questionsLoading ? (
              <SurveyStepSkeleton />
            ) : questions && questions.length > 0 ? (
              questions.map((question, index) => (
                <Card key={question.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {index + 1}. {question.text}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderQuestion(question)}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">No questions found for this section.</p>
                  <Button
                    onClick={() => router.push('/survey')}
                    className="mt-4"
                  >
                    Back to Survey
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={submitSurvey.isPending}
              className="flex items-center gap-2"
            >
              {submitSurvey.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {currentIndex === totalSections - 1 ? 'Submitting...' : 'Loading...'}
                </>
              ) : (
                <>
                  {currentIndex === totalSections - 1 ? 'Finish Survey' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </SurveyStatusGuard>
  )
}
