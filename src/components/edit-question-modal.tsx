"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface Question {
  id: string
  text: string
  type: "multiple-choice" | "text" | "rating"
  options?: string[]
}

interface EditQuestionModalProps {
  open: boolean
  onClose: () => void
  question: Question | null
  onEdit: (question: Omit<Question, "id">) => void
}

export function EditQuestionModal({ open, onClose, question, onEdit }: EditQuestionModalProps) {
  const [editedQuestion, setEditedQuestion] = useState<Omit<Question, "id">>({
    text: "",
    type: "multiple-choice",
    options: [""],
  })

  useEffect(() => {
    if (question) {
      setEditedQuestion({
        text: question.text,
        type: question.type,
        options: question.options || [""],
      })
    }
  }, [question])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editedQuestion.text.trim()) {
      const cleanedQuestion = {
        ...editedQuestion,
        options:
          editedQuestion.type === "multiple-choice"
            ? editedQuestion.options?.filter((opt) => opt.trim() !== "")
            : undefined,
      }
      onEdit(cleanedQuestion)
    }
  }

  const addOption = () => {
    setEditedQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }))
  }

  const removeOption = (index: number) => {
    setEditedQuestion((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }))
  }

  const updateOption = (index: number, value: string) => {
    setEditedQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>Make changes to your question.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-question-text">Question Text</Label>
              <Textarea
                id="edit-question-text"
                value={editedQuestion.text}
                onChange={(e) => setEditedQuestion((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-question-type">Question Type</Label>
              <Select
                value={editedQuestion.type}
                onValueChange={(value: "multiple-choice" | "text" | "rating") =>
                  setEditedQuestion((prev) => ({
                    ...prev,
                    type: value,
                    options: value === "multiple-choice" ? prev.options || [""] : undefined,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="text">Text Response</SelectItem>
                  <SelectItem value="rating">Rating Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editedQuestion.type === "multiple-choice" && (
              <div className="grid gap-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {editedQuestion.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      {editedQuestion.options && editedQuestion.options.length > 1 && (
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
