"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Calendar } from "lucide-react"

interface YearFilterDropdownProps {
  availableYears: string[]
  selectedYear: string | undefined
  onYearChange: (year: string | undefined) => void
}

export function YearFilterDropdown({
  availableYears,
  selectedYear,
  onYearChange
}: YearFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleYearSelect = (year: string | undefined) => {
    onYearChange(year)
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm font-medium">
            {selectedYear ? `Year ${selectedYear}` : "All Years"}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleYearSelect(undefined)}
          className={!selectedYear ? "bg-gray-100" : ""}
        >
          <Calendar className="h-4 w-4 mr-2" />
          All Years
        </DropdownMenuItem>
        {availableYears.map((year) => (
          <DropdownMenuItem
            key={year}
            onClick={() => handleYearSelect(year)}
            className={selectedYear === year ? "bg-gray-100" : ""}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Year {year}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
