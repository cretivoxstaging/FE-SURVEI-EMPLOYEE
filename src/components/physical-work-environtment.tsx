"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface PhysicalWorkEnvironmentData {
  category: string
  count: number
  percentage: number
}

interface PhysicalWorkEnvironmentChartProps {
  data: PhysicalWorkEnvironmentData[]
}

export function PhysicalWorkEnvironmentChart({ data }: PhysicalWorkEnvironmentChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">Physical Work Environment</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Employee satisfaction with workplace conditions</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Responses",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[250px] sm:h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [value, "Responses"]}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
