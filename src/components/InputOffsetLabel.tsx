import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import React from "react";
import { cn } from "@/lib/utils";

export default function InputOffsetLabel({
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
    <FormItem className={cn("relative space-y-4 w-full", className)}>
      <FormLabel className="font-medium text-xs text-gray-600">
        {label}
        {isRequired && <sup className="text-red-700">*</sup>}
      </FormLabel>
      <FormControl className="!mt-0">
        <div className={`relative h-fit border rounded-md`}>
          {append && (
            <div className="absolute !my-0 left-2 inset-y-0 z-10 h-fit flex items-center">
              {append}
            </div>
          )}
          {prepend && (
            <div className="absolute !my-0 right-2 z-10 h-full flex items-center">
              {prepend}
            </div>
          )}
          <div
            className={`w-full bg-basePrimary/10 rounded-md placeholder-gray-500 ${
              append ? "[&>*]:pl-8" : ""
            } ${prepend ? "[&>*]:pr-8" : ""} `}
          >
            {children}
          </div>
        </div>
      </FormControl>

      <FormMessage />
    </FormItem>
  );
}
