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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Employee {
  name: string
  email: string
  position: string
  division: string
  status: "Active" | "Inactive"
}

interface AddEmployeeModalProps {
  open: boolean
  onClose: () => void
  onAdd: (employee: Employee) => void
}

export function AddEmployeeModal({ open, onClose, onAdd }: AddEmployeeModalProps) {
  const [employee, setEmployee] = useState<Employee>({
    name: "",
    email: "",
    position: "",
    division: "",
    status: "Active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (employee.name.trim() && employee.email.trim() && employee.position.trim() && employee.division.trim()) {
      onAdd(employee)
      handleClose()
    }
  }

  const handleClose = () => {
    setEmployee({
      name: "",
      email: "",
      position: "",
      division: "",
      status: "Active",
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Add a new employee to your organization.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee-name">Full Name</Label>
              <Input
                id="employee-name"
                value={employee.name}
                onChange={(e) => setEmployee((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-email">Email</Label>
              <Input
                id="employee-email"
                type="email"
                value={employee.email}
                onChange={(e) => setEmployee((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-position">Position</Label>
              <Input
                id="employee-position"
                value={employee.position}
                onChange={(e) => setEmployee((prev) => ({ ...prev, position: e.target.value }))}
                placeholder="Enter position"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="employee-division">Division</Label>
              <Select
                value={employee.division}
                onValueChange={(value) => setEmployee((prev) => ({ ...prev, division: value }))}
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
              <Label htmlFor="employee-status">Status</Label>
              <Select
                value={employee.status}
                onValueChange={(value: "Active" | "Inactive") => setEmployee((prev) => ({ ...prev, status: value }))}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
