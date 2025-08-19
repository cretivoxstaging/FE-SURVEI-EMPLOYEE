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
import { AddSectionModal } from "@/components/add-section-modal"
import { AddQuestionModal } from "@/components/add-question-modal"
import { EditQuestionModal } from "@/components/edit-question-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { useSurveyConfig } from "@/context/survey-config-context"
import type { ConfigQuestion } from "@/types/survey"
import { AppSidebar } from "@/components/app-sidebar"

// (Optional) ganti AppSidebar sesuai project kamu
function AppSidebarStub() {
  return <aside className="hidden md:block w-64 border-r" />
}

export default function SurveyConfigurationPage() {
  const { draft, setDraft, publish } = useSurveyConfig()

  const [modals, setModals] = useState({
    addSection: false,
    addQuestion: false,
    editQuestion: false,
    deleteConfirm: false,
  })

  const [selectedSection, setSelectedSection] = useState<string>("")
  const [selectedQuestion, setSelectedQuestion] = useState<ConfigQuestion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "question"
    id: string
    sectionId?: string
  } | null>(null)

  const openModal = (name: keyof typeof modals) => setModals((p) => ({ ...p, [name]: true }))
  const closeModal = (name: keyof typeof modals) => setModals((p) => ({ ...p, [name]: false }))

  const handleAddSection = (title: string) => {
    const newSection = { id: `section-${Date.now()}`, title, questions: [] as ConfigQuestion[] }
    setDraft((prev) => ({ ...prev, sections: [...prev.sections, newSection] }))
    closeModal("addSection")
  }

  const handleAddQuestion = (
    sectionId: string,
    q: { text: string; type: "multiple-choice" | "text" | "rating"; options?: string[]; required?: boolean }
  ) => {
    const newQuestion: ConfigQuestion = { id: `q-${Date.now()}`, text: q.text, type: q.type, options: q.options, required: q.required }
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, questions: [...s.questions, newQuestion] } : s)),
    }))
    closeModal("addQuestion")
  }

  const handleEditQuestion = (
    sectionId: string,
    questionId: string,
    updated: { text: string; type: "multiple-choice" | "text" | "rating"; options?: string[]; required?: boolean }
  ) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...updated } : q)),
            }
          : s
      ),
    }))
    closeModal("editQuestion")
  }

  const openDeleteModal = (type: "section" | "question", id: string, sectionId?: string) => {
    setDeleteTarget({ type, id, sectionId })
    openModal("deleteConfirm")
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === "section") {
      setDraft((prev) => ({ ...prev, sections: prev.sections.filter((s) => s.id !== deleteTarget.id) }))
    } else if (deleteTarget.type === "question" && deleteTarget.sectionId) {
      setDraft((prev) => ({
        ...prev,
        sections: prev.sections.map((s) =>
          s.id === deleteTarget.sectionId ? { ...s, questions: s.questions.filter((q) => q.id !== deleteTarget.id) } : s
        ),
      }))
    }
    setDeleteTarget(null)
    closeModal("deleteConfirm")
  }

  const openEditQuestionModal = (sectionId: string, question: ConfigQuestion) => {
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
        <header className="flex h-16 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex-1" />
          <div className="px-4">
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Survey Configuration</h1>
              <p className="text-gray-600">Manage survey creation and configuration</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => openModal("addSection")} className="bg-black text-white hover:bg-gray-800">
                Add Section
              </Button>
              <Button variant="outline">Save Draft</Button>
              <Button onClick={publish} className="bg-green-600 text-white hover:bg-green-700">
                Publish & Activate
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Survey Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="survey-title">Survey Title</Label>
                <Input
                  id="survey-title"
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter survey title"
                />
              </div>
              <div>
                <Label htmlFor="survey-description">Description</Label>
                <Textarea
                  id="survey-description"
                  value={draft.description}
                  onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter survey description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {draft.sections.map((section) => (
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
                          <p className="text-xs text-gray-500 mb-2">
                            Type: {question.type} {question.required ? "• required" : ""}
                          </p>
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
          onAdd={(q) => handleAddQuestion(selectedSection, q)}
        />

        <EditQuestionModal
          open={modals.editQuestion}
          onClose={() => closeModal("editQuestion")}
          question={selectedQuestion}
          onEdit={(updated) => selectedQuestion && handleEditQuestion(selectedSection, selectedQuestion.id, updated)}
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
