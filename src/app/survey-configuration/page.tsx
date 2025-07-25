"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Hash } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AddSectionModal } from "@/components/add-section-modal"
import { AddQuestionModal } from "@/components/add-question-modal"
import { EditQuestionModal } from "@/components/edit-question-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"

interface Question {
  id: string
  text: string
  type: "multiple-choice" | "text" | "rating"
  options?: string[]
}

interface Section {
  id: string
  title: string
  questions: Question[]
}

interface Survey {
  title: string
  description: string
  sections: Section[]
}

export default function SurveyConfigurationPage() {
  const [survey, setSurvey] = useState<Survey>({
    title: "",
    description: "",
    sections: [
      {
        id: "section-1",
        title: "Section 1",
        questions: [
          {
            id: "q1",
            text: "How would you describe your overall level of job satisfaction?",
            type: "multiple-choice",
            options: ["Very Satisfied", "Somewhat Satisfied", "Neutral", "Somewhat Dissatisfied", "Very Dissatisfied"],
          },
          {
            id: "q2",
            text: "How would you describe your overall level of job satisfaction?",
            type: "multiple-choice",
            options: ["Very Satisfied", "Somewhat Satisfied", "Neutral", "Somewhat Dissatisfied", "Very Dissatisfied"],
          },
          {
            id: "q3",
            text: "How would you describe your overall level of job satisfaction?",
            type: "multiple-choice",
            options: [],
          },
        ],
      },
      {
        id: "section-2",
        title: "Section 2",
        questions: [],
      },
    ],
  })

  const [modals, setModals] = useState({
    addSection: false,
    addQuestion: false,
    editQuestion: false,
    deleteConfirm: false,
  })

  const [selectedSection, setSelectedSection] = useState<string>("")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "question"
    id: string
    sectionId?: string
  } | null>(null)

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: true }))
  }

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }))
  }

  const handleAddSection = (title: string) => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title,
      questions: [],
    }
    setSurvey((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }))
    closeModal("addSection")
  }

  const handleAddQuestion = (sectionId: string, question: Omit<Question, "id">) => {
    const newQuestion: Question = {
      ...question,
      id: `q-${Date.now()}`,
    }
    setSurvey((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, questions: [...section.questions, newQuestion] } : section,
      ),
    }))
    closeModal("addQuestion")
  }

  const handleEditQuestion = (sectionId: string, questionId: string, updatedQuestion: Omit<Question, "id">) => {
    setSurvey((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              questions: section.questions.map((q) =>
                q.id === questionId ? { ...updatedQuestion, id: questionId } : q,
              ),
            }
          : section,
      ),
    }))
    closeModal("editQuestion")
  }

  const handleDelete = () => {
    if (!deleteTarget) return

    if (deleteTarget.type === "section") {
      setSurvey((prev) => ({
        ...prev,
        sections: prev.sections.filter((section) => section.id !== deleteTarget.id),
      }))
    } else if (deleteTarget.type === "question" && deleteTarget.sectionId) {
      setSurvey((prev) => ({
        ...prev,
        sections: prev.sections.map((section) =>
          section.id === deleteTarget.sectionId
            ? {
                ...section,
                questions: section.questions.filter((q) => q.id !== deleteTarget.id),
              }
            : section,
        ),
      }))
    }

    setDeleteTarget(null)
    closeModal("deleteConfirm")
  }

  const openDeleteModal = (type: "section" | "question", id: string, sectionId?: string) => {
    setDeleteTarget({ type, id, sectionId })
    openModal("deleteConfirm")
  }

  const openEditQuestionModal = (sectionId: string, question: Question) => {
    setSelectedSection(sectionId)
    setSelectedQuestion(question)
    openModal("editQuestion")
  }

  const openAddQuestionModal = (sectionId: string) => {
    setSelectedSection(sectionId)
    openModal("addQuestion")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex-1" />
          <div className="px-4">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Survey Configuration</h1>
              <p className="text-gray-600">Manage survey creation and configuration</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openModal("addSection")} className="bg-black text-white hover:bg-gray-800">
                Add Section
              </Button>
              <Button variant="outline">Save Changes</Button>
            </div>
          </div>

          {/* Survey Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Survey Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="survey-title">Survey Title</Label>
                <Input
                  id="survey-title"
                  value={survey.title}
                  onChange={(e) => setSurvey((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter survey title"
                />
              </div>
              <div>
                <Label htmlFor="survey-description">Description</Label>
                <Textarea
                  id="survey-description"
                  value={survey.description}
                  onChange={(e) => setSurvey((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter survey description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {survey.sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openAddQuestionModal(section.id)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteModal("section", section.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.questions.map((question) => (
                  <Card key={question.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-2">{question.text}</p>
                          {question.type === "multiple-choice" && question.options && question.options.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 font-medium">Options:</p>
                              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {question.options.map((option, index) => (
                                  <li key={index}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => openEditQuestionModal(section.id, question)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal("question", question.id, section.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {section.questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No questions in this section</p>
                    <Button
                      variant="outline"
                      className="mt-2 bg-transparent"
                      onClick={() => openAddQuestionModal(section.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals */}
        <AddSectionModal open={modals.addSection} onClose={() => closeModal("addSection")} onAdd={handleAddSection} />

        <AddQuestionModal
          open={modals.addQuestion}
          onClose={() => closeModal("addQuestion")}
          onAdd={(question) => handleAddQuestion(selectedSection, question)}
        />

        <EditQuestionModal
          open={modals.editQuestion}
          onClose={() => closeModal("editQuestion")}
          question={selectedQuestion}
          onEdit={(updatedQuestion) => handleEditQuestion(selectedSection, selectedQuestion?.id || "", updatedQuestion)}
        />

        <DeleteConfirmModal
          open={modals.deleteConfirm}
          onClose={() => closeModal("deleteConfirm")}
          onConfirm={handleDelete}
          title={deleteTarget?.type === "section" ? "Delete Section" : "Delete Question"}
          description={`Are you sure you want to delete this ${deleteTarget?.type}? This action cannot be undone.`}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
