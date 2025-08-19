"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AddSectionModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (title: string) => void
}) {
  const [title, setTitle] = React.useState("")

  React.useEffect(() => {
    if (!open) setTitle("")
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            placeholder="Section title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              if (title.trim().length) onAdd(title.trim())
            }}
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
