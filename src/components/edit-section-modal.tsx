"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function EditSectionModal({
  open,
  onClose,
  section,
  onEdit,
  isLoading = false,
}: {
  open: boolean
  onClose: () => void
  section: { id: string; title: string } | null
  onEdit: (id: string, title: string) => void
  isLoading?: boolean
}) {
  const [title, setTitle] = React.useState("")

  React.useEffect(() => {
    if (open && section) {
      setTitle(section.title)
    }
  }, [open, section])

  const canSubmit = title.trim().length > 0 && title !== section?.title

  const handleSubmit = () => {
    if (!section || !canSubmit) return
    onEdit(section.id, title.trim())
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-section-title">Section Title *</Label>
            <Input
              id="edit-section-title"
              placeholder="Enter section title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Changing the section title will update it across your entire survey.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
