"use client"

import { useEffect, useState } from "react"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SurveyStatusGuard } from "@/components/survey-status-guard"

const SurveyCompletedPage = () => {
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

  return (
    <SurveyStatusGuard>
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 w-24 h-24 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-black mb-4">Survey Already Completed</h1>
            <p className="text-xl text-gray-600">
              You have already submitted your survey for this year
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-black p-8 mb-8">
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-600 rounded-xl px-4 py-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-800">Survey Successfully Submitted</span>
              </div>
              <p className="text-gray-600 text-lg">
                Your response has been recorded and will help us improve our workplace environment.
                <br />
                You can participate again next year.
              </p>
            </div>

            {/* Submission Details */}
            {submissionData && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border-2 border-gray-200">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Submission Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Employee:</span>
                    <span>{submissionData.employeeName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Submitted:</span>
                    <span>{submissionData.submissionDate}</span>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 rounded-lg p-2 mt-3">
                    Survey Year: {submissionData.year}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  // Clear selected employee and go back to survey selection
                  localStorage.removeItem("selectedEmployee")
                  router.push('/survey')
                }}
                className="bg-black hover:bg-gray-800 text-white border-2 border-black font-medium py-3 px-8 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Survey Selection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SurveyStatusGuard>
  )
}

export default SurveyCompletedPage
