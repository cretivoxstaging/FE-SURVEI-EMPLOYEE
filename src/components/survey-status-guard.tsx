"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface SurveyStatusGuardProps {
  children: React.ReactNode
}

export function SurveyStatusGuard({ children }: SurveyStatusGuardProps) {
  const [isSurveyActive, setIsSurveyActive] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check survey status from localStorage
    const checkSurveyStatus = () => {
      try {
        const surveyActive = localStorage.getItem("surveyActive")
        // Default to true (active) if no value is set, only block if explicitly set to "0"
        const isActive = surveyActive !== "0"
        setIsSurveyActive(isActive)
        console.log("🔍 Survey Status Check:", { surveyActive, isActive, defaultingToActive: surveyActive === null })
      } catch (error) {
        console.error("Error checking survey status:", error)
        // Default to active on error
        setIsSurveyActive(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkSurveyStatus()

    // Listen for changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "surveyActive") {
        checkSurveyStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking survey status...</p>
        </div>
      </div>
    )
  }

  // Only show "Oh no..." message when survey is explicitly deactivated
  if (isSurveyActive === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-900">Oh... no!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Sorry, survey is not accepting responses at the moment.
            </p>
            <p className="text-sm text-gray-500">
              Please try again later or contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
