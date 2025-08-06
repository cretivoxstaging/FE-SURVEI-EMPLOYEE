"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Plus, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AppSidebar } from "@/components/app-sidebar"
import { AddEmployeeModal } from "@/components/add-employee-modal"
import { EditEmployeeModal } from "@/components/edit-employee-modal"
import { DeleteConfirmModal } from "@/components/delete-confirm-modal"
import { useEmployee } from "@/hooks/use-employee"

interface Employee {
  id: string
  name: string
  email: string
  job_position: string
  departement: string
  status: "Active" | "Inactive"
}

export default function EmployeePage() {
  const { employees = [], isLoading } = useEmployee();

  const [searchTerm, setSearchTerm] = useState("");
  const [modals, setModals] = useState({
    addEmployee: false,
    editEmployee: false,
    deleteConfirm: false,
  });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const openModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  // These handlers would need to be updated to work with API if you want to persist changes
  const handleAddEmployee = (employee: Omit<Employee, "id">) => {
    // You may want to call an API here instead of local state
    // For now, just close the modal
    closeModal("addEmployee");
  };

  const handleEditEmployee = (updatedEmployee: Omit<Employee, "id">) => {
    // You may want to call an API here instead of local state
    closeModal("editEmployee");
    setSelectedEmployee(null);
  };

  const handleDeleteEmployee = () => {
    // You may want to call an API here instead of local state
    closeModal("deleteConfirm");
    setSelectedEmployee(null);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    openModal("editEmployee");
  };

  const openDeleteModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    openModal("deleteConfirm");
  };

  const filteredEmployees = employees.filter((employee: Employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
          <div className="flex-1" />
          <div className="px-4">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Employee</h1>
              <p className="text-gray-600">Easily track and manage all of Employee data.</p>
            </div>
            <Button onClick={() => openModal("addEmployee")} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>

          {/* Search and Filter */}
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
              <h3 className="font-semibold">All Employee</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Departement</TableHead>
                  <TableHead>Status survey</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredEmployees.map((employee: Employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{employee.name}</div>
              
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{employee.job_position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge
                        className={`$ {
                          employee.status === "Active"
                            ? "bg-black text-white hover:bg-gray-800"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(employee)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteModal(employee)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Modals */}
        <AddEmployeeModal
          open={modals.addEmployee}
          onClose={() => closeModal("addEmployee")}
          onAdd={handleAddEmployee}
        />

        <EditEmployeeModal
          open={modals.editEmployee}
          onClose={() => closeModal("editEmployee")}
          employee={selectedEmployee}
          onEdit={handleEditEmployee}
        />

        <DeleteConfirmModal
          open={modals.deleteConfirm}
          onClose={() => closeModal("deleteConfirm")}
          onConfirm={handleDeleteEmployee}
          title="Delete Employee"
          description={`Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
