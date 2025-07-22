"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, User, Building2, Calendar } from "lucide-react"
import { surveyData } from "@/lib/survey.data"
import { useSurvey } from "@/context/survey-context"

export default function SurveyPage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const { selectedEmployee } = useSurvey()
  const totalSections = surveyData.sections.length
  const progress = ((currentSection + 1) / totalSections) * 100

  const handleInputChange = (questionId: string, value: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleSubmit = () => {
    console.log("Employee:", selectedEmployee)
    console.log("Survey responses:", responses)
    setIsSubmitted(true)
  }

  const isCurrentSectionComplete = () => {
    const currentSectionData = surveyData.sections[currentSection]
    const requiredQuestions = currentSectionData.questions.filter((q) => q.required)
    return requiredQuestions.every(
      (question) => responses[question.id] && responses[question.id].trim() !== ""
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

  const currentSectionData = surveyData.sections[currentSection]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Annual Survey Employee</h1>
          {selectedEmployee && (
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">{selectedEmployee.name}</span> -{" "}
              {selectedEmployee.department}, {selectedEmployee.position}
            </p>
          )}
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {currentSection === 0 && <User className="h-5 w-5 text-blue-600" />}
                {currentSection === 1 && <Calendar className="h-5 w-5 text-green-600" />}
                {currentSection === 2 && <Building2 className="h-5 w-5 text-purple-600" />}
                {currentSection === 3 && <CheckCircle className="h-5 w-5 text-orange-600" />}
                <CardTitle className="text-xl">{currentSectionData.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentSectionData.questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">{question.question}</Label>
                    {question.required && (
                      <Badge variant="destructive" className="text-xs">
                        required
                      </Badge>
                    )}
                  </div>

                  {question.type === "text" && (
                    <Input
                      value={responses[question.id] || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder="Masukkan Jawaban Anda"
                      className="max-w-md"
                    />
                  )}

                  {question.type === "radio" && "options" in question && (
                    <RadioGroup
                      value={responses[question.id] || ""}
                      onValueChange={(value) => handleInputChange(question.id, value)}
                    >
                      {question?.options?.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem className="border-gray-400" value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === "textarea" && (
                    <Textarea
                      value={responses[question.id] || ""}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      placeholder="Masukkan Jawaban Anda"
                      rows={4}
                      className="resize-none"
                    />
                  )}

                  {index < currentSectionData.questions.length - 1 && (
                    <Separator className="my-4" />
                  )}
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
                className="md:mt-12 bg-white text-black border border-b-3 cursor-pointer hover:bg-white hover:border transition-all duration-300 border-black border-r-3"
                onClick={handleNext}
                disabled={!isCurrentSectionComplete()}
              >
                Selanjutnya
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
