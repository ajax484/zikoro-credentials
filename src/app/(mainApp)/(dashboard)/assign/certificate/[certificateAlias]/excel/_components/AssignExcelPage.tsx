"use client";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import Upload from "./upload";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { useGetData } from "@/hooks/services/request";
import MapRecipients from "./MapRecipients";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Preview from "./Preview";

const AssignExcelPage = ({
  certificateAlias,
}: {
  certificateAlias: string;
}) => {
  const router = useRouter();
  const { data: certificate, isLoading: certificateIsLoading } =
    useGetData<TCertificate>(`/certificates/${certificateAlias}`, true, null);

  console.log(certificate);

  const [step, setStep] = useState<number>(1);

  const [excelResult, setExcelResult] = useState<string[][]>([]);

  const [headers, setHeaders] = useState<
    Map<
      { label: string; value: keyof CertificateRecipient; isRequired: boolean },
      any
    >
  >(
    new Map([
      [
        { label: "First name", value: "recipientFirstName", isRequired: true },
        null,
      ],
      [
        { label: "Last name", value: "recipientLastName", isRequired: true },
        null,
      ],
      [{ label: "Email", value: "recipientEmail", isRequired: true }, null],
    ])
  );

  const updateHeader = (
    key: {
      label: string;
      value: keyof CertificateRecipient;
      isRequired: boolean;
    },
    value: string
  ) => {
    setHeaders((prevHeaders) => {
      prevHeaders.set(key, value);
      return prevHeaders;
    });
  };

  const deleteHeader = (key: {
    label: string;
    value: keyof CertificateRecipient;
    isRequired: boolean;
  }) => {
    console.log(key, "key");
    setHeaders((prevHeaders) => {
      prevHeaders.delete(key);
      return prevHeaders;
    });
  };

  if(certificateIsLoading) return <div>Loading...</div>

  return (
    <section className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl capitalize font-semibold text-gray-800">
          Send <b>{certificate?.name}</b> to recipients
        </h1>
        <Button
          onClick={() => router.push(`/designs`)}
          className="bg-basePrimary text-white"
          type="button"
        >
          Back
        </Button>
      </div>
      <section className="flex flex-col items-center pt-12 w-full py-8 mx-auto gap-6 space-y-12">
        <Timeline step={step} setStep={(step) => setStep(step)} />
        {step === 1 && (
          <Upload
            setExcelResult={setExcelResult}
            step={step}
            setStep={setStep}
          />
        )}
        {step === 2 && (
          <MapRecipients
            headers={headers}
            updateHeader={updateHeader}
            deleteHeader={deleteHeader}
            excelHeaders={excelResult[0]}
            step={step}
            setStep={setStep}
          />
        )}
        {step === 3 && (
          <Preview
            data={excelResult.filter((row, index) => index > 0)}
            headers={headers}
            excelHeaders={excelResult[0]}
            setStep={setStep}
            certificateAlias={certificateAlias}
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
        <span>Upload</span>
        <span>Map Recipients</span>
        <span>Preview</span>
      </div>
    </div>
  );
};

export default AssignExcelPage;
