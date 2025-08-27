import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { format } from "date-fns";

const History = ({
  recipient,
  getCertificate,
}: {
  recipient: CertificateRecipient & {
    originalCertificate: TCertificate & {
      workspace: TOrganization;
    };
  };
  getCertificate: () => Promise<void>;
}) => {
  const { statusDetails } = recipient;

  return (
    <ScrollArea className="h-[450px] max-h-full">
      {statusDetails &&
        statusDetails
          .filter(
            (status) =>
              status.action !== "email opened" ||
              status.action.includes("shared")
          )
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .map((status, index) => (
            <>
              <div className="flex gap-2">
                <div className="size-7 border border-basePrimary rounded-full flex justify-center items-center bg-white">
                  <div className="bg-basePrimary size-4 rounded-full" />
                </div>
                <div className="flex gap-1 items-center text-xs">
                  <b>{status.action}:</b>
                  <span className="text-gray-600">
                    {format(new Date(status.date), "dd/MM/yyyy hh:mm")}
                  </span>
                </div>
              </div>
              {index !==
                statusDetails.filter(
                  (status) =>
                    status.action !== "email opened" ||
                    status.action.includes("shared")
                ).length -
                  1 && (
                <div className="ml-[12px] h-10 w-[2px] bg-basePrimary" />
              )}
            </>
          ))}
    </ScrollArea>
  );
};

export default History;
