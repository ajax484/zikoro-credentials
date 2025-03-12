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
import { useFetchForms } from "@/queries/integrations.queries";
import { Button } from "@/components/ui/button";

const SelectForm: React.FC<IntegrationComponentProps> = ({
  certificates,
  certificatesIsLoading,
  certificate,
  setCertificate,
  integratedId,
  selectIntegratedId,
  setStep,
  workspace,
}) => {
  const { data: forms, isFetching: formsIsLoading } = useFetchForms(
    workspace?.organizationAlias!
  );

  console.log(forms);

  return (
    <section className="space-y-6">
      <div className="flex items-center flex-col gap-2">
        <Image alt="zikoro" src={Zikoro} height={40} width={40} />
        <h1 className="font-bold text-center text-gray-800">
          Select Form to import recipients
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
        <label className="font-medium text-gray-700 text-sm">Form</label>
        <Select
          disabled={formsIsLoading}
          value={integratedId || ""}
          onValueChange={(value) => {
            selectIntegratedId(value);
          }}
        >
          <SelectTrigger className="w-full rounded-md bg-[#f7f8f9] font-medium">
            <SelectValue placeholder={"Select form"} />
          </SelectTrigger>
          <SelectContent>
            {forms?.map(({ id, title }) => (
              <SelectItem value={String(id)} key={id}>
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center items-center w-full mt-4  ">
        <Button
          disabled={certificatesIsLoading || !certificate}
          onClick={() => setStep(2)}
          size={"sm"}
          className="w-1/2"
        >
          Next
        </Button>
      </div>
    </section>
  );
};

export default SelectForm;
