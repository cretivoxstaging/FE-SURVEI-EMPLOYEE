"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"

const ThankyouPage = () => {
  const [submissionData, setSubmissionData] = useState<{
    employeeName: string
    submissionDate: string
    year: string
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get submission data from localStorage
    const saved = localStorage.getItem("lastSurveySubmission")
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setSubmissionData(data)
      } catch (error) {
        console.error("Error parsing submission data:", error)
      }
    }
  }, [])

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Thank You!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Your survey response has been submitted successfully.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium">
              ✅ You have already completed the Annual Survey for this year.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You cannot submit the survey again until next year.
            </p>
          </div>

          {submissionData && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{submissionData.employeeName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Submitted on {submissionData.submissionDate}</span>
              </div>
              <div className="text-xs text-gray-500">
                Survey Year: {submissionData.year}
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-4">
              You have completed the survey for {currentYear}.
              You can participate again next year.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ThankyouPage

