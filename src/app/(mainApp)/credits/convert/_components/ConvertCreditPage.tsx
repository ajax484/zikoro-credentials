"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { TOrganization } from "@/types/organization";
import useUserStore from "@/store/globalUserStore";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import Details from "../../buy/_components/Details";
import ConvertForm from "./ConvertForm";
import ConvertConfirm from "./ConvertConfirm";

const ConvertCreditPage = () => {
  const { user } = useUserStore();
  const [step, setStep] = useState<number>(1);
  const [fromType, setFromType] = useState<number>(1); // 1: bronze, 2: silver, 3: gold
  const [toType, setToType] = useState<number>(2);
  const [amount, setAmount] = useState<number>(0);

  const { organization: currentWorkspace } = useOrganizationStore();

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    currentWorkspace
  );

  const handleNext = () => setStep(step + 1);
  const handleWorkspaceChange = (organization: TOrganization | null) => setWorkspace(organization);

  const { data: workspaces, isFetching: workspacesIsLoading } = useFetchWorkspaces(user?.userEmail!);

  if (workspacesIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="bg-[#f7f8ff] w-full min-h-screen pb-4 px-4 md:px-0">
      <section className="flex flex-col items-center pt-12 md:w-1/2 mx-auto gap-6 space-y-6 md:space-y-12">
        <Timeline step={step} setStep={setStep} />
        {step === 1 && (
          <Details
            handleNext={handleNext}
            workspace={workspace}
            handleWorkspaceChange={handleWorkspaceChange}
            workspaces={workspaces || []}
          />
        )}
        {step === 2 && (
          <ConvertForm
            handleNext={handleNext}
            workspace={workspace}
            fromType={fromType}
            toType={toType}
            amount={amount}
            setFromType={setFromType}
            setToType={setToType}
            setAmount={setAmount}
          />
        )}
        {step === 3 && (
          <ConvertConfirm
            workspace={workspace}
            fromType={fromType}
            toType={toType}
            amount={amount}
          />
        )}
      </section>
    </section>
  );
};

const Timeline = ({
  step,
  setStep,
}: {
  step: number;
  setStep: (step: number) => void;
}) => {
  return (
    <div className="space-y-2 w-1/2 md:w-1/3 mx-auto">
      <div className="flex justify-between items-center w-full">
        <button
          aria-label="First step"
          disabled={step === 0}
          onClick={() => setStep(1)}
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
        </button>
        <div
          className={cn(
            "h-[2px] flex-1",
            step > 1 ? "bg-gray-500" : "bg-gray-300"
          )}
        />
        <button
          aria-label="Second step"
          disabled={step < 2}
          onClick={() => setStep(2)}
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
        </button>
        <div
          className={cn(
            "h-[2px] flex-1",
            step > 2 ? "bg-gray-500" : "bg-gray-300"
          )}
        />
        <button
          aria-label="Third step"
          disabled={step < 3}
          onClick={() => setStep(3)}
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
        </button>
      </div>
      <div className="hidden md:flex justify-between items-center text-xs">
        <span>Details</span>
        <span>Convert</span>
        <span>Confirm</span>
      </div>
    </div>
  );
};

export default ConvertCreditPage;
