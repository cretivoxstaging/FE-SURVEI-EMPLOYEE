"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, User, Building2, Calendar } from "lucide-react"
import { useSurveyConfig } from "@/context/survey-config-context"

export default function SurveyPage() {
  const { active, loadActive } = useSurveyConfig()
  const [isActive, setIsActive] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setIsActive(typeof window !== "undefined" && localStorage.getItem("surveyActive") === "1")
    loadActive()
  }, [loadActive])

  // Jangan akses active.sections sebelum active ada
  const totalSections = active?.sections?.length || 0
  const currentSectionData = active?.sections?.[currentSection]

  const progress = totalSections ? ((currentSection + 1) / totalSections) * 100 : 0

  const handleInputChange = (questionId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentSection < totalSections - 1) setCurrentSection((s) => s + 1)
  }

  const handlePrevious = () => {
    if (currentSection > 0) setCurrentSection((s) => s - 1)
  }

  const isCurrentSectionComplete = () => {
    if (!currentSectionData) return false
    const requiredQuestions = currentSectionData.questions.filter((q) => q.required)
    return requiredQuestions.every((q) => (responses[q.id] ?? "").trim() !== "")
  }

  const handleSubmit = () => {
    console.log("Survey responses:", responses)
    setIsSubmitted(true)
  }

  if (!isActive || !active) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold">Survey sudah tidak menerima respon.</h2>
            <p className="text-gray-600">Silahkan hubungi pengelola sistem survey. Terimakasih</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-12">Terima Kasih!</h2>
            <p className="text-gray-600 mb-4">
              Survei Anda telah berhasil dikirim. Feedback Anda sangat berharga untuk kemajuan perusahaan.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{active.title || "Annual Survey Employee"}</h1>
          {active.description && <p className="mt-2 text-sm text-gray-600">{active.description}</p>}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Bagian {currentSection + 1} dari {totalSections}
            </span>
            <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% Selesai</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Survey Form */}
        {currentSectionData && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {currentSection === 0 && <User className="h-5 w-5 text-blue-600" />}
                  {currentSection === 1 && <Calendar className="h-5 w-5 text-green-600" />}
                  {currentSection === 2 && <Building2 className="h-5 w-5 text-purple-600" />}
                  {currentSection >= 3 && <CheckCircle className="h-5 w-5 text-orange-600" />}
                  <CardTitle className="text-xl">{currentSectionData.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentSectionData.questions.map((q, index) => (
                  <div key={q.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">{q.question}</Label>
                      {q.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                    </div>

                    {q.type === "text" && (
                      <Input
                        value={responses[q.id] || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="Masukkan Jawaban Anda"
                        className="max-w-md"
                      />
                    )}

                    {q.type === "radio" && q.options && (
                      <RadioGroup value={responses[q.id] || ""} onValueChange={(v) => handleInputChange(q.id, v)}>
                        {q.options.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2">
                            <RadioGroupItem className="border-gray-400" value={opt} id={`${q.id}-${opt}`} />
                            <Label htmlFor={`${q.id}-${opt}`} className="cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {q.type === "textarea" && (
                      <Textarea
                        value={responses[q.id] || ""}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        placeholder="Masukkan Jawaban Anda"
                        rows={4}
                        className="resize-none"
                      />
                    )}

                    {index < currentSectionData.questions.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentSection === 0}>
                Sebelumnya
              </Button>

              {currentSection === totalSections - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isCurrentSectionComplete()}
                  className="bg-white hover:bg-gray-100 cursor-pointer border text-black"
                >
                  Kirim Survei
                </Button>
              ) : (
                <Button
                  className="md:mt-12 bg-white text-black border cursor-pointer hover:bg-white"
                  onClick={handleNext}
                  disabled={!isCurrentSectionComplete()}
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
