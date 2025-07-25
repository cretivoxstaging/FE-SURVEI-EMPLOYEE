"use client"

import type React from "react"

import { useState } from "react"
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
  const [question, setQuestion] = useState<Question>({
    text: "",
    type: "multiple-choice",
    options: [""],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.text.trim()) {
      const cleanedQuestion = {
        ...question,
        options: question.type === "multiple-choice" ? question.options?.filter((opt) => opt.trim() !== "") : undefined,
      }
      onAdd(cleanedQuestion)
      handleClose()
    }
  }

  const handleClose = () => {
    setQuestion({
      text: "",
      type: "multiple-choice",
      options: [""],
    })
    onClose()
  }

  const addOption = () => {
    setQuestion((prev) => ({
      ...prev,
      options: [...(prev.options || []), ""],
    }))
  }

  const removeOption = (index: number) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index),
    }))
  }

  const updateOption = (index: number, value: string) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>Create a new question for this section.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question-text">Question Text</Label>
              <Textarea
                id="question-text"
                value={question.text}
                onChange={(e) => setQuestion((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={question.type}
                onValueChange={(value: "multiple-choice" | "text" | "rating") =>
                  setQuestion((prev) => ({
                    ...prev,
                    type: value,
                    options: value === "multiple-choice" ? [""] : undefined,
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

            {question.type === "multiple-choice" && (
              <div className="grid gap-2">
                <Label>Options</Label>
                <div className="space-y-2">
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
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
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Question</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
