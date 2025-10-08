"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Plus, Edit, Trash2, Hash, AlertCircle, ChevronDown, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { AddSectionModal } from "@/components/add-section-modal"
import { EditSectionModal } from "@/components/edit-section-modal"
import { AddQuestionModal } from "@/components/add-question-modal"
import { EditQuestionModal } from "@/components/edit-question-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { SurveyKanban } from "@/components/survey-kanban"
import { SurveyConfigurationSkeleton } from "@/components/survey-configuration-skeleton"
import type { ConfigQuestion, ConfigSection } from "@/types/survey"
import { useSection } from "@/hooks/use-sections"
import { useQuestion } from "@/hooks/use-questions"
import { AppSidebar } from "@/components/app-sidebar"
import { useProtectedRoute } from "@/hooks/use-protected-route"

// ======================
// Page component
// ======================
export default function SurveyConfigurationPage() {
  // Protect this route
  useProtectedRoute()

  // Sections
  const { sections, addSection, updateSection, deleteSection, reorderSections, isLoading, isError, error } = useSection()

  console.log("📊 Sections data:", sections);
  console.log("📊 Sections loading:", isLoading);
  console.log("📊 Sections error:", isError, error);

  // Manage which section is "active" for add/edit operations
  const [selectedSection, setSelectedSection] = useState<string>("")

  // Manage which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Remove view mode state since we only use kanban now

  // Hook untuk addQuestion berdasarkan selectedSection (query-nya disabled saat kosong)
  // Use a default section ID if selectedSection is empty to avoid hook issues
  const { addQuestion, updateQuestion, deleteQuestion } = useQuestion(
    selectedSection || "1", // Use "1" as fallback to avoid empty string
    "" // sectionTitle can remain empty for CRUD operations
  )

  const [modals, setModals] = useState({
    addSection: false,
    editSection: false,
    addQuestion: false,
    editQuestion: false,
    deleteConfirm: false,
  })

  const [selectedQuestion, setSelectedQuestion] = useState<ConfigQuestion | null>(null)
  const [selectedSectionForEdit, setSelectedSectionForEdit] = useState<ConfigSection | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "section" | "question"
    id: string
    sectionId?: string
  } | null>(null)

  const openModal = (name: keyof typeof modals) => setModals((p) => ({ ...p, [name]: true }))
  const closeModal = (name: keyof typeof modals) => setModals((p) => ({ ...p, [name]: false }))

  const handleAddSection = (title: string) => {
    addSection.mutate(title, {
      onSuccess: () => {
        closeModal("addSection")
      },
      onError: (error) => {
        console.error("Failed to add section:", error)
        // Keep modal open on error so user can retry
      }
    })
  }

  const handleEditSection = (id: string, title: string) => {
    updateSection.mutate({ id, title })
    closeModal("editSection")
  }

  const handleDeleteSection = (id: string) => {
    deleteSection.mutate(id)
    closeModal("deleteConfirm")
  }

  const handleAddQuestion = (q: {
    text: string
    type: "multiple-choice" | "text" | "rating" | "textarea" | "yes-no" | "scale"
    options?: string[]
    required?: boolean
    scaleMin?: number
    scaleMax?: number
  }) => {
    if (!selectedSection) return

    // Auto-expand the section when adding a question
    setExpandedSections(prev => new Set([...prev, selectedSection]))

    // Prepare options for API
    let apiOptions = q.options;
    if (q.type === "yes-no") {
      apiOptions = ["Yes", "No"];
    } else if (q.type === "rating") {
      apiOptions = ["1", "2", "3", "4", "5"];
    } else if (q.type === "scale" && q.scaleMin && q.scaleMax) {
      apiOptions = Array.from({ length: q.scaleMax - q.scaleMin + 1 }, (_, i) => (q.scaleMin! + i).toString());
    }

    const newQuestion: ConfigQuestion = {
      id: `q-${Date.now()}`,
      text: q.text,
      type: q.type as ConfigQuestion["type"],
      options: apiOptions,
      required: q.required,
      scaleMin: q.scaleMin,
      scaleMax: q.scaleMax,
    }
    addQuestion.mutate(newQuestion, {
      onSuccess: () => {
        closeModal("addQuestion")
      },
      onError: (error) => {
        console.error("Failed to add question:", error)
        // Keep modal open on error so user can retry
      }
    })
  }

  const openDeleteModal = (type: "section" | "question", id: string, sectionId?: string) => {
    setDeleteTarget({ type, id, sectionId })
    openModal("deleteConfirm")
  }

  const handleEditQuestion = (q: {
    text: string
    type: "multiple-choice" | "text" | "rating" | "textarea" | "yes-no" | "scale"
    options?: string[]
    required?: boolean
    scaleMin?: number
    scaleMax?: number
  }) => {
    if (!selectedQuestion || !selectedSection) return

    // Prepare options for API
    let apiOptions = q.options;
    if (q.type === "yes-no") {
      apiOptions = ["Yes", "No"];
    } else if (q.type === "rating") {
      apiOptions = ["1", "2", "3", "4", "5"];
    } else if (q.type === "scale" && q.scaleMin && q.scaleMax) {
      apiOptions = Array.from({ length: q.scaleMax - q.scaleMin + 1 }, (_, i) => (q.scaleMin! + i).toString());
    }

    const updatedQuestion: ConfigQuestion & { sectionId: string } = {
      id: selectedQuestion.id,
      text: q.text,
      type: q.type as ConfigQuestion["type"],
      options: apiOptions,
      required: q.required,
      scaleMin: q.scaleMin,
      scaleMax: q.scaleMax,
      sectionId: selectedSection,
    }

    updateQuestion.mutate(updatedQuestion)
    closeModal("editQuestion")
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === "section") {
      handleDeleteSection(deleteTarget.id)
    } else if (deleteTarget.type === "question") {
      deleteQuestion.mutate(deleteTarget.id)
      closeModal("deleteConfirm")
    }
    setDeleteTarget(null)
  }

  const openEditQuestionModal = (sectionId: string, question: ConfigQuestion) => {
    setSelectedSection(sectionId)
    setSelectedQuestion(question)
    openModal("editQuestion")
  }

  const openAddQuestionModal = (sectionId: string) => {
    console.log("🎯 Opening add question modal for sectionId:", sectionId, "type:", typeof sectionId);
    setSelectedSection(sectionId)
    openModal("addQuestion")
  }

  const openEditSectionModal = (section: ConfigSection) => {
    setSelectedSectionForEdit(section)
    openModal("editSection")
  }

  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const handleReorderSections = (newOrder: ConfigSection[]) => {
    reorderSections.mutate(newOrder, {
      onSuccess: () => {
        console.log("✅ Sections reordered successfully");
        toast.success("Sections reordered successfully");
      },
      onError: (error) => {
        console.error("❌ Failed to reorder sections:", error);
        toast.error("Failed to reorder sections. Please try again.");
      }
    });
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <h1 className="text-lg font-bold">Survey Configuration</h1>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Error Display */}
          {isError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-2 p-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Failed to Load Sections</p>
                  <p className="text-sm text-red-600">
                    {error?.message || "Unknown error occurred"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Survey Configuration</h2>
              <p className="text-gray-600 mt-1">Create and manage survey sections and questions</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => openModal("addSection")}
                disabled={isLoading}
                title="Add a new section to your survey"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Section
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {sections && sections.length === 0 && !isLoading && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-12 text-center">
                <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sections Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first section to start building your survey
                </p>
                <Button
                  onClick={() => openModal("addSection")}
                  title="Create your first survey section"
                >
                  <Plus className="w-4 h-4 mr-2" /> Create First Section
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Render sections using kanban board */}
          <SurveyKanban
            sections={sections || []}
            onReorderSections={handleReorderSections}
            onAddQuestionModal={openAddQuestionModal}
            onEditSectionModal={openEditSectionModal}
            onDeleteModal={openDeleteModal}
            onEditQuestionModal={openEditQuestionModal}
            expandedSections={expandedSections}
            onToggleExpanded={toggleSectionExpanded}
            isLoading={isLoading}
          />

          {/* Modals */}
          <AddSectionModal
            open={modals.addSection}
            onClose={() => closeModal("addSection")}
            onAdd={handleAddSection}
            isLoading={addSection.isPending}
          />

          <EditSectionModal
            open={modals.editSection}
            onClose={() => closeModal("editSection")}
            section={selectedSectionForEdit}
            onEdit={handleEditSection}
            isLoading={updateSection.isPending}
          />

          <AddQuestionModal
            open={modals.addQuestion}
            onClose={() => closeModal("addQuestion")}
            onAdd={handleAddQuestion}
            isLoading={addQuestion.isPending}
          />

          <EditQuestionModal
            open={modals.editQuestion}
            onClose={() => closeModal("editQuestion")}
            question={selectedQuestion}
            onEdit={handleEditQuestion}
            isLoading={updateQuestion.isPending}
          />

          <DeleteConfirmModal
            open={modals.deleteConfirm}
            onClose={() => closeModal("deleteConfirm")}
            onConfirm={handleDelete}
            title={deleteTarget?.type === "section" ? "Delete section?" : "Delete question?"}
            description={deleteTarget ? `This will permanently delete the ${deleteTarget.type}.` : ""}
            isLoading={deleteTarget?.type === "section" ? deleteSection.isPending : deleteQuestion.isPending}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
