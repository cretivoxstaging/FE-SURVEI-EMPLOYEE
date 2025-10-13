"use client"

import { useActiveSurvey } from "@/hooks/use-active-survey"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SurveyStatusGuardProps {
  children: React.ReactNode
}

export function SurveyStatusGuard({ children }: SurveyStatusGuardProps) {
  const router = useRouter()
  const { isActiveSurvey, isLoading, isError } = useActiveSurvey()

  console.log("🔍 SurveyStatusGuard:", {
    isActiveSurvey,
    isLoading,
    isError,
    type: typeof isActiveSurvey
  })

  // Show loading state while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memeriksa status survey...</p>
        </div>
      </div>
    )
  }

  // If there's an error, show error message (fail closed for security)
  if (isError) {
    console.log("❌ Survey status error, showing error message")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg mx-4 border-2 border-yellow-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Tidak Dapat Memverifikasi Status</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-gray-700 font-medium mb-2">
                Tidak dapat memverifikasi status survey saat ini.
              </p>
              <p className="text-sm text-gray-600">
                Terjadi kesalahan saat mengecek status survey.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-2 border-black hover:bg-gray-100 font-medium py-3 rounded-xl transition-all duration-200"
              >
                Coba Lagi
              </Button>

              <Button
                onClick={() => router.push('/')}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-black"
              >
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If isActiveSurvey is undefined but not loading and no error, default to active (fail open)
  if (isActiveSurvey === undefined) {
    console.log("⚠️ isActiveSurvey is undefined, defaulting to active (fail open)")
    return <>{children}</>
  }

  // If survey is explicitly deactivated, show warning
  if (isActiveSurvey === false) {
    console.log("🚫 Survey is deactivated, showing warning")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-lg mx-4 border-2 border-black shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold italic text-gray-900">BELUM SAATNYA LO ISI NI SURVEY</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-50 border-2 border-black rounded-lg p-4">
              <p className="text-gray-700 italic font-medium mb-2 text-lg">
                SABAR KALI! 😤
              </p>
              <p className="text-sm text-gray-600">
                Survey belum dibuka oleh administrator.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <p className="text-sm text-gray-500">
                Tunggu sebentar ya, admin lagi siapin survey-nya!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If survey is active (true) or undefined (fallback), show survey
  console.log("✅ Survey is active, showing content")
  return <>{children}</>
}
