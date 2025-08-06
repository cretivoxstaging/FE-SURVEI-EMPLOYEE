"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSurvey } from "@/context/survey-context"
import { useRouter } from "next/navigation"
import { useEmployee } from "@/hooks/use-employee"


export default function Home() {
  const [open, setOpen] = useState(false)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const { setSelectedEmployee } = useSurvey()
  const router = useRouter()

  // Pakai custom hook lo
  const { employees, isLoading } = useEmployee()

  const handleStartSurvey = () => {
    const selected = employees?.find(
      (emp: { id: number; name: string; job_position: string }) => emp.id === Number(selectedEmployeeId)
    );
    if (selected) {
      setSelectedEmployee({
        id: String(selected.id),
        name: selected.name,
        department: selected.job_position,
        position: selected.job_position,
      });
      router.push("/survey");
    }
  };

  const selectedEmployeeData = employees?.find(
    (emp: { id: number; name: string; job_position: string }) => emp.id === Number(selectedEmployeeId)
  );

  return (
    <section className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-4xl xl:text-9xl font-bold text-center leading-tight">Annual <br /> Survey Employee</h1>

      <div className="flex flex-col gap-2 items-center w-full max-w-md">
        <div className="mt-2 md:mt-12 w-full">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between h-10 border border-black bg-transparent"
              >
                {selectedEmployeeId
                  ? selectedEmployeeData?.name
                  : isLoading
                    ? "Loading..."
                    : "Select Employee Name..."}
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
                    {employees?.map((emp: { id: number; name: string; job_position: string }) => (
                      <CommandItem
                        key={emp.id}
                        value={emp.name}
                        onSelect={() => {
                          const isSame = String(emp.id) === selectedEmployeeId;
                          setSelectedEmployeeId(isSame ? "" : String(emp.id));
                          setSelectedEmployee(isSame ? null : {
                            id: String(emp.id),
                            name: emp.name,
                            department: emp.job_position,
                            position: emp.job_position,
                          });
                          setOpen(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{emp.name}</span>
                          <span className="text-sm text-gray-500">{emp.job_position}</span>
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            selectedEmployeeId === String(emp.id) ? "opacity-100" : "opacity-0"
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
              <span className="font-medium">{selectedEmployeeData.job_position}</span>
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
