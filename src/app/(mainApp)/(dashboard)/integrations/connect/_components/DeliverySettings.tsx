"use client";
import React from "react";
import Info from "@/public/icons/info.svg";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IntegrationComponentProps } from "./ConnectIntegrations";
import { Input } from "@/components/ui/input";

const DeliverySettings: React.FC<IntegrationComponentProps> = ({
  step,
  setStep,
  schedule,
  scheduleDate,
  selectSchedule,
  selectScheduleDate,
}) => {
  return (
    <section className="flex flex-col gap-y-6">
      <div className="flex gap-2 items-center justify-center w-1/3 mx-auto p-4 rounded-lg bg-basePrimary/10">
        <Image alt="zikoro" src={Info} height={30} width={30} />
        <span className="font-medium text-gray-700 text-sm text-left">
          Ensure you have sufficient credit for this action. Triggers will be
          terminated if the credit balance is insufficient.
        </span>
      </div>
      <h1 className="font-bold text-center text-gray-800">
        When should the credential be issued?
      </h1>
      <RadioGroup
        onValueChange={(value) => selectSchedule(value)}
        defaultValue={schedule}
        className="flex items-center gap-6 justify-center"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            className="data-[state=checked]:bg-basePrimary"
            value={"immediately"}
            id={"immediately"}
          />
          <Label htmlFor={"immediately"}>Immediately</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem
            className="data-[state=checked]:bg-basePrimary"
            value={"schedule"}
            id={"schedule"}
          />
          <Label htmlFor={"schedule"}>Schedule</Label>
        </div>
      </RadioGroup>
      {schedule === "schedule" && (
        <div className="flex flex-col gap-2 w-1/3 mx-auto">
          <label className="font-medium text-gray-700 text-sm">Workspace</label>
          <Input
            onInput={(e) => selectScheduleDate(e.currentTarget.value)}
            value={scheduleDate}
            type="datetime-local"
            placeholder="Enter the Job Title"
            className="inline-flex placeholder:text-sm h-11 text-gray-700 w-full"
          />
        </div>
      )}
      <div className="flex gap-4 w-1/2 mx-auto">
        <Button onClick={() => setStep(2)} className="bg-basePrimary w-full">
          Back
        </Button>
        <Button onClick={() => setStep(4)} className="bg-basePrimary w-full">
          Continue
        </Button>
      </div>
    </section>
  );
};

export default DeliverySettings;
