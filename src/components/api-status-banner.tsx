"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface ApiStatusBannerProps {
  isUsingFallback: boolean
  className?: string
}

export function ApiStatusBanner({ isUsingFallback, className = "" }: ApiStatusBannerProps) {
  if (!isUsingFallback) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Connected to external API successfully
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>API Notice:</strong> External API is currently unavailable. Using demo data for testing purposes.
        The application is fully functional with sample sections and questions.
      </AlertDescription>
    </Alert>
  )
}
