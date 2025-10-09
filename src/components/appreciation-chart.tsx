"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface AppreciationData {
  category: string
  count: number
  percentage: number
}

interface AppreciationChartProps {
  data: AppreciationData[]
}

interface LabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percentage: number
}

// Color scheme for appreciation chart: Yes/No
const COLORS = ["#EC4899", "#3B82F6"]

export function AppreciationChart({ data }: AppreciationChartProps) {
  // Calculate total count
  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="tracking-tight text-lg font-semibold">Feel Appreciated At Work</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Employee perception of recognition and appreciation</p>
      </CardHeader>
      <CardContent>
        <div className="relative h-[250px] sm:h-[300px] w-full">
          <ChartContainer
            config={{
              percentage: {
                label: "Percentage",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie className="relative"
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name, props) => [
                    `${value} (${props.payload.percentage}%)`,
                    props.payload.category
                  ]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: entry.color, fontSize: "12px" }}>
                      {entry.payload?.category || value} {entry.payload?.count} ({entry.payload?.percentage}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute inset-0 -top-10 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {totalCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
