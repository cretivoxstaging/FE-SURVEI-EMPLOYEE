"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useSection } from "@/hooks/use-sections"
import { useQuestion } from "@/hooks/use-questions"
import { useSurveySubmission } from "@/hooks/use-survey-submission"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { SurveyStatusGuard } from "@/components/survey-status-guard"
import { SurveySkeleton, SurveyStepSkeleton } from "@/components/survey-skeleton"
import { useSurveyProgress, SurveyProgressData } from "@/hooks/use-survey-progress"
import { useSubmissionCheck } from "@/hooks/use-submission-check"

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

  // Get selected employee ID from localStorage
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")

  // Check if selected employee has already submitted this year
  const {
    hasSubmittedThisYear,
    submissionData,
    isLoading: submissionCheckLoading
  } = useSubmissionCheck(selectedEmployeeId)

  // Get selected employee ID from localStorage
  useEffect(() => {
    const employeeId = localStorage.getItem("selectedEmployee")
    if (employeeId) {
      setSelectedEmployeeId(employeeId)
    }
  }, [])

  // Auto-redirect to completed page if already submitted
  useEffect(() => {
    if (selectedEmployeeId && hasSubmittedThisYear && submissionData && !submissionCheckLoading) {
      console.log("🔄 Auto-redirecting to completed page - user already submitted this year")
      router.push('/survey/completed')
    }
  }, [selectedEmployeeId, hasSubmittedThisYear, submissionData, submissionCheckLoading, router])

  // Debug logging - sama seperti di survey configuration
  console.log("📊 Sections data:", sections);
  console.log("📊 Sections loading:", sectionsLoading);
  console.log("📊 Sections error:", sectionsError, sectionsErrorObj);
  console.log("🔍 Section ID from params:", sectionId, "Type:", typeof sectionId);
  console.log("🔍 Selected Employee ID:", selectedEmployeeId);
  console.log("🔍 Has Submitted This Year:", hasSubmittedThisYear);

  // Get current section data - sama seperti di survey configuration
  // Try different comparison methods to handle type mismatches
  const currentSection = sections?.find((s: Section) => {
    const sectionIdStr = String(sectionId)
    const sIdStr = String(s.id)
    console.log("🔍 Comparing:", { sectionIdStr, sIdStr, exact: s.id === sectionId, string: sIdStr === sectionIdStr })
    return s.id === sectionId || sIdStr === sectionIdStr
  })
  const sectionTitle = currentSection?.title

  console.log("🔍 Current Section Title:", sectionTitle)

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

  // Survey progress management
  const {
    progressData,
    saveAnswer,
    markSectionCompleted,
    updateCurrentSection,
    clearProgress
  } = useSurveyProgress()

  // Check if survey is in progress and matches current employee
  const isSurveyInProgress = progressData && selectedEmployee && progressData.employeeId === selectedEmployee?.id

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
    if (saved) {
      const employee = JSON.parse(saved)
      setSelectedEmployee(employee)

      // Update current section in progress if survey is in progress
      if (progressData && progressData.employeeId === employee.id) {
        updateCurrentSection(sectionId)
      }
    }

    // Check and migrate old format data if needed
    const checkAndMigrateOldData = () => {
      if (progressData && progressData.answers) {
        const firstAnswerKey = Object.keys(progressData.answers)[0]
        if (firstAnswerKey) {
          const firstAnswer = progressData.answers[firstAnswerKey]
          // Check if it's old format (direct value instead of AnswerData object)
          if (typeof firstAnswer === 'string' || Array.isArray(firstAnswer)) {
            console.warn("⚠️ Old format detected in survey progress. Clearing and restarting...")
            clearProgress()
            // Clear all section answers
            sections?.forEach((section: Section) => {
              localStorage.removeItem(`answers-${section.id}`)
            })
            alert("Format data lama terdeteksi. Silakan mulai survey dari awal.")
            router.push('/survey')
          }
        }
      }
    }

    checkAndMigrateOldData()
  }, [sectionId]) // Removed progressData and updateCurrentSection from dependencies

  // Load answers from survey progress or localStorage fallback
  useEffect(() => {
    if (isSurveyInProgress && progressData) {
      // Load answers from survey progress - extract answer value from AnswerData structure
      const progressAnswers = Object.keys(progressData.answers).reduce((acc, questionId) => {
        // Only load answers for current section
        if (questions?.some(q => q.id === questionId)) {
          acc[questionId] = progressData.answers[questionId].answer
        }
        return acc
      }, {} as Record<string, string | string[]>)

      console.log("🔍 Loading answers from survey progress:", { sectionId, progressAnswers })
      setAnswers(progressAnswers)
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem(`answers-${sectionId}`)
      console.log("🔍 Loading answers from localStorage:", { sectionId, saved })
      if (saved) {
        const parsedAnswers = JSON.parse(saved)
        // Extract answer values from AnswerData structure
        const extractedAnswers = Object.keys(parsedAnswers).reduce((acc, questionId) => {
          const answerData = parsedAnswers[questionId]
          // Check if it's the new structure (AnswerData) or old structure (direct value)
          if (answerData && typeof answerData === 'object' && 'answer' in answerData) {
            acc[questionId] = answerData.answer
          } else {
            // Fallback for old format
            acc[questionId] = answerData
          }
          return acc
        }, {} as Record<string, string | string[]>)
        console.log("🔍 Extracted answers:", extractedAnswers)
        setAnswers(extractedAnswers)
      }
    }
  }, [sectionId, questions]) // Removed isSurveyInProgress and progressData from dependencies

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
          {/* <div className="text-sm text-gray-600 mb-4">
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
          </div> */}
          <Button onClick={() => router.push('/survey')}>
            Back to Survey
          </Button>
        </div>
      </div>
    )
  }

  // Handle answer changes
  const handleAnswerChange = (questionId: string, value: string | string[], questionText: string) => {
    console.log("🔍 handleAnswerChange called:", {
      questionId,
      value,
      questionText,
      sectionId,
      sectionTitle,
      isSurveyInProgress
    })
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Save to survey progress if in progress, otherwise save to localStorage
    if (isSurveyInProgress) {
      console.log("🔍 Saving to survey progress with:", {
        questionId,
        value,
        questionText,
        sectionTitle: sectionTitle || ""
      })
      saveAnswer(questionId, value, questionText, sectionTitle || "")
    } else {
      // For localStorage fallback, save with full data structure
      const answerData = {
        questionText,
        sectionTitle: sectionTitle || "",
        answer: value,
      }
      console.log("🔍 Saving to localStorage with answerData:", answerData)
      const savedAnswers = JSON.parse(localStorage.getItem(`answers-${sectionId}`) || "{}")
      savedAnswers[questionId] = answerData
      localStorage.setItem(`answers-${sectionId}`, JSON.stringify(savedAnswers))
      console.log("🔍 Full localStorage data:", savedAnswers)
    }

    console.log("🔍 Updated answers:", newAnswers)
    console.log("🔍 Saved to:", isSurveyInProgress ? "survey progress" : "localStorage")
  }

  // Check if all questions are answered (all questions are now required)
  const areAllQuestionsAnswered = () => {
    if (!questions || questions.length === 0) return true

    console.log("🔍 All questions check (all required):", {
      totalQuestions: questions.length,
      questionIds: questions.map(q => ({ id: q.id, text: q.text })),
      currentAnswers: answers
    })

    const result = questions.every((question) => {
      const answer = answers[question.id]

      // Check if answer exists and is not empty
      if (!answer) {
        console.log("❌ Question not answered:", { questionId: question.id, questionText: question.text })
        return false
      }

      // For string answers, check if not empty
      if (typeof answer === 'string') {
        const isValid = answer.trim() !== ''
        console.log("🔍 String answer check:", { questionId: question.id, answer, isValid })
        return isValid
      }

      // For array answers (checkbox), check if not empty
      if (Array.isArray(answer)) {
        const isValid = answer.length > 0
        console.log("🔍 Array answer check:", { questionId: question.id, answer, isValid })
        return isValid
      }

      console.log("❌ Unknown answer type:", { questionId: question.id, answer, type: typeof answer })
      return false
    })

    console.log("🔍 All questions answered:", result)
    return result
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
      hasNextSection: !!nextSection,
      isSurveyInProgress
    });

    // Mark current section as completed if survey is in progress
    if (isSurveyInProgress) {
      markSectionCompleted(sectionId)
    }

    if (nextSection) {
      console.log("🚀 Navigating to next section:", nextSection.id);

      // Update current section in progress
      if (isSurveyInProgress) {
        updateCurrentSection(nextSection.id)
      }

      router.push(`/survey/section/${nextSection.id}`)
    } else {
      // Finish survey - submit all answers
      if (!selectedEmployee) return

      // If survey is in progress, use progress data
      if (isSurveyInProgress && progressData) {
        await submitFinalSurvey(progressData)
      } else {
        // Fallback to localStorage method
        await submitFinalSurveyFromLocalStorage()
      }
    }
  }

  // Submit final survey using progress data
  const submitFinalSurvey = async (progressData: SurveyProgressData) => {
    try {
      console.log("🔍 Progress Data received:", progressData)
      console.log("🔍 Progress Data answers:", progressData.answers)

      // Convert answers to dataResult format
      const dataResult: Array<{
        section: string;
        question: string[];
        answer: string[];
      }> = []

      // Group answers by section
      const answersBySection: Record<string, Array<{ question: string; answer: string | string[] }>> = {}

      Object.keys(progressData.answers).forEach((questionId) => {
        const answerData = progressData.answers[questionId]
        console.log("🔍 Processing answer:", { questionId, answerData })

        const section = answerData?.sectionTitle || "Unknown Section"
        const questionText = answerData?.questionText || "Unknown Question"
        const answer = answerData?.answer || ""

        if (!answersBySection[section]) {
          answersBySection[section] = []
        }

        answersBySection[section].push({
          question: questionText,
          answer: answer
        })
      })

      console.log("🔍 Answers by section:", answersBySection)

      // Convert to array format
      Object.keys(answersBySection).forEach((sectionTitle) => {
        const sectionAnswers = answersBySection[sectionTitle]
        sectionAnswers.forEach((item) => {
          dataResult.push({
            section: sectionTitle,
            question: [item.question],
            answer: Array.isArray(item.answer) ? item.answer : [item.answer]
          })
        })
      })

      console.log("🔍 Final dataResult:", dataResult)

      // Get selected date from localStorage
      const selectedDate = localStorage.getItem("selectedSurveyDate")
      const currentDate = new Date()
      const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleString('en-US', {
          timeZone: 'Asia/Jakarta',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' -')
        : currentDate.toLocaleString('en-US', {
          timeZone: 'Asia/Jakarta',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' -')

      const payload = {
        employeeID: selectedEmployee?.id || "",
        name: selectedEmployee?.name || "",
        surveyResult: [
          {
            date: formattedDate,
            dataResult: dataResult,
            conclutionResult: "submit",
          }
        ],
        conclutionResult: "submit",
      }

      console.log("🚀 Submitting survey from progress:", payload)

      submitSurvey.mutate(payload, {
        onSuccess: (res) => {
          console.log("Survey submitted successfully:", res)
          // Clear progress data after successful submission
          clearProgress()
          // Clear localStorage
          sections?.forEach((section: Section) => {
            localStorage.removeItem(`answers-${section.id}`)
          })
          localStorage.removeItem("selectedEmployee")
          localStorage.removeItem("selectedSurveyDate")

          router.push('/survey/completed')
        },
        onError: (error) => {
          console.error("Survey submission error:", error)
          alert("Error submitting survey: " + error.message)
        }
      })
    } catch (error) {
      console.error("Error preparing survey submission:", error)
      alert("Error preparing survey submission: " + error)
    }
  }

  // Fallback method for localStorage-based submission
  const submitFinalSurveyFromLocalStorage = async () => {
    try {
      // Convert localStorage answers to dataResult format
      const dataResult: Array<{
        section: string;
        question: string[];
        answer: string[];
      }> = []

      // Iterate through all sections and collect answers
      sections?.forEach((section: Section) => {
        const sectionAnswers = JSON.parse(localStorage.getItem(`answers-${section.id}`) || "{}")

        Object.keys(sectionAnswers).forEach((questionId) => {
          const answerData = sectionAnswers[questionId]

          // Handle both new format (AnswerData) and old format (direct value)
          if (answerData && typeof answerData === 'object' && 'answer' in answerData) {
            // New format with AnswerData structure
            dataResult.push({
              section: answerData.sectionTitle,
              question: [answerData.questionText],
              answer: Array.isArray(answerData.answer) ? answerData.answer : [answerData.answer]
            })
          }
          // If old format, we skip it or could handle differently if needed
        })
      })

      // Get selected date from localStorage
      const selectedDate = localStorage.getItem("selectedSurveyDate")
      const currentDate = new Date()
      const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleString('en-US', {
          timeZone: 'Asia/Jakarta',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' -')
        : currentDate.toLocaleString('en-US', {
          timeZone: 'Asia/Jakarta',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(',', ' -')

      const payload = {
        employeeID: selectedEmployee?.id || "",
        name: selectedEmployee?.name || "",
        surveyResult: [
          {
            date: formattedDate,
            dataResult: dataResult,
            conclutionResult: "submit",
          }
        ],
        conclutionResult: "submit",
      }

      console.log("🚀 Submitting survey from localStorage:", payload)

      submitSurvey.mutate(payload, {
        onSuccess: (res) => {
          console.log("Survey submitted successfully:", res)
          // Clear localStorage
          sections?.forEach((section: Section) => {
            localStorage.removeItem(`answers-${section.id}`)
          })
          localStorage.removeItem("selectedEmployee")
          localStorage.removeItem("selectedSurveyDate")

          router.push('/survey/completed')
        },
        onError: (error) => {
          console.error("Survey submission error:", error)
          alert("Error submitting survey: " + error.message)
        }
      })
    } catch (error) {
      console.error("Error preparing survey submission:", error)
      alert("Error preparing survey submission: " + error)
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
            onValueChange={(val) => handleAnswerChange(question.id, val, question.text)}
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
                      handleAnswerChange(question.id, [...checkboxAnswers, opt], question.text)
                    } else {
                      handleAnswerChange(question.id, checkboxAnswers.filter((a) => a !== opt), question.text)
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
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.text)}
            placeholder="Masukkan jawaban Anda..."
          />
        )

      case "textarea":
        return (
          <Textarea
            value={(currentAnswer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.text)}
            placeholder="Masukkan jawaban Anda..."
            rows={4}
          />
        )

      case "rating":
        return (
          <RadioGroup
            value={(currentAnswer as string) || ""}
            onValueChange={(val) => handleAnswerChange(question.id, val, question.text)}
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
            onChange={(e) => handleAnswerChange(question.id, e.target.value, question.text)}
            placeholder="Masukkan jawaban Anda..."
          />
        )
    }
  }



  return (
    <SurveyStatusGuard>
      <div className="min-h-screen bg-white">
        {/* Header dengan black and white design */}
        <div className="relative bg-white border-b-2 border-black">
          <div className="relative max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => router.push('/survey')}
                className="flex items-center gap-2 border-2 border-black hover:border-gray-600 bg-white rounded-xl font-medium transition-all duration-200 hover:shadow-md"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Survey
              </Button>

              {/* Progress indicator */}
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl px-4 py-2 border-2 border-black">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="text-sm font-regular text-black">
                      Section {currentIndex + 1} of {totalSections}
                    </span>
                  </div>
                </div>


              </div>
            </div>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-4 tracking-tight">
                {currentSection.title}
              </h1>

              {selectedEmployee && (
                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-200">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm font-bold text-black">
                    <span className="font-bold text-black">{selectedEmployee?.name || "Unknown"}</span>
                    <span className="text-gray-600 ml-1">({selectedEmployee?.position || "Unknown"})</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions dengan black and white design */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {questionsLoading ? (
              <SurveyStepSkeleton />
            ) : questions && questions.length > 0 ? (
              questions.map((question) => (
                <div key={question.id} className="group">
                  <div className="bg-white rounded-2xl shadow-2xl border-2 border-black p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-black mb-2 leading-relaxed">
                          {question.text}
                        </h3>
                        <div className="mt-4">
                          {renderQuestion(question)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-black p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-black mb-3">No questions found</h3>
                <p className="text-gray-600 mb-6">This section doesn&apos;t have any questions yet.</p>
                <Button
                  onClick={() => router.push('/survey')}
                  className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
                >
                  Back to Survey
                </Button>
              </div>
            )}
          </div>

          {/* Questions validation indicator */}
          {questions && questions.length > 0 && (
            <div className="mt-8 mb-4">
              {!areAllQuestionsAnswered() && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800">
                      Please answer all questions to continue
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700">
                    {questions.length - questions.filter(q => answers[q.id] &&
                      (typeof answers[q.id] === 'string' ? (answers[q.id] as string).trim() !== '' :
                        Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : false)).length} of {questions.length} questions answered
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation dengan black and white design */}
          <div className="flex justify-between items-center mt-12">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 border-2 border-black hover:border-gray-600 bg-white rounded-xl font-medium py-3 px-6 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">
                {currentIndex + 1} of {totalSections} sections
              </div>
              <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden mx-auto border border-black">
                <div
                  className="h-full bg-black rounded-full transition-all duration-500"
                  style={{ width: `${((currentIndex + 1) / totalSections) * 100}%` }}
                ></div>
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={submitSurvey.isPending || !areAllQuestionsAnswered()}
              className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
            >
              {submitSurvey.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
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
