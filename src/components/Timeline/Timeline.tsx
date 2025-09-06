"use client";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export const Timeline = ({
  steps,
  step,
  setStep,
}: {
  steps: string[];
  step: number;
  setStep: (step: number) => void;
}) => {
  return (
    <div className="space-y-2 md:w-1/3 mx-auto">
      <div className="flex justify-between items-center w-full">
        {steps.map((_, index) => (
          <>
            <button
              aria-label={_}
              key={index}
              disabled={step <= index}
              onClick={() => setStep(index + 1)}
              className={cn(
                "rounded-full size-5 border-2 flex items-center justify-center",
                step > index ? "border-basePrimary" : "border-gray-300",
                step > index + 1 ? "bg-basePrimary" : ""
              )}
            >
              {step === index + 1 ? (
                <div className={cn("size-1 bg-basePrimary rounded-full")} />
              ) : step > index + 1 ? (
                <Check className="size-2 text-white" />
              ) : null}
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1",
                  step > index + 1 ? "bg-gray-500" : "bg-gray-300"
                )}
              />
            )}
          </>
        ))}
      </div>
      <div className="md:flex justify-between items-center text-xs hidden">
        {steps.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
};
