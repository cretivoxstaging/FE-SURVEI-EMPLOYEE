"use client"

import type React from "react"

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

interface AddEmployeeModalProps {
  open: boolean
  onClose: () => void
  onAdd: (employee: EmployeeFormData) => void
}

export function AddEmployeeModal({ open, onClose, onAdd }: AddEmployeeModalProps) {
  const initialData: EmployeeFormData = {
    name: "",
    email: "",
    position: "",
    division: "",
    status: "Active",
  }

  const {
    data: employee,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    getFieldError,
  } = useFormValidation({
    schema: employeeSchema,
    initialData,
  })

  const onSubmit = async (data: EmployeeFormData) => {
    onAdd(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>Add a new employee to your organization.</DialogDescription>
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
                id="employee-name"
                value={employee.name}
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
                id="employee-email"
                type="email"
                value={employee.email}
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
                id="employee-position"
                value={employee.position}
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
                value={employee.division}
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
                value={employee.status}
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
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Employee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
