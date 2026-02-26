'use client';

import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
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
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { RevenueRange, ItemPopularityData } from "@/lib/types"

interface ItemPopularityChartProps {
  data: ItemPopularityData[]
  currentRange: RevenueRange
}

export function ItemPopularityChart({ data, currentRange }: ItemPopularityChartProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('range', value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const chartConfig: ChartConfig = {};
  data.forEach((item) => {
    chartConfig[item.name] = {
      label: item.name,
      color: item.fill,
    };
  });

  if (data.length === 0) {
      return (
        <Card className="flex flex-col h-full">
          <CardHeader>
            <CardTitle>Item Popularity</CardTitle>
            <CardDescription>No sales data for the selected range.</CardDescription>
          </CardHeader>
        </Card>
      );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Item Popularity</CardTitle>
          <CardDescription>Most ordered items (Top 8)</CardDescription>
        </div>
        <Select value={currentRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5days">Last 5 Days</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="15days">Last 15 Days</SelectItem>
            <SelectItem value="month">Month Wise</SelectItem>
            <SelectItem value="year">Year Wise</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="mx-auto min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent className="mt-4" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
