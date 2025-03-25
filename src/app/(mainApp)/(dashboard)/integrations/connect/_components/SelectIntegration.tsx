"use client";
import React from "react";
import Zikoro from "@/public/icons/zikoro2a 1.svg";
import Image from "next/image";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { IntegrationComponentProps } from "./ConnectIntegrations";
import {
  useFetchEvents,
  useFetchForms,
  useFetchQuizzes,
} from "@/queries/integrations.queries";
import { Button } from "@/components/ui/button";
import Info from "@/public/icons/info.svg";

export function useFetchIntegrationData(
  organizationAlias: string | number,
  selectedIntegration: string
) {
  switch (selectedIntegration) {
    case "quiz":
      return useFetchQuizzes(organizationAlias);
    case "form":
      return useFetchForms(organizationAlias);
    case "event":
      return useFetchEvents(organizationAlias);
    default:
      return { data: [], isFetching: false };
  }
}

const SelectIntegration: React.FC<IntegrationComponentProps> = ({
  certificates,
  certificatesIsLoading,
  certificate,
  setCertificate,
  integratedId,
  selectIntegratedId,
  setStep,
  workspace,
  selectedIntegration,
}) => {
  const { data: options, isFetching: IsLoading } = useFetchIntegrationData(
    selectedIntegration === "event"
      ? workspace?.id!
      : workspace?.organizationAlias!,
    selectedIntegration
  );

  console.log(integratedId);

  return (
    <section className="space-y-6">
      {selectedIntegration === "quiz" && (
        <div className="flex gap-2 items-center justify-center">
          <Image alt="zikoro" src={Info} height={30} width={30} />
          <h1 className="font-bold text-center text-gray-800">
            You can only connect quizzes that are linked to a form
          </h1>
        </div>
      )}
      <div className="flex items-center flex-col gap-2">
        <Image alt="zikoro" src={Zikoro} height={40} width={40} />
        <h1 className="font-bold text-center text-gray-800">
          Select {selectedIntegration} to import recipients
        </h1>
      </div>
      <div className="flex flex-col gap-2 w-1/2 mx-auto">
        <label className="font-medium text-gray-700 text-sm">
          Credential to be issued:
        </label>
        <Select
          disabled={certificatesIsLoading}
          value={String(certificate?.id || "")}
          onValueChange={(value) => {
            const certificate = certificates?.find(
              ({ id }) => id === parseInt(value)
            );
            !!certificate && setCertificate(certificate);
          }}
        >
          <SelectTrigger className="w-full rounded-md bg-[#f7f8f9] font-medium">
            <SelectValue placeholder={"Select certificate"} />
          </SelectTrigger>
          <SelectContent>
            {certificates?.map(({ id, name }) => (
              <SelectItem value={String(id)} key={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 w-1/2 mx-auto">
        <label className="font-medium text-gray-700 text-sm capitalize">
          {selectedIntegration}:
        </label>
        <Select
          disabled={IsLoading}
          value={integratedId || ""}
          onValueChange={(value) => {
            selectIntegratedId(value);
          }}
        >
          <SelectTrigger className="w-full rounded-md bg-[#f7f8f9] font-medium">
            <SelectValue placeholder={"Select " + selectedIntegration} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem
                value={String(
                  selectedIntegration === "quiz" ? option.form.id : option.id
                )}
                key={option.id}
              >
                {selectedIntegration === "quiz"
                  ? option.coverTitle
                  : selectedIntegration === "event"
                  ? option.eventTitle
                  : option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center items-center w-full mt-4  ">
        <Button
          disabled={certificatesIsLoading || !certificate || !integratedId}
          onClick={() => setStep(selectedIntegration === "event" ? 3 : 2)}
          size={"sm"}
          className="w-1/2"
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default SelectIntegration;
