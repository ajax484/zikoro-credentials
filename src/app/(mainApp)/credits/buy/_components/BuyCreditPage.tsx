"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import Checkout from "./Checkout";
import Details from "./Details";
import AddPoints from "./AddPoints";
import { TOrganization } from "@/types/organization";

export const metadata = {
  title: "Credentials - Subscribe",
  description: "Subscribe to a plan",
};

const BuyCreditPage = () => {
  const [step, setStep] = useState<number>(1);
  const [credits, setCredits] = useState<{
    bronze: number;
    silver: number;
    gold: number;
  }>({
    bronze: 0,
    silver: 0,
    gold: 0,
  });

  const [workspace, setWorkspace] = useState<TOrganization | null>(null);

  const prices = {
    bronze: 5000,
    silver: 7500,
    gold: 10000,
  };

  const updateCredits = (credit: string, value: number) => {
    setCredits((prev) => ({
      ...prev,
      [credit]: value,
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleWorkspaceChange = (organization: TOrganization | null) => {
    console.log(organization);
    setWorkspace(organization);
  };

  return (
    <section className="flex flex-col items-center pt-12 w-1/2 mx-auto gap-6 space-y-12">
      <Timeline step={step} handleNext={handleNext} />
      {step === 1 && (
        <AddPoints
          handleNext={handleNext}
          prices={prices}
          credits={credits}
          updateCredits={updateCredits}
        />
      )}
      {step === 2 && (
        <Details
          handleNext={handleNext}
          workspace={workspace}
          handleWorkspaceChange={handleWorkspaceChange}
        />
      )}
      {step === 3 && (
        <Checkout
          handleNext={handleNext}
          credits={credits}
          prices={prices}
          workspace={workspace}
        />
      )}
    </section>
  );
};

const Timeline = ({
  step,
  handleNext,
}: {
  step: number;
  handleNext: () => void;
}) => {
  return (
    <div className="space-y-2 w-1/3 mx-auto">
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "rounded-full size-5 border-2 flex items-center justify-center",
            step > 0 ? "border-basePrimary" : "border-gray-300"
          )}
        >
          <div
            className={cn(
              "size-1 bg-basePrimary rounded-full",
              step > 0 ? "" : "opacity-0"
            )}
          />
        </div>
        <div
          className={cn(
            "h-[2px] flex-1",
            step > 1 ? "bg-gray-500" : "bg-gray-300"
          )}
        />
        <div
          className={cn(
            "rounded-full size-5 border-2 flex items-center justify-center",
            step > 1 ? "border-basePrimary" : "border-gray-300"
          )}
        >
          <div
            className={cn(
              "size-1 bg-basePrimary rounded-full",
              step > 1 ? "" : "opacity-0"
            )}
          />
        </div>
        <div
          className={cn(
            "h-[2px] flex-1",
            step > 2 ? "bg-gray-500" : "bg-gray-300"
          )}
        />
        <div
          className={cn(
            "rounded-full size-5 border-2 flex items-center justify-center",
            step > 2 ? "border-basePrimary" : "border-gray-300"
          )}
        >
          <div
            className={cn(
              "size-1 bg-basePrimary rounded-full",
              step > 2 ? "" : "opacity-0"
            )}
          />
        </div>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span>Add credits</span>
        <span>Details</span>
        <span>checkout</span>
      </div>
    </div>
  );
};

export default BuyCreditPage;
