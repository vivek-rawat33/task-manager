"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Tasks",
  },
  low: {
    label: "Low",
    color: "hsl(221 83% 53%)",
  },
  medium: {
    label: "Medium",
    color: "hsl(262 83% 58%)",
  },
  high: {
    label: "High",
    color: "hsl(0 84% 60%)",
  },
};

function normalizePriority(priority) {
  const value = String(priority || "").toLowerCase();

  if (value === "high") return "high";
  if (value === "medium") return "medium";
  if (value === "low") return "low";

  return "medium";
}

function getPriorityCounts(tasks = []) {
  return tasks.reduce(
    (acc, task) => {
      const priority = normalizePriority(task.limit || task.priority);

      acc[priority] += 1;

      return acc;
    },
    {
      low: 0,
      medium: 0,
      high: 0,
    },
  );
}

export function PriorityChart({ tasks = [] }) {
  const priorityCounts = React.useMemo(() => getPriorityCounts(tasks), [tasks]);

  const totalTasks =
    priorityCounts.low + priorityCounts.medium + priorityCounts.high;

  const chartData = React.useMemo(
    () => [
      {
        priority: "Low",
        count: priorityCounts.low,
        fill: "var(--color-low)",
      },
      {
        priority: "Medium",
        count: priorityCounts.medium,
        fill: "var(--color-medium)",
      },
      {
        priority: "High",
        count: priorityCounts.high,
        fill: "var(--color-high)",
      },
    ],
    [priorityCounts],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority distribution</CardTitle>
        <CardDescription>Breakdown of tasks by urgency level</CardDescription>
      </CardHeader>

      <CardContent>
        {totalTasks === 0 ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            No priority data available.
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart
                data={chartData}
                margin={{
                  top: 16,
                  right: 8,
                  left: 0,
                  bottom: 8,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  className="stroke-muted"
                />

                <XAxis
                  dataKey="priority"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  className="text-xs"
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={28}
                  allowDecimals={false}
                  className="text-xs"
                />

                <ChartTooltip
                  cursor={{
                    fill: "hsl(var(--muted) / 0.35)",
                  }}
                  content={<ChartTooltipContent hideLabel nameKey="priority" />}
                />

                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={54}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.priority}
                      fill={entry.fill}
                      className="transition-opacity duration-200 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>

            <div className="grid gap-2 sm:grid-cols-3">
              {chartData.map((item) => {
                const percentage =
                  totalTasks > 0
                    ? Math.round((item.count / totalTasks) * 100)
                    : 0;

                return (
                  <div
                    key={item.priority}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />

                      <span className="truncate text-sm font-medium">
                        {item.priority}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.count}</p>
                      <p className="text-xs text-muted-foreground">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
