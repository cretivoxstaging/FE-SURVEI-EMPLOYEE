"use client"

import type React from "react"

import { useEffect } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/ui/form-field"
import { useFormValidation } from "@/hooks/use-form-validation"
import { employeeSchema, type EmployeeFormData } from "@/lib/validation"

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
  onEdit: (employee: EmployeeFormData) => void
}

export function EditEmployeeModal({ open, onClose, employee, onEdit }: EditEmployeeModalProps) {
  const initialData: EmployeeFormData = {
    name: "",
    email: "",
    position: "",
    division: "",
    status: "Active",
  }

  const {
    data: editedEmployee,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    getFieldError,
  } = useFormValidation({
    schema: employeeSchema,
    initialData,
  })

  useEffect(() => {
    if (employee) {
      reset()
      handleChange("name", employee.name)
      handleChange("email", employee.email)
      handleChange("position", employee.position)
      handleChange("division", employee.division)
      handleChange("status", employee.status)
    }
  }, [employee, reset, handleChange])

  const onSubmit = async (data: EmployeeFormData) => {
    onEdit(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>Make changes to employee information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)
        }}>
          <div className="grid gap-4 py-4">
            <FormField
              label="Full Name"
              error={getFieldError("name")}
              required
            >
              <Input
                id="edit-employee-name"
                value={editedEmployee.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                className={getFieldError("name") ? "border-destructive" : ""}
              />
            </FormField>

            <FormField
              label="Email"
              error={getFieldError("email")}
              required
            >
              <Input
                id="edit-employee-email"
                type="email"
                value={editedEmployee.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                className={getFieldError("email") ? "border-destructive" : ""}
              />
            </FormField>

            <FormField
              label="Position"
              error={getFieldError("position")}
              required
            >
              <Input
                id="edit-employee-position"
                value={editedEmployee.position}
                onChange={(e) => handleChange("position", e.target.value)}
                placeholder="Enter position"
                className={getFieldError("position") ? "border-destructive" : ""}
              />
            </FormField>

            <FormField
              label="Division"
              error={getFieldError("division")}
              required
            >
              <Select
                value={editedEmployee.division}
                onValueChange={(value) => handleChange("division", value)}
              >
                <SelectTrigger className={getFieldError("division") ? "border-destructive" : ""}>
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
            </FormField>

            <FormField
              label="Status"
              error={getFieldError("status")}
            >
              <Select
                value={editedEmployee.status}
                onValueChange={(value: "Active" | "Inactive") => handleChange("status", value)}
              >
                <SelectTrigger className={getFieldError("status") ? "border-destructive" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
