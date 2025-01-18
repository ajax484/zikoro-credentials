"use client";
import GradientBorderSelect from "@/components/CustomSelect/GradientSelectBorder";
import { useGetData } from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import Badge from "@/public/icons/iconamoon_certificate-badge-duotone.svg";
import CertificateIcon2 from "@/public/icons/ph_certificate-duotone.svg";
import Recipients from "@/public/icons/ic_twotone-people.svg";
import Document from "@/public/icons/iconamoon_file-check-duotone.svg";
import { InfoIcon, Router } from "lucide-react";
import { CartesianGrid, XAxis, YAxis, AreaChart, Area } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { cn } from "@/lib/utils";
import { CaretUp } from "styled-icons/fluentui-system-filled";
import { Label, Pie, PieChart } from "recharts";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useRouter } from "next/navigation";

type TimePeriod = "this week" | "this month" | "this year" | "all time";

const chartConfig = {
  count: {
    label: "count",
    color: "#1B41FF",
  },
} satisfies ChartConfig;

const OverviewCard = ({
  title,
  value,
  info,
  icon,
  isLoading,
}: {
  title: string;
  value: number;
  info: string;
  icon: string;
  isLoading?: boolean;
}) => {
  return (
    <div className="bg-[#F7F8FF] py-12 px-4 rounded-lg border border-gray-200 flex flex-col justify-center items-center gap-2 relative">
      <div className="flex gap-2 items-center">
        <Image src={icon} alt="icon" width={20} height={20} />
        <h3 className="font-medium text-gray-700">{title}</h3>
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-4 rounded-md" />
      ) : (
        <p className="text-4xl font-bold">{value}</p>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label="info"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="absolute bottom-2 right-2"
            >
              <InfoIcon className="size-4 text-gray-600" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#F7F8FF] p-4 rounded-lg border border-gray-200 text-gray-700">
            <p>{info}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

const generateChartData = (
  data: { created_at: string }[],
  timePeriod: string,
  organizationCreateDate: Date
) => {
  const now = new Date();

  // Determine the range and grouping logic
  let intervalFn;
  let groupByFn;
  let startDate;
  let endDate;

  switch (timePeriod) {
    case "this week":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      intervalFn = eachDayOfInterval;
      groupByFn = (date: Date) => format(date, "yyyy-MM-dd");
      break;

    case "this month":
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      intervalFn = eachDayOfInterval;
      groupByFn = (date: Date) => format(date, "yyyy-MM-dd");
      break;

    case "this year":
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      intervalFn = eachMonthOfInterval;
      groupByFn = (date: Date) => format(date, "yyyy-MM");
      break;

    case "all time":
    default:
      startDate = organizationCreateDate;
      endDate = now;
      intervalFn = eachMonthOfInterval;
      groupByFn = (date: Date) => format(date, "yyyy-MM");
      break;
  }

  // Generate the full range of intervals
  const intervals = intervalFn({ start: startDate, end: endDate }).map(
    (date) => ({
      key: groupByFn(date),
      count: 0, // Initialize with 0
    })
  );

  // Populate the intervals with item data
  const dataMap = data.reduce((acc, item) => {
    const date = new Date(item.created_at);
    const key = groupByFn(date);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Merge dataMap into intervals
  return intervals.map((interval) => ({
    ...interval,
    count: dataMap[interval.key] || 0, // Replace with actual count if available
  }));
};

function calculateChange(
  data: { created_at: string }[],
  timePeriod: TimePeriod
) {
  const now = new Date();
  let startDate: Date | null = null;

  switch (timePeriod) {
    case "this week":
      startDate = subWeeks(now, 1);
      break;
    case "this month":
      startDate = subMonths(now, 1);
      break;
    case "this year":
      startDate = subYears(now, 1);
      break;
    case "all time":
      startDate = null;
      break;
  }

  const filteredData = data.filter((r) => {
    const itemDate = new Date(r.created_at);
    return (
      !startDate ||
      (itemDate >= startOfDay(startDate) && itemDate <= endOfDay(now))
    );
  });

  if (filteredData.length === 0) {
    return { increase: 0, percentage: 0 };
  }

  filteredData.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const firstCount = 1;
  const lastCount = filteredData.length;

  const increase = lastCount - firstCount + 1;
  const percentage = (increase / firstCount) * 100;

  return {
    increase,
    percentage,
    firstCount,
    lastCount,
  };
}

const AnalyticsPage = ({ certificateAlias }: { certificateAlias: string }) => {
  console.log(certificateAlias);
  const router = useRouter();
  const { organization } = useOrganizationStore();

  const [timePeriod, setTimePeriod] = React.useState<TimePeriod>("all time");

  const {
    data: certificates,
    isLoading: certificatesIsLoading,
    error,
  } = useGetData<TCertificate[]>(
    `/certificates?workspaceAlias=${organization?.organizationAlias}`,
    []
  );

  const { data: recipients, isLoading: recipientsIsLoading } = useGetData<
    CertificateRecipient[]
  >(
    `/workspaces/${organization?.organizationAlias}/certificates/recipients`,
    []
  );

  const [certificate, setCertificate] = useState<TCertificate | null>(
    certificates.find(
      (certificate) => certificate.certificateAlias === certificateAlias
    ) || null
  );

  useEffect(() => {
    if (!certificateAlias || certificatesIsLoading) return;
    console.log(
      certificateAlias,
      certificates.find(
        (certificate) => certificate.certificateAlias === certificateAlias
      )
    );
    setCertificate(
      certificates.find(
        (certificate) => certificate.certificateAlias === certificateAlias
      ) || null
    );
  }, [certificatesIsLoading, certificateAlias]);

  const filteredCertificates = certificates.filter((r) =>
    timePeriod === "this week"
      ? isSameWeek(r.created_at, new Date())
      : timePeriod === "this month"
      ? isSameMonth(r.created_at, new Date())
      : timePeriod === "this year"
      ? isSameYear(r.created_at, new Date())
      : true
  );
  const filteredRecipients = recipients
    ?.filter(
      (recipient) =>
        !certificate || recipient.certificateGroupId === certificate.id
    )
    .filter((r) =>
      timePeriod === "this week"
        ? isSameWeek(r.created_at, new Date())
        : timePeriod === "this month"
        ? isSameMonth(r.created_at, new Date())
        : timePeriod === "this year"
        ? isSameYear(r.created_at, new Date())
        : true
    );

  const totalCertificatesCreated = filteredCertificates?.length || 0;
  const totalCertificatesIssued = filteredRecipients.length || 0;
  const totalRecipients =
    new Set(filteredRecipients?.map((r) => r.recipientEmail)).size || 0;
  const sharedCertificates =
    filteredRecipients.filter(
      (recipient) =>
        recipient.statusDetails &&
        recipient.statusDetails.some((status) =>
          status.action.includes("shared")
        )
    ).length || 0;

  const chartData = useMemo(
    () =>
      generateChartData(
        filteredRecipients,
        timePeriod,
        new Date(organization?.created_at)
      ),
    [filteredRecipients, timePeriod]
  );

  const {
    increase: recipientIncrease,
    percentage: recipientIncreasePercentage,
    lastCount: recipientLastCount,
  } = calculateChange(filteredRecipients, timePeriod);

  console.log(chartData);

  const maxRecipients = Math.max(...chartData.map((d) => d.count));

  const sharedRecipients = filteredRecipients.filter(
    (recipient) =>
      recipient.statusDetails &&
      recipient.statusDetails.some((status) => status.action.includes("shared"))
  ).length;

  const sharedRecipientsPercentage =
    (sharedRecipients / filteredRecipients.length) * 100 || 0;

  const totalShares = filteredRecipients.reduce(
    (acc, curr) =>
      acc +
      (curr?.statusDetails.filter((status) => status.action.includes("shared"))
        .length || 0),
    0
  );

  const openedCredentials = filteredRecipients.filter(
    (recipient) =>
      recipient.statusDetails &&
      recipient.statusDetails.some((status) => status.action === "email opened")
  ).length;

  const totalOpens = filteredRecipients.reduce(
    (acc, curr) =>
      acc +
      (curr?.statusDetails.filter((status) => status.action === "email opened")
        .length || 0),
    0
  );

  const openedCredentialsPercentage =
    (openedCredentials / filteredRecipients.length) * 100 || 0;

  console.log(sharedRecipientsPercentage);

  return (
    <section className="space-y-6">
      <div className="flex justify-end gap-2">
        <GradientBorderSelect
          placeholder={"Select time period"}
          value={certificate ? String(certificate?.certificateAlias) : "all"}
          onChange={(value) => {
            if (value === "all") {
              setCertificate(null);
              return router.push("/analytics");
            }
            const certificate = certificates.find(
              (certificate) => String(certificate.certificateAlias) === value
            );
            certificate && setCertificate(certificate);
            certificate &&
              router.push(
                `/analytics?certificateAlias=${certificate.certificateAlias}`
              );
          }}
          options={[
            { label: "All", value: "all" },
            ...certificates.map((certificate) => ({
              label: certificate.name,
              value: String(certificate.certificateAlias),
            })),
          ]}
        />
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
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold">Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          <OverviewCard
            title="Total Certificates Created"
            value={totalCertificatesCreated}
            info="Total number of certificates created"
            icon={CertificateIcon2}
          />
          <OverviewCard
            title="Total Certificates Issued"
            value={totalCertificatesIssued}
            info="Total number of certificates issued"
            icon={Badge}
          />
          <OverviewCard
            title="Total Recipients"
            value={totalRecipients}
            info="Total number of recipients"
            icon={Recipients}
          />
          <OverviewCard
            title="Shared Certificates"
            value={sharedCertificates}
            info="Total number of certificates shared on social media"
            icon={Document}
          />
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 space-y-4 p-4">
        <h2 className="text-lg font-semibold">Trends</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="rounded-md border">
            <div className="space-y-2 p-4">
              <h3 className="text-sm font-medium">Certificate Issued</h3>
              <div className="flex items-center gap-6">
                <GradientText className="text-4xl font-bold" Tag="h3">
                  {recipientLastCount || 0}
                </GradientText>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold",
                    recipientIncreasePercentage > 0
                      ? "text-green-600"
                      : "text-gray-600"
                  )}
                >
                  <span>
                    {recipientIncreasePercentage > 0 ? (
                      <CaretUp className="size-3" />
                    ) : (
                      "-"
                    )}
                  </span>
                  {recipientIncreasePercentage > 0 ? (
                    <span>+{recipientIncreasePercentage}%</span>
                  ) : (
                    <span>{recipientIncreasePercentage}%</span>
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
                  domain={[0, maxRecipients + 1]}
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
                    <div className="bg-basePrimary text-white rounded-md p-2 shadow-lg">
                      {props.payload ? props.payload[0]?.payload.count : 0}
                    </div>
                  )}
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill="url(#fadeColor)"
                  fillOpacity={1}
                  stroke="#001FCC"
                  strokeWidth={4}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 space-y-4 p-4">
        <h2 className="text-lg font-semibold">Engagements</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-md border flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-full h-full max-w-[200px] max-h-[200px]">
              <CircularProgressbarWithChildren
                value={openedCredentialsPercentage}
                styles={buildStyles({
                  pathColor: "url(#gradient)", // Use the gradient ID
                  trailColor: "#E5E5E5", // Background path color
                })}
              >
                {/* Define the gradient */}
                <svg style={{ height: 0 }}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#001FCC" />
                      <stop offset="100%" stopColor="#9D00FF" />
                    </linearGradient>
                  </defs>
                </svg>

                <GradientText className="text-4xl font-bold" Tag="span">
                  {openedCredentialsPercentage.toFixed()}%
                </GradientText>
              </CircularProgressbarWithChildren>
            </div>
            <h3>Viewed Credentials</h3>
            <div className="flex items-center gap-2">
              <b>{openedCredentials}</b> of <b>{filteredRecipients.length}</b>{" "}
              credentials viewed
            </div>
            <p>
              <b>{totalOpens}</b> total views
            </p>
          </div>
          <div className="rounded-md border flex flex-col items-center justify-center p-4 gap-2">
            <div className="w-full h-full max-w-[200px] max-h-[200px]">
              <CircularProgressbarWithChildren
                value={sharedRecipientsPercentage}
                styles={buildStyles({
                  pathColor: "url(#gradient)", // Use the gradient ID
                  trailColor: "#E5E5E5", // Background path color
                })}
              >
                {/* Define the gradient */}
                <svg style={{ height: 0 }}>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#001FCC" />
                      <stop offset="100%" stopColor="#9D00FF" />
                    </linearGradient>
                  </defs>
                </svg>

                <GradientText className="text-4xl font-bold" Tag="span">
                  {sharedRecipientsPercentage.toFixed()}%
                </GradientText>
              </CircularProgressbarWithChildren>
            </div>
            <h3>Shared Credentials</h3>
            <div className="flex items-center gap-2">
              <b>{sharedRecipients}</b> of <b>{filteredRecipients.length}</b>{" "}
              credentials shared
            </div>
            <p>
              <b>{totalShares}</b> total shares
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsPage;
