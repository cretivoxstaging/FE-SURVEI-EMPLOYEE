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

// Yellow color scheme for appreciation chart: Yes/No
const COLORS = ["#eab308", "#ef4444"]

export function AppreciationChart({ data }: AppreciationChartProps) {
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: LabelProps) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg font-semibold">Do You Feel Appreciated At Work</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600">Employee perception of recognition and appreciation</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            percentage: {
              label: "Percentage",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[250px] sm:h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="percentage"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`${value}%`, "Percentage"]}
                labelFormatter={(label) => `Category: ${label}`}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry) => <span style={{ color: entry.color, fontSize: "12px" }}>{entry.payload?.category || value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
