"use client";

import React, { useState } from "react";
import { Step } from "nextstepjs";
import { SkipBack, SkipForward } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useUpdateUser } from "@/mutations/user.mutations";
import useUserStore from "@/store/globalUserStore";
import { Checkbox } from "../ui/checkbox";

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
  const { user } = useUserStore();
  const { mutateAsync: updateUser, isPending: updateUserIsLoading } =
    useUpdateUser(user?.id!);

  const [disableTour, setDisableTour] = useState(false);

  console.log(currentStep, totalSteps);

  return (
    <div className="w-[500px] bg-white rounded-xl shadow-lg">
      {step.content}

      <div className="flex items-center justify-between px-4 pt-4 pb-2">
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
          onClick={() => {
            currentStep === totalSteps - 1 &&
              disableTour &&
              updateUser({
                completedCredentialWorkthrough: { dashboardTour: true },
              });
            nextStep();
          }}
        >
          <span className="text-sm">
            {currentStep < totalSteps ? "Next" : "Finish"}
          </span>
          {currentStep < totalSteps && <SkipForward className="size-4" />}
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pt-2 pb-4">
        {currentStep === totalSteps - 1 ? (
          <div className="flex items-center gap-2">
            <Checkbox
              className="data-[state=checked]:bg-basePrimary"
              checked={disableTour}
              onCheckedChange={(value) => setDisableTour(value as boolean)}
              aria-label="Disabled tour"
            />
            <span className="text-sm text-gray-600">Disable tour</span>
          </div>
        ) : (
          <div />
        )}

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
