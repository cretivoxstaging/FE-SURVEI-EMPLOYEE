"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"

type QuestionType = "multiple-choice" | "text" | "rating"

type Question = {
  id: string
  text: string
  type: QuestionType
  options?: string[]
  required?: boolean
}

export function EditQuestionModal({
  open,
  onClose,
  question,
  onEdit,
}: {
  open: boolean
  onClose: () => void
  question: Question | null
  onEdit: (q: { text: string; type: QuestionType; options?: string[]; required?: boolean }) => void
}) {
  const [text, setText] = React.useState("")
  const [type, setType] = React.useState<QuestionType>("multiple-choice")
  const [required, setRequired] = React.useState<boolean>(false)
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

  const canSubmit =
    text.trim().length > 0 &&
    (type === "multiple-choice" ? options.length >= 2 : true)

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Question Text</Label>
            <Input value={text} onChange={(e) => setText(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="rating">Rating (1–5 default)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Checkbox id="required_edit" checked={required} onCheckedChange={(v) => setRequired(Boolean(v))} />
              <Label htmlFor="required_edit" className="cursor-pointer">Required</Label>
            </div>
          </div>

          {type === "multiple-choice" && (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add option"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addOption()}
                />
                <Button type="button" onClick={addOption}><Plus className="w-4 h-4" /></Button>
              </div>
              {options.length > 0 && (
                <ul className="text-sm border rounded p-2 space-y-1">
                  {options.map((opt, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span>{opt}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeOption(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (!canSubmit) return
              onEdit({ text: text.trim(), type, options: type === "multiple-choice" ? options : undefined, required })
            }}
            disabled={!canSubmit}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
