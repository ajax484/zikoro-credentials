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
import { Switch } from "@/components/ui/switch";
import { useMutateData } from "@/hooks/services/request";

export const issueesColumns = (
  refetch: () => void
): ColumnDef<CertificateRecipient & { certificate: TCertificate }>[] => [
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
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "recipientLastName",
    header: "Last Name",
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "recipientEmail",
    header: "Email",
  },
  {
    accessorKey: "certificate.name",
    header: "Credential",
    sortingFn: "alphanumeric",
  },
  {
    accessorKey: "created_at",
    header: "Date Issued",
    cell: ({ getValue }) => {
      const date = getValue() as Date;
      return format(date, "MMMM do, yyyy");
    },
    sortingFn: "datetime",
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusIconMap: Record<string, JSX.Element> = {
        issued: <MailSend className="size-6" />,
        "email opened": <MailOpen className="size-6" />,
        revoked: <X className="size-6" />,
        default: <MailSend className="size-6" />,
      };

      return (
        <div className="flex items-center gap-2 w-2/3 mx-auto">
          <div className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center">
            {statusIconMap[status] || statusIconMap.default}
          </div>
          <span className="text-xs capitalize">{status ?? "email sent"}</span>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "isValid",
    header: "Validity",
    cell: ({ getValue, row }) => {
      const isValid = getValue() as boolean;

      const { mutateData: recallCertificates, isLoading: isLoadingRecall } =
        useMutateData(`/certificates/recipients/recall`);
      const { mutateData: reIssueCertificates, isLoading: isLoadingReissue } =
        useMutateData(`/certificates/recipients/reissue`);

      const toggleCertificatesFn = async () => {
        const toggleFn = isValid ? recallCertificates : reIssueCertificates;
        await toggleFn({ payload: { ids: [row.original.id] } });
        await refetch();
      };

      return (
        <Switch
          onClick={toggleCertificatesFn}
          checked={isValid}
          disabled={isLoadingRecall || isLoadingReissue}
          className="data-[state=unchecked]:bg-gray-200 data-[state=checked]:bg-basePrimary"
        />
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "certificateId",
    header: "",
    cell: ({ getValue, row }) => {
      const certificateId = getValue() as number;
      const certificate = row.original.certificate;

      const { organization } = useOrganizationStore();

      const newState = JSON.parse(
        replaceURIVariable(
          replaceSpecialText(JSON.stringify(certificate?.JSON?.json || ""), {
            asset: certificate,
            recipient: row.original,
            organization,
          }),
          row.original.certificateId || ""
        )
      );

      const { init, editor } = useEditor({
        defaultState: newState,
        defaultWidth: certificate?.JSON?.width ?? 900,
        defaultHeight: certificate?.JSON?.height ?? 1200,
        toggleQRCode: () => {},
      });

      const canvasRef = useRef<HTMLCanvasElement>(null);
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current!, {
          controlsAboveOverlay: true,
          preserveObjectStacking: true,
        });

        init({
          initialCanvas: canvas,
          initialContainer: containerRef.current!,
        });

        return () => canvas.dispose();
      }, [init]);

      if (!row.original?.isValid) return null;

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
          </button>
        </div>
      );
    },
    enableSorting: false,
  },
];
