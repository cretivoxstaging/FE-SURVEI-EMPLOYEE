"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

export function AddSectionModal({
  open, 
  onClose,
  onAdd,
  isLoading = false,
}: {
  open: boolean
  onClose: () => void
  onAdd: (title: string) => void
  isLoading?: boolean
}) {
  const [title, setTitle] = React.useState("")

  React.useEffect(() => {
    if (!open) setTitle("")
  }, [open])

  const canSubmit = title.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="section-title">Section Title *</Label>
            <Input
              id="section-title"
              placeholder="Enter section title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <p className="text-sm text-blue-800">
                <strong>Section:</strong> A section groups related questions together.
                You can add multiple questions to each section after creating it.
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            onClick={() => {
              if (canSubmit) onAdd(title.trim())
            }}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? "Adding..." : "Add Section"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
