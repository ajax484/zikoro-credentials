import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MailSend } from "styled-icons/boxicons-regular";
import { Download, Eye, MailOpen, Timer, X } from "lucide-react";
import { CertificateRecipient } from "@/types/certificates";

export const issueesColumns: ColumnDef<CertificateRecipient>[] = [
  {
    accessorKey: "recipientFirstName",
    header: "First Name",
  },
  {
    accessorKey: "recipientLastName",
    header: "Last Name",
  },
  {
    accessorKey: "recipientEmail",
    header: "Email",
  },
  {
    accessorKey: "dateIssued",
    header: "Date Issued",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      //full date
      return date;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    //row with icon
    cell: ({ getValue }) => {
      const status = getValue() as string;
      return (
        <div className="flex items-center gap-2 w-2/3 mx-auto">
          <div className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center">
            {
              //icon
              status === "issued" ? (
                <MailSend className="size-6" />
              ) : status === "email opened" ? (
                <MailOpen className="size-6" />
              ) : status === "revoked" ? (
                <X className="size-6" />
              ) : (
                <Timer className="size-6" />
              )
            }
          </div>
          <span className="text-xs capitalize">
            {status ?? "Awaiting Response"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: "Actions",
    cell: ({ getValue }) => {
      const id = getValue() as number;
      return (
        <div className="flex items-center gap-2 justify-center">
          <div className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center">
            <Eye className="size-6" />
          </div>
          <div className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center">
            <Download className="size-6" />
          </div>
        </div>
      );
    },
  },
];
