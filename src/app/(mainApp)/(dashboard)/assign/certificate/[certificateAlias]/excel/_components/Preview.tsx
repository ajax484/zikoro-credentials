import React, { Dispatch, SetStateAction, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CertificateRecipient } from "@/types/certificates";
import { useRecipientsStore } from "@/store/globalRecipientsStore";
import { useRouter } from "next/navigation";

const Preview = ({
  data,
  headers,
  excelHeaders,
  setStep,
  certificateAlias,
}: {
  data: any[][];
  excelHeaders: any[];
  headers: Map<
    { label: string; value: keyof CertificateRecipient; isRequired: boolean },
    any
  >;
  setStep: Dispatch<SetStateAction<number>>;
  certificateAlias: string;
}) => {
  const { setRecipients } = useRecipientsStore();
  const router = useRouter();

  const headerMap = new Map(
    excelHeaders.map((header, index) => [header, index])
  );

  const submitRecipients = async () => {
    const recipients = data.map((row) => {
      const recipient = {};

      Array.from(headers).forEach(([key, value]) => {
        const rowValue = headerMap.get(value) ?? "";
        recipient[key.value] = row[rowValue];

        console.log(key.value, row[rowValue]);
      });

      return recipient;
    }) as {
      recipientFirstName: string;
      recipientLastName: string;
      recipientEmail: string;
    }[];

    setRecipients(recipients);
    router.push(`/designs/certificate/${certificateAlias}/issue?from=excel`);
  };

  const showRow = (value: any, row: any[]) => {
    if (!value) return;
    const rowValue = headerMap.get(value);

    return row[rowValue];
  };

  return (
    <>
      <div className="overflow-x-auto max-w-full w-1/2">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {Array.from(headers).map(([key, value]) => (
                <th
                  key={key.value}
                  className="py-2 px-4 border-b capitalize font-medium text-gray-600 text-center"
                >
                  {key.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr>
                {Array.from(headers).map(([key, value]) => (
                  <td className="py-2 px-4 border-b text-gray-500 text-center">
                    {showRow(value, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => setStep(1)} className="bg-basePrimary w-full">
          Back
        </Button>
        <Button className="bg-basePrimary w-full" onClick={submitRecipients}>
          Import Recipients
        </Button>
      </div>
    </>
  );
};

export default Preview;