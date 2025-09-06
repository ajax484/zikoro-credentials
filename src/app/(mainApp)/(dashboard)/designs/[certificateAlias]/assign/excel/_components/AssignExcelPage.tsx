"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import Upload from "./upload";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { useGetData } from "@/hooks/services/request";
import MapRecipients from "./MapRecipients";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Preview from "./Preview";
import { Timeline } from "@/components/Timeline/Timeline";

export interface Header {
  label: string;
  value: string;
  isRequired: boolean;
}

const AssignExcelPage = ({
  certificateAlias,
}: {
  certificateAlias: string;
}) => {
  const router = useRouter();
  const { data: certificate, isLoading: certificateIsLoading } =
    useGetData<TCertificate>(`/certificates/${certificateAlias}`);

  console.log(certificate);

  const [step, setStep] = useState<number>(1);

  const [excelResult, setExcelResult] = useState<string[][]>([]);

  const [headers, setHeaders] = useState<Map<Header, any>>(
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

  const [headersUpdated, setHeadersUpdated] = useState(false);

  useEffect(() => {
    if (headersUpdated) return;
    if (!certificate || certificateIsLoading) return;
    console.log("here");
    setHeadersUpdated(true);
    setHeaders((prevHeaders) => {
      const updatedHeaders = new Map(prevHeaders);

      certificate?.attributes?.forEach((attribute) => {
        const duplicateKey = Array.from(updatedHeaders.keys()).find(
          (key) => key.label === attribute || key.value === attribute
        );

        if (!duplicateKey) {
          updatedHeaders.set(
            { label: attribute, value: attribute, isRequired: false },
            "N/A"
          );
        }
      });

      return updatedHeaders;
    });
  }, [certificateIsLoading]);

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

  if (certificateIsLoading) return <div>Loading...</div>;

  return (
    <section className="space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl capitalize font-semibold text-gray-800">
          Send <b>{certificate?.name}</b> to recipients
        </h1>
        {/* <Button
          onClick={() => router.push(`/designs`)}
          className="bg-basePrimary text-white"
          type="button"
        >
          Back
        </Button> */}
      </div>
      <section className="flex flex-col items-center pt-6 md:pt-12 w-full py-4 md:py-8 mx-auto gap-6 space-y-12">
        <Timeline
          steps={["upload", "map recipients", "preview"]}
          step={step}
          setStep={(step) => setStep(step)}
        />
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
            attributes={certificate?.attributes}
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

export default AssignExcelPage;
