import React, { Dispatch, SetStateAction, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useRecipientsStore } from "@/store/globalRecipientsStore";
import { useRouter } from "next/navigation";
import { Header } from "./AssignExcelPage";

const Preview = ({
  data,
  headers,
  excelHeaders,
  setStep,
  certificateAlias,
}: {
  data: any[][];
  excelHeaders: any[];
  headers: Map<Header, any>;
  setStep: Dispatch<SetStateAction<number>>;
  certificateAlias: string;
}) => {
  const { setRecipients } = useRecipientsStore();
  const router = useRouter();

  const headerMap = new Map(
    excelHeaders.map((header, index) => [header, index])
  );

  const submitRecipients = async () => {
    const recipients = data
      .filter((row) => !row.every((value) => !value) || row.length > 0)
      .map((row) => {
        console.log(row);
        const recipient = {};

        Array.from(headers).forEach(([key, value]) => {
          const rowValue = headerMap.get(value) ?? "";
          recipient[key.value] = row?.[rowValue];

          console.log(key.value, row[rowValue]);
        });

        return recipient;
      }) as {
      recipientFirstName: string;
      recipientLastName: string;
      recipientEmail: string;
      [key: string]: any;
    }[];

    setRecipients(
      recipients.map((recipient) => ({
        ...recipient,
        profilePicture:
          "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
      }))
    );
    router.push(
      `/designs/certificate/${certificateAlias}/assign/issue?from=excel`
    );
  };

  const showRow = (value: any, row: any[]) => {
    if (!value) return;
    const rowValue = headerMap.get(value);

    return row[rowValue];
  };

  return (
    <div className="space-y-4 max-w-full md:w-1/2 mx-auto">
      <div className="flex gap-4">
        <Button onClick={() => setStep(2)} className="bg-basePrimary w-full">
          Back
        </Button>
        <Button className="bg-basePrimary w-full" onClick={submitRecipients}>
          Import Recipients
        </Button>
      </div>
      <div className="max-w-[calc(100vw-64px)] overflow-hidden">
        <div className="max-w-full overflow-auto">
          <div className="rounded-md border min-w-max">
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
                {data
                  .filter((row) => !row.every((value) => !value))
                  .map((row, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default Preview;
