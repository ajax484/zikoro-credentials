import {
  calculateChange,
  generateChartData,
  TimePeriod,
} from "@/app/(mainApp)/(dashboard)/analytics/_components/AnalyticsPage";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import React, { useMemo } from "react";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  isSameWeek,
  isSameMonth,
  isSameYear,
  endOfWeek,
  endOfYear,
  subWeeks,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
} from "date-fns";
import GradientText from "@/components/GradientText";
import { CaretUp } from "styled-icons/bootstrap";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { CartesianGrid, XAxis, YAxis, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";
import GradientBorderSelect from "@/components/CustomSelect/GradientSelectBorder";

const Analytics = ({
  recipient,
  getCertificate,
}: {
  recipient: CertificateRecipient & {
    originalCertificate: TCertificate & {
      workspace: TOrganization;
    };
  };
  getCertificate: () => Promise<void>;
}) => {
  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>("all time");

  const { statusDetails } = recipient;

  const certificateAnalytics = statusDetails
    ? statusDetails.filter((status) => status.action === "email opened")
    : [];

  const filteredStatus = certificateAnalytics.filter((s) =>
    timePeriod === "this week"
      ? isSameWeek(s.date, new Date())
      : timePeriod === "this month"
      ? isSameMonth(s.date, new Date())
      : timePeriod === "this year"
      ? isSameYear(s.date, new Date())
      : true
  );

  const chartData = useMemo(
    () =>
      generateChartData(
        filteredStatus.map((s) => ({
          created_at: s.date,
        })),
        timePeriod,
        new Date(recipient.originalCertificate.workspace?.created_at)
      ),
    [filteredStatus, timePeriod]
  );

  const maxShared = Math.max(...chartData.map((d) => d.count));

  const {
    increase: openIncrease,
    percentage: openIncreasePercentage,
    lastCount: openLastCount,
  } = calculateChange(
    filteredStatus.map((s) => ({
      created_at: s.date,
    })),
    timePeriod
  );

  const socialStats = statusDetails
    ?.filter(({ action }) => action.startsWith("shared"))
    .reduce((map, { action }) => {
      const social = action.split(" ")[2];
      map.set(social, (map.get(social) ?? 0) + 1);
      return map;
    }, new Map<string, number>());

  const sortedSocialStats = [...(socialStats?.entries() ?? [])].sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <section className="space-y-6">
      <div className="flex justify-end gap-2">
        <GradientBorderSelect
          placeholder={"Select time period"}
          value={timePeriod}
          onChange={(value) => setTimePeriod(value)}
          options={["this week", "this month", "this year", "all time"].map(
            (value) => ({
              label: value,
              value,
            })
          )}
        />
      </div>
      <div className="space-y-4 p-2 border rounded-lg">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Opens</h3>
          <div className="flex items-center gap-6">
            <GradientText className="text-xl font-bold" Tag="h3">
              {openLastCount || 0}
            </GradientText>
            <div
              className={cn(
                "flex items-center gap-1 text-[8px] font-semibold",
                openIncreasePercentage > 0 ? "text-green-600" : "text-gray-600"
              )}
            >
              <span>
                {openIncreasePercentage > 0 ? (
                  <CaretUp className="size-3" />
                ) : (
                  "-"
                )}
              </span>
              {openIncreasePercentage > 0 ? (
                <span>+{openIncreasePercentage}%</span>
              ) : (
                <span>{openIncreasePercentage}%</span>
              )}
            </div>
          </div>
        </div>
        <ChartContainer
          config={{}}
          className="min-h-[200px] max-h-[500px] w-full max-w-[300px] md:max-w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fadeColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#001FCC" stopOpacity={0.6} />
                <stop offset="80%" stopColor="#9D00FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey={"count"}
              //   tickFormatter={(value) => value.toLocaleString()}
              axisLine={false}
              tickLine={false}
              domain={[0, maxShared + 1]}
              tick={false}
            />
            <XAxis
              dataKey="key"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                format(
                  new Date(value),
                  timePeriod === "this week"
                    ? "dd MMM"
                    : timePeriod === "this month"
                    ? "MMM dd"
                    : timePeriod === "this year"
                    ? "MMM"
                    : "MMM yyyy"
                )
              }
            />
            <ChartTooltip
              cursor={false}
              content={(props) => (
                <div className="bg-basePrimary text-white rounded-lg p-2 shadow-lg text-xs">
                  {props.payload ? props.payload[0]?.payload.count : 0}
                </div>
              )}
            />
            <Area
              dataKey="count"
              type="linear"
              fill="url(#fadeColor)"
              fillOpacity={1}
              stroke="#001FCC"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
      {sortedSocialStats.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">Social Shares</h2>
          <table className="w-full text-sm text-gray-700">
            <thead>
              <tr className="grid grid-cols-2 text-xs bg-gray-300 text-gray-700 text-left">
                <th className="p-1">Social Platform</th>
                <th className="p-1">Number of Shares</th>
              </tr>
            </thead>
            <tbody>
              {sortedSocialStats.map(([social, count]) => (
                <tr key={social} className="grid grid-cols-2 text-sm">
                  <td className="p-1">{social}</td>
                  <td className="p-1">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default Analytics;
