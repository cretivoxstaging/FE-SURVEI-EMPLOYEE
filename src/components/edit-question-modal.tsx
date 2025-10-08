"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ConfigQuestion } from "@/types/survey"

type QuestionType = "multiple-choice" | "textarea" | "rating"

export function EditQuestionModal({
  open,
  onClose,
  question,
  onEdit,
  isLoading = false,
}: {
  open: boolean
  onClose: () => void
  question: ConfigQuestion | null
  onEdit: (q: {
    text: string
    type: QuestionType
    options?: string[]
    required?: boolean
    scaleMin?: number
    scaleMax?: number
  }) => void
  isLoading?: boolean
}) {
  const [text, setText] = React.useState("")
  const [type, setType] = React.useState<QuestionType>("multiple-choice")
  const [required, setRequired] = React.useState<boolean>(true)
  const [optionInput, setOptionInput] = React.useState("")
  const [options, setOptions] = React.useState<string[]>([])

  React.useEffect(() => {
    if (open && question) {
      setText(question.text)
      setType(question.type)
      setRequired(Boolean(question.required))
      setOptions(question.options ?? [])
      setOptionInput("")
    }
  }, [open, question])

  const addOption = () => {
    const v = optionInput.trim()
    if (!v) return
    setOptions((prev) => [...prev, v])
    setOptionInput("")
  }

  const removeOption = (idx: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== idx))
  }

  const moveOption = (idx: number, direction: "up" | "down") => {
    const newOptions = [...options]
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx >= 0 && newIdx < newOptions.length) {
      [newOptions[idx], newOptions[newIdx]] = [newOptions[newIdx], newOptions[idx]]
      setOptions(newOptions)
    }
  }

  const canSubmit =
    text.trim().length > 0 &&
    (type === "multiple-choice" ? options.length >= 2 : true)

  const getQuestionDescription = () => {
    switch (type) {
      case "multiple-choice":
        return "Respondents can select one option from a list"
      case "textarea":
        return "Respondents can enter a longer text response"
      case "rating":
        return "Respondents can rate on a scale of 1-5"
      default:
        return ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="edit-question-text">Question Text *</Label>
            <Textarea
              id="edit-question-text"
              placeholder="Enter your question..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="edit-question-type">Question Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
              <SelectTrigger id="edit-question-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="textarea">Long Text</SelectItem>
                <SelectItem value="rating">Rating (1-5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-sm text-blue-800">
                <strong>Question Type:</strong> {getQuestionDescription()}
              </p>
            </CardContent>
          </Card>

          {type === "multiple-choice" && (
            <div className="space-y-3">
              <Label>Options * (minimum 2 required)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add option"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                />
                <Button type="button" onClick={addOption} disabled={!optionInput.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Options ({options.length}):</p>
                  <div className="space-y-2">
                    {options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded bg-white">
                        <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveOption(idx, "up")}
                            disabled={idx === 0}
                          >
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveOption(idx, "down")}
                            disabled={idx === options.length - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {type === "rating" && (
            <div className="space-y-2">
              <Label>Rating Scale Options</Label>
              <div className="flex gap-2 flex-wrap">
                {["1", "2", "3", "4", "5"].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 p-3 border rounded bg-blue-50">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {rating}
                    </span>
                    <span>{rating === "1" ? "Sangat Tidak Setuju" : rating === "5" ? "Sangat Setuju" : rating}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            onClick={() => {
              if (!canSubmit) return

              let finalOptions = options;
              if (type === "rating") {
                finalOptions = ["1", "2", "3", "4", "5"];
              }

              onEdit({
                text: text.trim(),
                type,
                options: (type === "multiple-choice" || type === "rating") ? finalOptions : undefined,
                required,
              })
            }}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
