import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MailSend } from "styled-icons/boxicons-regular";
import { Check, Download, Eye, MailOpen, Timer, X } from "lucide-react";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { replaceSpecialText, replaceURIVariable } from "@/utils/helpers";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { useEffect, useRef } from "react";
import { fabric } from "fabric";

export const issueesColumns: ColumnDef<
  CertificateRecipient & { certificate: TCertificate }
>[] = [
  {
    accessorKey: "select",
    header: ({ table }) => (
      <div className="pl-2">
        <Checkbox
          className="data-[state=checked]:bg-basePrimary"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="pl-2">
        <Checkbox
          className="data-[state=checked]:bg-basePrimary"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          disabled={!row.getCanSelect()}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
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
    accessorKey: "certificate.name",
    header: "Credential",
  },
  {
    accessorKey: "created_at",
    header: "Date Issued",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      //full date
      return format(date, "MMMM do, yyyy");
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
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
                <MailSend className="size-6" />
              )
            }
          </div>
          <span className="text-xs capitalize">{status ?? "email sent"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isValid",
    header: "Validity",
    cell: ({ getValue }) => {
      const isValid = getValue() as boolean;
      return (
        <div className="flex items-center gap-2 w-2/3 mx-auto">
          <div className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center">
            {isValid ? <Check className="size-6" /> : <X className="size-6" />}
          </div>
          <span className="text-xs capitalize">
            {isValid ? "Valid" : "Invalid"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "certificateId",
    header: "",
    cell: ({ getValue, row }) => {
      const certificateId = getValue() as number;
      const certificate = row.original.certificate;

      console.log(row.original);
      console.log(certificate);

      const { organization } = useOrganizationStore();

      let newState = JSON.parse(
        replaceURIVariable(
          replaceSpecialText(JSON.stringify(certificate?.JSON?.json || ""), {
            asset: certificate,
            recipient: row.original,
            organization,
          }),
          row.original.certificateId || ""
        )
      );

      // newState = newState.replaceAll(
      //   "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
      //   certificate?.attendee?.profilePicture?.trim() ||
      //     "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg"
      // );

      console.log(newState);

      const { init, editor } = useEditor({
        defaultState: newState,
        defaultWidth: certificate?.JSON?.width ?? 900,
        defaultHeight: certificate?.JSON?.height ?? 1200,
      });

      console.log(editor);

      const canvasRef = useRef(null);
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
          controlsAboveOverlay: true,
          preserveObjectStacking: true,
        });

        init({
          initialCanvas: canvas,
          initialContainer: containerRef.current!,
        });

        return () => {
          canvas.dispose();
        };
      }, [init]);

      return (
        <div className="flex items-center gap-2 justify-center">
          <Link
            href={`credentials/verify/certificate/${certificateId}`}
            className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center"
          >
            <Eye className="size-6" />
          </Link>
          <button
            aria-label="Download"
            onClick={() => editor?.savePng()}
            className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center"
          >
            <Download className="size-6" />
            <div
              className="h-[calc(100%-124px)] flex-1 bg-muted hidden"
              ref={containerRef}
            >
              <canvas ref={canvasRef} />
            </div>
          </button>
        </div>
      );
    },
  },
];
