"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import dynamic from "next/dynamic";
const Checkout = dynamic(
  () => import("./Checkout").then((module) => module.default),
  { ssr: false }
) as any;
import Details from "./Details";
import AddPoints from "./AddPoints";
import { TOrganization } from "@/types/organization";
import { useGetData } from "@/hooks/services/request";
import { CredentialCurrencyConverter, CredentialsToken } from "@/types/token";
import useUserStore from "@/store/globalUserStore";
import useOrganizationStore from "@/store/globalOrganizationStore";

const BuyCreditPage = () => {
  const { user } = useUserStore();
  const [step, setStep] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("NGN");
  const [credits, setCredits] = useState<{
    bronze: number;
    silver: number;
    gold: number;
  }>({
    bronze: 0,
    silver: 0,
    gold: 0,
  });

  const { organization: currentWorkspace } = useOrganizationStore();

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    currentWorkspace
  );

  const updateCredits = (credit: string, value: number) => {
    setCredits((prev) => ({
      ...prev,
      [credit]: value,
    }));
  };

  const updateCurrency = (currency: string) => setSelectedCurrency(currency);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleWorkspaceChange = (organization: TOrganization | null) => {
    console.log(organization);
    setWorkspace(organization);
  };

  const { data: currencyConversion, isLoading: currencyConversionIsLoading } =
    useGetData<CredentialCurrencyConverter[]>("/tokens/pricing", []);

  const { data: tokens, isLoading: tokensIsLoading } = useGetData<
    CredentialsToken[]
  >("/tokens", []);

  const {
    data: workspaces,
    isLoading: workspacesIsLoading,
    error: workspacesError,
  } = useGetData<TOrganization[]>(
    `/workspaces?userEmail=${user?.userEmail || "ubahyusuf484@gmail.com"}`,
    []
  );

  console.log(user?.userEmail);

  console.log(workspaces);

  console.log(currencyConversion, tokens);

  if (workspacesIsLoading || currencyConversionIsLoading || tokensIsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="flex flex-col items-center pt-12 w-1/2 mx-auto gap-6 space-y-12">
      <Timeline step={step} setStep={(step) => setStep(step)} />
      {step === 1 && (
        <AddPoints
          handleNext={handleNext}
          credits={credits}
          updateCredits={updateCredits}
          tokens={tokens}
          currencyConversion={currencyConversion}
          selectedCurrency={selectedCurrency}
          updateCurrency={updateCurrency}
        />
      )}
      {step === 2 && (
        <Details
          handleNext={handleNext}
          workspace={workspace}
          handleWorkspaceChange={handleWorkspaceChange}
          workspaces={workspaces}
        />
      )}
      {step === 3 && (
        <Checkout
          credits={credits}
          tokens={tokens}
          currencyConversion={currencyConversion}
          selectedCurrency={selectedCurrency}
          workspace={workspace}
        />
      )}
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
    <div className="space-y-2 w-1/3 mx-auto">
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
      <div className="flex justify-between items-center text-xs">
        <span>Buy Credits</span>
        <span>Details</span>
        <span>checkout</span>
      </div>
    </div>
  );
};

export default BuyCreditPage;
