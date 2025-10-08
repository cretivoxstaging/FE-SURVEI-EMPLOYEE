"use client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Edit,
  Trash2,
  Hash,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GripVertical
} from "lucide-react";
import type { ConfigQuestion, ConfigSection } from "@/types/survey";
import { useQuestion } from "@/hooks/use-questions";

// Sortable Section Card Component
interface SortableSectionCardProps {
  section: ConfigSection;
  onAddQuestionModal: (sectionId: string) => void;
  onEditSectionModal: (section: ConfigSection) => void;
  onDeleteModal: (type: "section" | "question", id: string, sectionId?: string) => void;
  onEditQuestionModal: (sectionId: string, q: ConfigQuestion) => void;
  isExpanded: boolean;
  onToggleExpanded: (sectionId: string) => void;
}

function SortableSectionCard({
  section,
  onAddQuestionModal,
  onEditSectionModal,
  onDeleteModal,
  onEditQuestionModal,
  isExpanded,
  onToggleExpanded,
}: SortableSectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Hook untuk questions
  const {
    questions,
    isLoading: qLoading,
    isError: qError,
    error: qErrorObj,
  } = useQuestion(section.id, section.title);

  const questionCount = questions?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader
          className="flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => onToggleExpanded(section.id)}
        >
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-200 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
            <Hash className="w-4 h-4" />
            <CardTitle>{section.title}</CardTitle>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {questionCount} question{questionCount !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onAddQuestionModal(section.id)}
              className="h-8 w-8 p-0"
              title="Add question to this section"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditSectionModal(section)}
              className="h-8 w-8 p-0"
              title="Edit this section"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDeleteModal("section", section.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete this section"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="animate-in slide-in-from-top-2 duration-200">
            {qLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Loading questions...</span>
              </div>
            )}

            {qError && (
              <div className="flex items-center gap-2 text-sm text-red-600 p-4 bg-red-50 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{qErrorObj?.message || "Failed to load questions"}</span>
              </div>
            )}

            {!qLoading && !qError && questionCount === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium mb-1">No questions yet</p>
                <p className="text-sm">Click the + button above to add your first question</p>
              </div>
            )}

            {questions && questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((q: ConfigQuestion) => (
                  <Card key={q.id} className="border-l-4 border-l-blue-500 hover:shadow-sm transition-shadow">
                    <CardContent className="flex justify-between items-start gap-3 p-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-2">{q.text}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${q.type === 'multiple-choice'
                            ? 'bg-blue-100 text-blue-800'
                            : q.type === 'textarea'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                            }`}>
                            {q.type === 'multiple-choice'
                              ? 'Multiple Choice'
                              : q.type === 'textarea'
                                ? 'Text'
                                : 'Rating (1-5)'
                            }
                          </span>
                          {q.required && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Required
                            </span>
                          )}
                        </div>

                        {q.type === "multiple-choice" &&
                          Array.isArray(q.options) &&
                          q.options.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-700">Options:</p>
                              <div className="grid grid-cols-1 gap-2">
                                {q.options.map((opt: string, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                                      {String.fromCharCode(65 + idx)}
                                    </span>
                                    <span className="text-gray-700">{opt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {q.type === "rating" && (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <div key={num} className="flex items-center gap-1 text-sm">
                                <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-xs font-medium">
                                  {String.fromCharCode(64 + num)}
                                </span>
                                <span className="text-gray-700">{num}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.type === "textarea" && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Response type:</span> Long text input
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditQuestionModal(section.id, q)}
                          className="h-8 w-8 p-0"
                          title="Edit this question"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteModal("question", q.id, section.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete this question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// Main Kanban Component
interface SurveyKanbanProps {
  sections: ConfigSection[];
  onReorderSections: (newOrder: ConfigSection[]) => void;
  onAddQuestionModal: (sectionId: string) => void;
  onEditSectionModal: (section: ConfigSection) => void;
  onDeleteModal: (type: "section" | "question", id: string, sectionId?: string) => void;
  onEditQuestionModal: (sectionId: string, q: ConfigQuestion) => void;
  expandedSections: Set<string>;
  onToggleExpanded: (sectionId: string) => void;
  isLoading?: boolean;
}

export function SurveyKanban({
  sections,
  onReorderSections,
  onAddQuestionModal,
  onEditSectionModal,
  onDeleteModal,
  onEditQuestionModal,
  expandedSections,
  onToggleExpanded,
  isLoading = false,
}: SurveyKanbanProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over?.id);

      const newOrder = arrayMove(sections, oldIndex, newIndex);
      onReorderSections(newOrder);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-2 border-dashed border-gray-200 w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="pt-2">
                <Skeleton className="h-8 w-full rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Remove loading state for reordering since it's instant now

  if (!sections || sections.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sections Yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first section to start building your survey
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((section) => section.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sections.map((section) => (
            <SortableSectionCard
              key={section.id}
              section={section}
              onAddQuestionModal={onAddQuestionModal}
              onEditSectionModal={onEditSectionModal}
              onDeleteModal={onDeleteModal}
              onEditQuestionModal={onEditQuestionModal}
              isExpanded={expandedSections.has(section.id)}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
