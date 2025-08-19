"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { Search, Filter } from "lucide-react"
import { useEmployee } from "@/hooks/use-employee"

interface Employee {
  id: string
  name: string
  email: string
  job_position: string
  department: string
  branch: string
  status: "Active" | "Inactive"
}

export default function EmployeePage() {
  const { employees = [], isLoading } = useEmployee()
  const [searchTerm, setSearchTerm] = useState("")
  const [surveyModalOpen, setSurveyModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const openSurveyModal = (employee: Employee) => {
    setSelectedEmployee(employee)
    setSurveyModalOpen(true)
  }

  const closeSurveyModal = () => {
    setSurveyModalOpen(false)
    setSelectedEmployee(null)
  }

  const filteredEmployees = employees.filter((employee: Employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex-1" />
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employee</h1>
              <p className="text-gray-600">Easily track and manage all employee data.</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search Employee Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="bg-black text-white hover:bg-gray-800">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Employee Table */}
          <div className="bg-white">
            <div className="p-4 border-b">
              <h3 className="font-semibold">All Employees</h3>
            </div>
            <Table>
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status Survey</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                  //@ts-ignore
                ) : filteredEmployees.map((employee: Employee, index) => (
                  <TableRow key={employee.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.job_position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.branch}</TableCell>
                    <TableCell>
                      <Badge className={employee.status === "Active" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => openSurveyModal(employee)}
                        className="bg-black text-white hover:bg-gray-800"
                        size="sm"
                      >
                        View Survey
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Survey Modal */}
        <Dialog open={surveyModalOpen} onOpenChange={closeSurveyModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Survey Result - {selectedEmployee?.name}</DialogTitle>
              <DialogDescription>
                Here are the survey answers from {selectedEmployee?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              {/* Dummy survey, bisa diganti dengan API */}
              <div className="border-b py-2">
                <p className="font-medium">Are you satisfied with your job?</p>
                <p>Yes</p>
              </div>
              <div className="border-b py-2">
                <p className="font-medium">Do you feel valued?</p>
                <p>Sometimes</p>
              </div>
              <div className="border-b py-2">
                <p className="font-medium">Would you recommend the company?</p>
                <p>Yes</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={closeSurveyModal}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
