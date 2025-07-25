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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  id: string
  name: string
  email: string
  position: string
  division: string
  status: "Active" | "Inactive"
}

interface EditEmployeeModalProps {
  open: boolean
  onClose: () => void
  employee: Employee | null
  onEdit: (employee: Omit<Employee, "id">) => void
}

export function EditEmployeeModal({ open, onClose, employee, onEdit }: EditEmployeeModalProps) {
  const [editedEmployee, setEditedEmployee] = useState<Omit<Employee, "id">>({
    name: "",
    email: "",
    position: "",
    division: "",
    status: "Active",
  })

  useEffect(() => {
    if (employee) {
      setEditedEmployee({
        name: employee.name,
        email: employee.email,
        position: employee.position,
        division: employee.division,
        status: employee.status,
      })
    }
  }, [employee])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      editedEmployee.name.trim() &&
      editedEmployee.email.trim() &&
      editedEmployee.position.trim() &&
      editedEmployee.division.trim()
    ) {
      onEdit(editedEmployee)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Make changes to employee information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-employee-name">Full Name</Label>
              <Input
                id="edit-employee-name"
                value={editedEmployee.name}
                onChange={(e) => setEditedEmployee((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-employee-email">Email</Label>
              <Input
                id="edit-employee-email"
                type="email"
                value={editedEmployee.email}
                onChange={(e) => setEditedEmployee((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-employee-position">Position</Label>
              <Input
                id="edit-employee-position"
                value={editedEmployee.position}
                onChange={(e) => setEditedEmployee((prev) => ({ ...prev, position: e.target.value }))}
                placeholder="Enter position"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-employee-division">Division</Label>
              <Select
                value={editedEmployee.division}
                onValueChange={(value) => setEditedEmployee((prev) => ({ ...prev, division: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-employee-status">Status</Label>
              <Select
                value={editedEmployee.status}
                onValueChange={(value: "Active" | "Inactive") =>
                  setEditedEmployee((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
