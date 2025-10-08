"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, TrendingUp, Target, Award } from "lucide-react"
import { useQuestions } from "@/hooks/use-questions"

interface SurveyScoringProps {
  surveyData: {
    id: number
    createdAt: string
    employeeID: string
    name: string
    surveyResult: Array<{
      date: string
      dataResult: Array<{
        answer: string[]
        section: string
        question: string[]
      }>
      conclutionResult: string
    }>
    conclutionResult: string
  }
}

interface QuestionScore {
  questionId: string
  questionText: string
  answer: string
  score: number
  maxScore: number
  percentage: number
  category: 'excellent' | 'good' | 'average' | 'poor'
}

interface SectionScore {
  sectionName: string
  totalScore: number
  maxScore: number
  percentage: number
  questionScores: QuestionScore[]
  category: 'excellent' | 'good' | 'average' | 'poor'
}

export function SurveyScoring({ surveyData }: SurveyScoringProps) {
  // Get all questions to map question IDs to actual question text
  const { data: allQuestions, isLoading: questionsLoading } = useQuestions("", "", { enabled: true })

  // Create a map of question ID to question text for quick lookup
  const questionMap = new Map<string, string>()
  if (allQuestions) {
    allQuestions.forEach(q => {
      questionMap.set(q.id, q.text)
    })
  }

  // Helper function to calculate score based on answer type
  const calculateQuestionScore = (answer: string, questionType: string): { score: number; maxScore: number } => {
    if (questionType === 'rating') {
      const rating = parseInt(answer)
      return { score: rating, maxScore: 5 }
    }

    if (questionType === 'multiple-choice') {
      // Map multiple choice answers to scores
      const scoreMap: Record<string, number> = {
        'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1,
        'sangat setuju': 5, 'setuju': 4, 'netral': 3, 'tidak setuju': 2, 'sangat tidak setuju': 1,
        'sangat puas': 5, 'puas': 4, 'cukup puas': 3, 'tidak puas': 2, 'sangat tidak puas': 1,
        'selalu': 5, 'sering': 4, 'kadang-kadang': 3, 'jarang': 2, 'tidak pernah': 1
      }

      const normalizedAnswer = answer.toLowerCase().trim()
      const score = scoreMap[normalizedAnswer] || 3 // Default to neutral
      return { score, maxScore: 5 }
    }

    // For textarea, we'll use a simple length-based scoring
    if (questionType === 'textarea') {
      const length = answer.length
      if (length > 100) return { score: 5, maxScore: 5 }
      if (length > 50) return { score: 4, maxScore: 5 }
      if (length > 20) return { score: 3, maxScore: 5 }
      if (length > 10) return { score: 2, maxScore: 5 }
      return { score: 1, maxScore: 5 }
    }

    return { score: 3, maxScore: 5 } // Default neutral score
  }

  // Helper function to get category based on percentage
  const getCategory = (percentage: number): 'excellent' | 'good' | 'average' | 'poor' => {
    if (percentage >= 90) return 'excellent'
    if (percentage >= 70) return 'good'
    if (percentage >= 50) return 'average'
    return 'poor'
  }

  // Helper function to get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200'
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'average': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'poor': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'excellent': return <Award className="w-4 h-4" />
      case 'good': return <TrendingUp className="w-4 h-4" />
      case 'average': return <Target className="w-4 h-4" />
      case 'poor': return <BarChart3 className="w-4 h-4" />
      default: return <BarChart3 className="w-4 h-4" />
    }
  }

  // Process survey data to calculate scores
  const processSurveyScores = (): SectionScore[] => {
    const sectionScores: SectionScore[] = []

    // Get the latest submission data
    const latestSubmission = surveyData.surveyResult[surveyData.surveyResult.length - 1]
    if (!latestSubmission?.dataResult) return sectionScores

    latestSubmission.dataResult.forEach((sectionResult) => {
      const questionScores: QuestionScore[] = []
      let totalScore = 0
      let maxScore = 0

      sectionResult.question.forEach((questionId, index) => {
        const answer = sectionResult.answer[index] || ''
        const questionType = 'multiple-choice' // Default type, should be determined from question data
        const { score, maxScore: qMaxScore } = calculateQuestionScore(answer, questionType)
        const percentage = (score / qMaxScore) * 100

        questionScores.push({
          questionId,
          questionText: questionMap.get(questionId) || `Question ${questionId}`,
          answer,
          score,
          maxScore: qMaxScore,
          percentage,
          category: getCategory(percentage)
        })

        totalScore += score
        maxScore += qMaxScore
      })

      const sectionPercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

      sectionScores.push({
        sectionName: sectionResult.section,
        totalScore,
        maxScore,
        percentage: sectionPercentage,
        questionScores,
        category: getCategory(sectionPercentage)
      })
    })

    return sectionScores
  }

  const sectionScores = processSurveyScores()
  const overallScore = sectionScores.reduce((sum, section) => sum + section.totalScore, 0)
  const overallMaxScore = sectionScores.reduce((sum, section) => sum + section.maxScore, 0)
  const overallPercentage = overallMaxScore > 0 ? (overallScore / overallMaxScore) * 100 : 0
  const overallCategory = getCategory(overallPercentage)

  // Show skeleton loading while questions are being fetched
  if (questionsLoading) {
    return (
      <div className="space-y-6">
        {/* Overall Score Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Overall Survey Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="w-20 h-8" />
                  <Skeleton className="w-16 h-6" />
                </div>
                <Skeleton className="w-20 h-6" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Section Scores Skeleton */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Section Breakdown</h3>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="w-32 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-16 h-6" />
                    <Skeleton className="w-12 h-6" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <div className="space-y-2">
                    {[1, 2].map((j) => (
                      <div key={j} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-1" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-12 h-4" />
                          <Skeleton className="w-12 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Overall Survey Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getCategoryIcon(overallCategory)}
                <span className="text-2xl font-bold">{overallScore}/{overallMaxScore}</span>
                <Badge className={getCategoryColor(overallCategory)}>
                  {overallPercentage.toFixed(1)}%
                </Badge>
              </div>
              <Badge variant="outline" className={getCategoryColor(overallCategory)}>
                {overallCategory.toUpperCase()}
              </Badge>
            </div>
            <Progress value={overallPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Section Scores */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Section Breakdown</h3>
        {sectionScores.map((section, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(section.category)}
                  {section.sectionName}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{section.totalScore}/{section.maxScore}</span>
                  <Badge className={getCategoryColor(section.category)}>
                    {section.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={section.percentage} className="h-2" />

                {/* Question Details */}
                <div className="space-y-2">
                  {section.questionScores.map((question, qIndex) => (
                    <div key={qIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{question.questionText}</p>
                        <p className="text-xs text-gray-600">Answer: {question.answer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{question.score}/{question.maxScore}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getCategoryColor(question.category)}`}
                        >
                          {question.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
