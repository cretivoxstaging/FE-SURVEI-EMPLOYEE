"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Calendar, User, CheckCircle, BarChart3, MessageSquare, Type, Star, Hash } from "lucide-react"
import { useSurveyResultById } from "@/hooks/use-survey-results"
import { useQuestions } from "@/hooks/use-questions"
import { useSection } from "@/hooks/use-sections"
import { SurveyScoring } from "@/components/survey-scoring"
import { apiClient } from "@/lib/api-client"
import type { ConfigQuestion, ConfigSection, ApiQuestion } from "@/types/survey"

interface SurveyResultsDialogProps {
  surveyId: number | undefined
  employeeId: string | number
  employeeName: string
  children: React.ReactNode
}

export function SurveyResultsDialog({ surveyId, employeeId, employeeName, children }: SurveyResultsDialogProps) {
  const [open, setOpen] = useState(false)
  const { getSurveyResultById } = useSurveyResultById(surveyId || 0)
  const { data, isLoading, isError, error } = getSurveyResultById


  // Fetch all questions and sections for mapping
  const { questions: allQuestions, isLoading: questionsLoading } = useQuestions("", "", { enabled: open })
  const { sections, isLoading: sectionsLoading } = useSection()

  // Additional fallback: fetch questions directly from API for better compatibility
  const { data: rawQuestionsData, isLoading: rawQuestionsLoading } = useQuery({
    queryKey: ["raw-questions"],
    queryFn: async () => {
      const response = await apiClient.get("/api/v1/question")
      return response.data
    },
    enabled: open && !questionsLoading && allQuestions?.length === 0,
  })

  const surveyData = data?.data

  // Create lookup maps for questions and sections
  const questionMap = useMemo(() => {
    const map = new Map<string, ConfigQuestion>()

    // Use processed questions first
    allQuestions?.forEach((q) => {
      // Try multiple ID formats to ensure we catch the question
      const stringId = String(q.id)
      map.set(stringId, q)
      map.set(q.id, q)

      // Also try without any string conversion
      if (typeof q.id === "number") {
        map.set(String(q.id), q)
      }
    })

    // If we don't have processed questions, try raw API data
    if (map.size === 0 && rawQuestionsData) {
      console.log("🔍 Using raw questions data as fallback")
      const rawQuestions = rawQuestionsData?.data || rawQuestionsData || []
      rawQuestions.forEach((q: ApiQuestion) => {
        const stringId = String(q.id)
        const configQuestion: ConfigQuestion = {
          id: stringId,
          text: q.text || q.question || "",
          type:
            q.type === "multiple-choice"
              ? "multiple-choice"
              : q.type === "textarea"
                ? "textarea"
                : q.type === "rating"
                  ? "rating"
                  : "textarea",
          options: q.option ? Object.values(q.option) : undefined,
          required: Boolean(q.required),
        }

        map.set(stringId, configQuestion)
        map.set(String(q.id), configQuestion)
        if (typeof q.id === "number") {
          map.set(String(q.id), configQuestion)
        }
      })
    }

    console.log("🔍 Question Map created:", {
      totalQuestions: allQuestions?.length || 0,
      rawQuestionsAvailable: !!rawQuestionsData,
      mapSize: map.size,
      sampleKeys: Array.from(map.keys()).slice(0, 10),
      sampleQuestions: Array.from(map.values())
        .slice(0, 3)
        .map((q) => ({
          id: q.id,
          idType: typeof q.id,
          text: q.text?.substring(0, 50) + "...",
          type: q.type,
        })),
    })
    return map
  }, [allQuestions, rawQuestionsData])

  const sectionMap = useMemo(() => {
    const map = new Map<string, ConfigSection>()
    sections?.forEach((s) => {
      map.set(String(s.id), s)
      map.set(s.id, s)
    })
    console.log("🔍 Section Map created:", {
      totalSections: sections?.length || 0,
      mapSize: map.size,
      sampleKeys: Array.from(map.keys()).slice(0, 5),
    })
    return map
  }, [sections])

  // Enhanced survey results with question and section details
  const enhancedSurveyResults = useMemo(() => {
    if (!surveyData?.surveyResult) return []

    console.log("🔍 Processing survey results:", {
      totalSections: surveyData.surveyResult.length,
      questionMapSize: questionMap.size,
      sectionMapSize: sectionMap.size,
    })

    return surveyData.surveyResult.map((sectionResult, sectionIndex) => {
      const sectionId = sectionResult.section
      const section = sectionMap.get(sectionId)

      console.log(`🔍 Processing section ${sectionIndex}:`, {
        sectionId,
        sectionTitle: section?.title,
        questionIds: sectionResult.question,
        answers: sectionResult.answer,
      })

      const enhancedQuestions = sectionResult.question.map((questionId, index) => {
        // Try multiple ways to find the question
        let question =
          questionMap.get(String(questionId)) ||
          questionMap.get(questionId) ||
          questionMap.get(String(Number(questionId)))

        // If still not found, try to find by exact match in all questions
        if (!question && allQuestions) {
          question = allQuestions.find(
            (q) => String(q.id) === String(questionId) || String(q.id) === String(questionId),
          )
        }

        // If still not found and we have raw questions data, try that too
        if (!question && rawQuestionsData) {
          const rawQuestions = rawQuestionsData?.data || rawQuestionsData || []
          const rawQuestion = rawQuestions.find(
            (q: ApiQuestion) =>
              String(q.id) === String(questionId) || String(q.id) === String(questionId),
          )

          if (rawQuestion) {
            question = {
              id: String(rawQuestion.id),
              text: rawQuestion.text || rawQuestion.question || "",
              type:
                rawQuestion.type === "multiple-choice"
                  ? "multiple-choice"
                  : rawQuestion.type === "textarea"
                    ? "textarea"
                    : rawQuestion.type === "rating"
                      ? "rating"
                      : "textarea",
              options: rawQuestion.option ? Object.values(rawQuestion.option) : undefined,
              required: Boolean(rawQuestion.required),
            }
          }
        }

        const answer = sectionResult.answer[index] || "No answer provided"

        console.log(`🔍 Processing question ${index}:`, {
          questionId,
          questionIdType: typeof questionId,
          questionFound: !!question,
          questionText: question?.text,
          questionIdFromFound: question?.id,
          answer: answer,
          availableKeys: Array.from(questionMap.keys()).slice(0, 5),
        })

        return {
          id: questionId,
          text: question?.text || `Question ${questionId}`,
          type: question?.type || "unknown",
          options: question?.options || [],
          answer: answer,
          required: question?.required || false,
        }
      })

      return {
        sectionId,
        sectionTitle: section?.title || sectionId,
        sectionDescription: "",
        questions: enhancedQuestions,
      }
    })
  }, [surveyData, questionMap, sectionMap, allQuestions, rawQuestionsData])

  // Debug logging
  console.log("🔍 SurveyResultsDialog - Survey ID:", surveyId)
  console.log("🔍 SurveyResultsDialog - Employee ID:", employeeId)
  console.log("🔍 SurveyResultsDialog - Survey Data:", surveyData)
  console.log("🔍 SurveyResultsDialog - Enhanced Results:", enhancedSurveyResults)
  console.log("🔍 SurveyResultsDialog - Loading:", isLoading)
  console.log("🔍 SurveyResultsDialog - Error:", error)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] bg-white border-0 shadow-2xl">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-black">Survey Results</div>
              <div className="text-sm font-normal text-gray-600 mt-1">{employeeName}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          {!surveyId || surveyId === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-black text-lg mb-2">No survey available</p>
              <p className="text-sm text-gray-500">This employee hasn&apos;t completed any surveys yet.</p>
            </div>
          ) : isLoading || questionsLoading || sectionsLoading || rawQuestionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black mx-auto mb-4"></div>
                <p className="text-black font-medium">Loading survey results...</p>
                <p className="text-sm text-gray-500 mt-2">
                  {questionsLoading && "Fetching questions..."}
                  {rawQuestionsLoading && "Fetching raw questions..."}
                  {sectionsLoading && "Fetching sections..."}
                  {isLoading && "Loading survey data..."}
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <p className="font-semibold text-black text-lg mb-2">Failed to load survey results</p>
              <p className="text-sm text-gray-500 mb-6">{error?.message || "An error occurred"}</p>
              <Button onClick={() => getSurveyResultById.refetch()} className="bg-black text-white hover:bg-gray-800">
                Try Again
              </Button>
            </div>
          ) : !surveyData ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold text-black text-lg mb-2">No survey results found</p>
              <p className="text-sm text-gray-500">This employee hasn&apos;t completed any surveys yet.</p>
            </div>
          ) : (
            <Tabs defaultValue="responses" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg mb-6">
                <TabsTrigger
                  value="responses"
                  className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-md transition-all"
                >
                  <FileText className="w-4 h-4" />
                  Responses
                </TabsTrigger>
                <TabsTrigger
                  value="scoring"
                  className="flex items-center gap-2 data-[state=active]:bg-black data-[state=active]:text-white rounded-md transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Scoring
                </TabsTrigger>
              </TabsList>

              <TabsContent value="responses" className="space-y-6 mt-0">
                <Card className="border-2 border-black shadow-none">
                  <CardHeader className="bg-black text-white">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                      <User className="w-5 h-5" />
                      Survey Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide">
                          <User className="w-3.5 h-3.5" />
                          Employee
                        </div>
                        <div className="text-black font-semibold text-lg">{surveyData.name}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide">
                          <Calendar className="w-3.5 h-3.5" />
                          Completed
                        </div>
                        <div className="text-black font-semibold text-lg">{surveyData.createdAt}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Status
                        </div>
                        <Badge className="bg-black text-white hover:bg-gray-800 font-semibold px-3 py-1">
                          {surveyData.conclutionResult}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-medium uppercase tracking-wide">
                          <FileText className="w-3.5 h-3.5" />
                          Sections
                        </div>
                        <div className="text-black font-semibold text-lg">{surveyData.surveyResult.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200"></div>
                    <h3 className="text-sm font-bold text-black uppercase tracking-wider">Survey Responses</h3>
                    <div className="h-px flex-1 bg-gray-200"></div>
                  </div>

                  {enhancedSurveyResults.map((section, sectionIndex) => (
                    <Card key={sectionIndex} className="border-2 border-black shadow-none overflow-hidden">
                      <CardHeader className="bg-black text-white p-6">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white">
                            <Hash className="w-5 h-5 text-black" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-xl">{section.sectionTitle}</div>
                            {section.sectionDescription && (
                              <p className="text-sm text-gray-300 font-normal mt-1.5 leading-relaxed">
                                {section.sectionDescription}
                              </p>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 bg-white">
                        <div className="space-y-8">
                          {section.questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="relative">
                              <div className="absolute -left-2 top-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {questionIndex + 1}
                              </div>

                              <div className="pl-10">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <h4 className="font-bold text-black text-lg leading-relaxed flex-1">
                                    {question.text}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {question.required && (
                                      <Badge className="bg-black text-white text-xs font-semibold px-2 py-1">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                  {question.type === "multiple-choice" ? (
                                    <MessageSquare className="w-4 h-4 text-gray-600" />
                                  ) : question.type === "textarea" ? (
                                    <Type className="w-4 h-4 text-gray-600" />
                                  ) : (
                                    <Star className="w-4 h-4 text-gray-600" />
                                  )}
                                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {question.type === "multiple-choice"
                                      ? "Multiple Choice"
                                      : question.type === "textarea"
                                        ? "Text Response"
                                        : "Rating Scale"}
                                  </span>
                                </div>

                                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-5">
                                  <div className="flex items-center gap-2 mb-3">
                                    <CheckCircle className="w-4 h-4 text-black" />
                                    <span className="text-xs font-bold text-black uppercase tracking-wider">
                                      Answer
                                    </span>
                                  </div>
                                  <p className="text-black font-medium text-base leading-relaxed">{question.answer}</p>
                                </div>

                                {question.type === "multiple-choice" && question.options.length > 0 && (
                                  <div className="mt-4 border-2 border-gray-200 rounded-lg p-5 bg-white">
                                    <p className="text-xs font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                      <MessageSquare className="w-4 h-4" />
                                      Available Options
                                    </p>
                                    <div className="space-y-2">
                                      {question.options.map((option, optionIndex) => (
                                        <div
                                          key={optionIndex}
                                          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${option === question.answer
                                            ? "bg-black text-white"
                                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                            }`}
                                        >
                                          <span
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${option === question.answer
                                              ? "bg-white text-black"
                                              : "bg-white text-black border-2 border-gray-300"
                                              }`}
                                          >
                                            {String.fromCharCode(65 + optionIndex)}
                                          </span>
                                          <span
                                            className={`flex-1 ${option === question.answer ? "font-bold" : "font-medium"
                                              }`}
                                          >
                                            {option}
                                          </span>
                                          {option === question.answer && (
                                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {questionIndex < section.questions.length - 1 && (
                                <div className="mt-8 border-t-2 border-gray-100"></div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {enhancedSurveyResults.length === 0 && (
                  <Card className="border-2 border-gray-200 shadow-none">
                    <CardContent className="text-center py-16">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <FileText className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">No survey responses found</h3>
                      <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        This employee completed the survey but didn&apos;t provide any answers, or the survey data is
                        incomplete.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="scoring" className="mt-6">
                <SurveyScoring surveyData={surveyData} />
              </TabsContent>
            </Tabs>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
