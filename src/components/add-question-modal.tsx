"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { useFormValidation } from "@/hooks/use-form-validation"
import { questionSchema, type QuestionFormData } from "@/lib/validation"
import { Plus, X } from "lucide-react"

interface Question {
  text: string
  type: "multiple-choice" | "text" | "rating"
  options?: string[]
}

interface AddQuestionModalProps {
  open: boolean
  onClose: () => void
  onAdd: (question: Question) => void
}

export function AddQuestionModal({ open, onClose, onAdd }: AddQuestionModalProps) {
  const initialData: QuestionFormData = {
    text: "",
    type: "multiple-choice",
    options: [""],
  }

  const {
    data: question,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    getFieldError,
  } = useFormValidation({
    schema: questionSchema,
    initialData,
  })

  const onSubmit = async (data: QuestionFormData) => {
    const cleanedQuestion = {
      ...data,
      options: data.type === "multiple-choice" ? data.options?.filter((opt) => opt.trim() !== "") : undefined,
    }
    onAdd(cleanedQuestion)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const addOption = () => {
    const currentOptions = question.options || []
    handleChange("options", [...currentOptions, ""])
  }

  const removeOption = (index: number) => {
    const currentOptions = question.options || []
    const newOptions = currentOptions.filter((_, i) => i !== index)
    handleChange("options", newOptions)
  }

  const updateOption = (index: number, value: string) => {
    const currentOptions = question.options || []
    const newOptions = currentOptions.map((opt, i) => (i === index ? value : opt))
    handleChange("options", newOptions)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>Create a new question for this section.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)
        }}>
          <div className="grid gap-4 py-4">
            <FormField
              label="Question Text"
              error={getFieldError("text")}
              required
            >
              <Textarea
                id="question-text"
                value={question.text}
                onChange={(e) => handleChange("text", e.target.value)}
                placeholder="Enter your question"
                className={getFieldError("text") ? "border-destructive" : ""}
              />
            </FormField>

            <FormField
              label="Question Type"
              error={getFieldError("type")}
            >
              <Select
                value={question.type}
                onValueChange={(value: "multiple-choice" | "text" | "rating") => {
                  handleChange("type", value)
                  if (value === "multiple-choice") {
                    handleChange("options", [""])
                  } else {
                    handleChange("options", undefined)
                  }
                }}
              >
                <SelectTrigger className={getFieldError("type") ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="text">Text Response</SelectItem>
                  <SelectItem value="rating">Rating Scale</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {question.type === "multiple-choice" && (
              <FormField
                label="Options"
                error={getFieldError("options")}
              >
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className={getFieldError("options") ? "border-destructive" : ""}
                      />
                      {question.options && question.options.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeOption(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                </div>
              </FormField>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
