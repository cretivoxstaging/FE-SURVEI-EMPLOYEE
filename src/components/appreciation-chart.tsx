"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface AppreciationData {
  category: string
  count: number
  percentage: number
}

interface AppreciationChartProps {
  data: AppreciationData[]
}

export function AppreciationChart({ data }: AppreciationChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">Do You Feel Appreciated At Work</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Employee perception of recognition and appreciation</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Responses",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[250px] sm:h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11 }}
                angle={window?.innerWidth < 640 ? -45 : 0}
                textAnchor={window?.innerWidth < 640 ? "end" : "middle"}
                height={window?.innerWidth < 640 ? 60 : 40}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [value, "Responses"]}
                labelFormatter={(label) => `Frequency: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
