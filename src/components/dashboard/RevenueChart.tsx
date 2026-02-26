'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { RevenueRange, RevenueDataPoint } from "@/lib/types"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

interface RevenueChartProps {
  data: RevenueDataPoint[]
  currentRange: RevenueRange
}

export function RevenueChart({ data, currentRange }: RevenueChartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const formattedData = data.map((item) => {
    const date = parseISO(item.date);
    let label = '';
    if (currentRange === '5days' || currentRange === '15days') {
      label = format(date, "dd MMM");
    } else if (currentRange === 'month') {
      label = format(date, "MMM yy");
    } else if (currentRange === 'year') {
      label = format(date, "yyyy");
    }
    return {
      ...item,
      formattedLabel: label,
    };
  });

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Revenue Insights</CardTitle>
          <CardDescription>Visualizing your business growth</CardDescription>
        </div>
        <Select value={currentRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5days">Last 5 Days</SelectItem>
            <SelectItem value="15days">Last 15 Days</SelectItem>
            <SelectItem value="month">Month Wise</SelectItem>
            <SelectItem value="year">Year Wise</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedLabel"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rs.${value}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
