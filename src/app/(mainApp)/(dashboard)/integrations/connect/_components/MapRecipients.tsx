"use client";
import React from "react";
import Info from "@/public/icons/info.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IntegrationComponentProps } from "./ConnectIntegrations";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchForm } from "@/queries/integrations.queries";
import { findKeysWithSharedValue } from "@/utils/helpers";
import toast from "react-hot-toast";
import { LoaderAlt } from "styled-icons/boxicons-regular";

const MapRecipients: React.FC<IntegrationComponentProps> = ({
  setStep,
  headers,
  updateHeader,
  deleteHeader,
  integratedId,
  workspace,
  selectedIntegration,
}) => {
  if (selectedIntegration === "event") setStep(1.5);

  const { data: form, isFetching: formIsLoading } = useFetchForm(
    workspace?.organizationAlias!,
    integratedId
  );

  console.log(form?.questions, integratedId);

  const onSubmit = () => {
    for (let [key, value] of Array.from(headers)) {
      if (key.isRequired && !value) {
        return toast.error("please ensure all required keys are filled"); // If isRequired=true and value is falsy, return false
      }
    }

    // const duplicates = findKeysWithSharedValue(headers);

    // if (duplicates.size > 0)
    //   return toast.error(
    //     `duplicates found: ${Array.from(duplicates).map(
    //       ([key, value], index) => key + (index < duplicates.size ? ", " : "")
    //     )}`
    //   );

    setStep(3);
  };

  return (
    <section className="flex flex-col gap-y-4">
      {formIsLoading && <LoaderAlt className="mx-auto size-4 animate-spin" />}
      <div className="flex gap-2 items-center justify-center">
        <Image alt="zikoro" src={Info} height={30} width={30} />
        <h1 className="font-bold text-center text-gray-800">
          Map credential attribute to required form question
        </h1>
      </div>
      <form className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-9 gap-4 items-center">
            <div className="col-span-4">
              <span className="text-gray-800 font-medium">
                Credential attributes
              </span>
            </div>
            <div className="flex justify-center"></div>
            <div className="col-span-4">
              <span className="text-gray-800 font-medium">Form question</span>
            </div>
          </div>
          {Array.from(headers).map(([key, value]) => (
            <div className="grid grid-cols-9 gap-4 items-center">
              <div className="col-span-4">
                <Input
                  disabled
                  className="bg-gray-200 text-gray-700"
                  value={key.label + (key.isRequired ? " (*)" : "")}
                />
              </div>
              <div className="flex justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={16}
                  height={16}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M11.793 7.50014H2.5C2.36739 7.50014 2.24021 7.55282 2.14645 7.64659C2.05268 7.74036 2 7.86753 2 8.00014C2 8.13275 2.05268 8.25993 2.14645 8.3537C2.24021 8.44746 2.36739 8.50014 2.5 8.50014H11.793L8.146 12.1461C8.05211 12.24 7.99937 12.3674 7.99937 12.5001C7.99937 12.6329 8.05211 12.7603 8.146 12.8541C8.23989 12.948 8.36723 13.0008 8.5 13.0008C8.63278 13.0008 8.76011 12.948 8.854 12.8541L13.354 8.35414C13.4006 8.3077 13.4375 8.25252 13.4627 8.19178C13.4879 8.13103 13.5009 8.06591 13.5009 8.00014C13.5009 7.93438 13.4879 7.86926 13.4627 7.80851C13.4375 7.74776 13.4006 7.69259 13.354 7.64614L8.854 3.14614C8.76011 3.05226 8.63278 2.99951 8.5 2.99951C8.36723 2.99951 8.23989 3.05226 8.146 3.14614C8.05211 3.24003 7.99937 3.36737 7.99937 3.50014C7.99937 3.63292 8.05211 3.76026 8.146 3.85414L11.793 7.50014Z"
                    fill="#CFCFCF"
                  />
                </svg>
              </div>
              <div
                style={{
                  gridColumn: `span ${key.isRequired ? "4" : "3"} / span ${
                    key.isRequired ? "4" : "3"
                  }`,
                }}
                className="col-span-4"
              >
                <Select
                  defaultValue={value}
                  required={key.isRequired === true}
                  onValueChange={(value) => updateHeader(key, value)}
                >
                  <SelectTrigger className="bg-gray-200 text-gray-700">
                    <SelectValue placeholder="Select Input" />
                  </SelectTrigger>
                  <SelectContent>
                    {form?.questions &&
                      form?.questions.map((question, index) => (
                        <SelectItem key={index} value={question.questionId}>
                          {question.question}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              {!key.isRequired && (
                <button
                  aria-label="delete"
                  type="button"
                  onClick={() => deleteHeader(key)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M8 11C7.73478 11 7.48043 11.1054 7.29289 11.2929C7.10536 11.4804 7 11.7348 7 12C7 12.2652 7.10536 12.5196 7.29289 12.7071C7.48043 12.8946 7.73478 13 8 13H16C16.2652 13 16.5196 12.8946 16.7071 12.7071C16.8946 12.5196 17 12.2652 17 12C17 11.7348 16.8946 11.4804 16.7071 11.2929C16.5196 11.1054 16.2652 11 16 11H8Z"
                      fill="#CFCFCF"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1C18.075 1 23 5.925 23 12ZM21 12C21 13.1819 20.7672 14.3522 20.3149 15.4442C19.8626 16.5361 19.1997 17.5282 18.364 18.364C17.5282 19.1997 16.5361 19.8626 15.4442 20.3149C14.3522 20.7672 13.1819 21 12 21C10.8181 21 9.64778 20.7672 8.55585 20.3149C7.46392 19.8626 6.47177 19.1997 5.63604 18.364C4.80031 17.5282 4.13738 16.5361 3.68508 15.4442C3.23279 14.3522 3 13.1819 3 12C3 9.61305 3.94821 7.32387 5.63604 5.63604C7.32387 3.94821 9.61305 3 12 3C14.3869 3 16.6761 3.94821 18.364 5.63604C20.0518 7.32387 21 9.61305 21 12Z"
                      fill="#CFCFCF"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-4 w-1/2 mx-auto">
          <Button onClick={() => setStep(1)} className="bg-basePrimary w-full">
            Back
          </Button>
          <Button onClick={onSubmit} className="bg-basePrimary w-full">
            Continue
          </Button>
        </div>
      </form>
    </section>
  );
};

export default MapRecipients;
