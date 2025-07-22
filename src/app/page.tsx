"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { employees } from "@/lib/employee.data"
import { useSurvey } from "@/context/survey-context"
import { useRouter } from "next/navigation"

export default function Home() {
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const { setSelectedEmployee } = useSurvey()
  const router = useRouter()

  const handleStartSurvey = () => {
    if (selectedEmployeeId) {
      setSelectedEmployee(employees.find((emp) => emp.id === selectedEmployeeId)!)
      router.push("/survey")
    }
  }

  const selectedEmployeeData = employees.find((emp) => emp.id === selectedEmployeeId)

  return (
    <section className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-4xl xl:text-9xl font-bold text-center leading-tight">Annual <br /> Survey Employee</h1>

      <div className="flex flex-col gap-2 items-center w-full max-w-md">
        {/* Employee Search Dropdown */}
        <div className="mt-2 md:mt-12 w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-10 border border-black bg-transparent"
              >
                {selectedEmployeeId ? selectedEmployeeData?.name : "Select Employee Name..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent
              side="bottom"             
              align="start"            
              sideOffset={8}            
              collisionPadding={16}      
              avoidCollisions={false}     
              className="w-full p-0 z-50" 
            >
              <Command>
                <CommandInput placeholder="Search employee..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {employees.map((employee) => (
                      <CommandItem
                        key={employee.id}
                        value={employee.name}
                        onSelect={() => {
                          const isSame = employee.id === selectedEmployeeId
                          setSelectedEmployeeId(isSame ? "" : employee.id)
                          setSelectedEmployee(isSame ? null : employee)
                          setOpen(false)
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{employee.name}</span>
                          <span className="text-sm text-gray-500">
                            {employee.department} - {employee.position}
                          </span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedEmployeeId === employee.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

        </div>

        {selectedEmployeeData && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border w-full text-center">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{selectedEmployeeData.department}</span> - {selectedEmployeeData.position}
            </p>
          </div>
        )}

        <Button
          onClick={handleStartSurvey}
          className="md:mt-12 w-full bg-white text-black border border-b-4 cursor-pointer hover:bg-white hover:border transition-all duration-300 border-black border-r-4 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedEmployeeId}
          type="submit"
        >
          Start Survey !
        </Button>

        {!selectedEmployeeId && (
          <p className="text-sm text-gray-500 mt-2">Please select an employee to start the survey</p>
        )}
      </div>
    </section>
  )
}
