import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

export default function CustomInput({
  children,
  label,
  isRequired,
  append,
  prepend,
  className,
}: {
  children: React.ReactNode;
  label: string;
  isRequired?: boolean;
  append?: React.ReactNode;
  prepend?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative space-y-4 w-full", className)}>
      <Label className="font-medium text-xs text-gray-600">
        {label}
        {isRequired && <sup className="text-red-700">*</sup>}
      </Label>
      <div className="!mt-0">
        <div
          className={`w-full bg-gray-50 rounded-lg placeholder-gray-600 relative h-fit border flex gap-0.5 p-0.5 items-center`}
        >
          {append && <div>{append}</div>}
          {prepend && <div>{prepend}</div>}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
