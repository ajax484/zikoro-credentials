"use client";

import React from "react";
import { Step } from "nextstepjs";
import { SkipBack, SkipForward } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ShadcnCustomCardProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void | undefined;
  arrow: React.ReactNode;
}

const CustomCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: ShadcnCustomCardProps) => {
  return (
    <div className="w-[500px] bg-white rounded-xl shadow-lg">
      {step.content}

      <div className="flex items-center justify-between p-4">
        <button
          className={cn(
            "flex gap-1 items-center text-gray-600",
            currentStep > 0 && "cursor-pointer text-basePrimary"
          )}
          onClick={prevStep}
        >
          <SkipBack className="size-4" />
          <span className="text-sm">Prev</span>
        </button>
        <div className="flex gap-2 items-center">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                "size-4 rounded-full border flex gap-1 items-center border-gray-600 cursor-pointer",
                currentStep > i - 1 && "border-basePrimary",
                currentStep === i
                  ? "bg-basePrimary/10"
                  : currentStep > i
                  ? "bg-basePrimary"
                  : "bg-gray-100"
              )}
            />
          ))}
        </div>
        <button
          className={cn(
            "flex gap-1 items-center text-gray-600 fill-text-gray-100",
            currentStep < totalSteps &&
              "cursor-pointer text-basePrimary fill-basePrimary/10"
          )}
          onClick={nextStep}
        >
          <span className="text-sm">
            {currentStep < totalSteps ? "Next" : "Finish"}
          </span>
          {currentStep < totalSteps && <SkipForward className="size-4" />}
        </button>
      </div>

      <div className="w-full text-center">
        <button
          className="text-basePrimary underline underline-offset-2 text-sm"
          onClick={skipTour}
        >
          Skip Tour
        </button>
      </div>
    </div>
  );
};

export default CustomCard;
