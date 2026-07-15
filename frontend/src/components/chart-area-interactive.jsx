"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const RANGE_DAYS = {
  "90d": 90,
  "30d": 30,
  "7d": 7,
};

const RANGE_LABELS = {
  "90d": "Last 3 months",
  "30d": "Last 30 days",
  "7d": "Last 7 days",
};

const chartConfig = {
  created: {
    label: "Tasks created",
    color: "var(--chart-1)",
  },
  completed: {
    label: "Tasks completed",
    color: "var(--chart-2)",
  },
};

function getLocalDateKey(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ChartAreaInteractive({ tasks = [] }) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const chartData = React.useMemo(() => {
    const numberOfDays = RANGE_DAYS[timeRange] ?? 90;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateBuckets = new Map();

    // Create a bucket for every date, including dates with zero tasks.
    for (let offset = numberOfDays - 1; offset >= 0; offset--) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      const dateKey = getLocalDateKey(date);

      dateBuckets.set(dateKey, {
        date: dateKey,
        created: 0,
        completed: 0,
      });
    }

    tasks.forEach((task) => {
      // Count task creation.
      const createdDateKey = getLocalDateKey(task.createdAt);

      if (createdDateKey && dateBuckets.has(createdDateKey)) {
        dateBuckets.get(createdDateKey).created += 1;
      }

      /*
       * completedAt is the accurate value.
       * updatedAt is used only as a temporary fallback for existing tasks.
       */
      const completedDate =
        task.completedAt ||
        (task.status === "completed" ? task.updatedAt : null);

      const completedDateKey = getLocalDateKey(completedDate);

      if (completedDateKey && dateBuckets.has(completedDateKey)) {
        dateBuckets.get(completedDateKey).completed += 1;
      }
    });

    return Array.from(dateBuckets.values());
  }, [tasks, timeRange]);

  const hasActivity = chartData.some(
    (item) => item.created > 0 || item.completed > 0,
  );

  const handleTimeRangeChange = (value) => {
    // ToggleGroup may return an empty value when selected again.
    if (value) {
      setTimeRange(value);
    }
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Team task activity</CardTitle>

        <CardDescription>
          Tasks created and completed during{" "}
          {RANGE_LABELS[timeRange].toLowerCase()}
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>

            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>

            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select chart time range"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>

            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>

              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>

              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {!hasActivity ? (
          <div className="flex h-62.5 items-center justify-center text-sm text-muted-foreground">
            No task activity found for this period.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-62.5 w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-created)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-created)"
                    stopOpacity={0.05}
                  />
                </linearGradient>

                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-completed)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} />

              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={formatDateLabel}
              />

              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatDateLabel}
                    indicator="dot"
                  />
                }
              />

              <Area
                dataKey="created"
                type="monotone"
                fill="url(#fillCreated)"
                stroke="var(--color-created)"
                strokeWidth={2}
              />

              <Area
                dataKey="completed"
                type="monotone"
                fill="url(#fillCompleted)"
                stroke="var(--color-completed)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
