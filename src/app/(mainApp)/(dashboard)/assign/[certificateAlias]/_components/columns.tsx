import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Check,
  Download,
  Eye,
  MailOpen,
  MailPlusIcon,
  PrinterIcon,
  Timer,
  X,
} from "lucide-react";
import {
  CertificateRecipient,
  FailedCertificateRecipient,
  TCertificate,
} from "@/types/certificates";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { replaceSpecialText, replaceURIVariable } from "@/utils/helpers";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { Switch } from "@/components/ui/switch";
import {
  useRecallCertificates,
  useReIssueCertificates,
} from "@/mutations/certificates.mutations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import printJS from "print-js";

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
  // {
  //   accessorKey: "certificate.name",
  //   header: "Credential",
  //   sortingFn: "alphanumeric",
  // },
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
        issued: <MailPlusIcon className="size-6" />,
        "email opened": <MailOpen className="size-6" />,
        revoked: <X className="size-6" />,
        default: <MailPlusIcon className="size-6" />,
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
      const { organization } = useOrganizationStore();
      const isValid = getValue() as boolean;

      const { mutateAsync: recallCertificates, isPending: isLoadingRecall } =
        useRecallCertificates(organization?.organizationAlias!);

      const { mutateAsync: reIssueCertificates, isPending: isLoadingReissue } =
        useReIssueCertificates(organization?.organizationAlias!);

      const toggleCertificatesFn = async () => {
        const toggleFn = isValid ? recallCertificates : reIssueCertificates;
        await toggleFn({ ids: [row.original.id] });
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
      const { certificate, ...recipient } = row.original;

      const { organization } = useOrganizationStore();

      const initialData = certificate.JSON;

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

      const [isLoading, setIsLoading] = useState(false);

      const handlePrint = async () => {
        const imageUrl = editor?.generateLink(true);
        if (!imageUrl || typeof window === undefined) {
          return;
        }

        setIsLoading(true);

        try {
          // Fetch the image to ensure it exists
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error("Failed to fetch image.");
          }

          console.log(imageUrl, "image");

          printJS(imageUrl, "image");

          // // Open a new window with the image
          // const printWindow = window.open("", "_blank");
          // if (!printWindow) {
          //   throw new Error("Failed to open print window.");
          // }

          // // Write the image to the new window
          // printWindow.document.write(`
          //   <html>
          //     <head>
          //       <title>Print Image</title>
          //       <style>
          //         /* Remove default margins and padding */
          //         body, html {
          //           margin: 0 !important;
          //           padding: 0 !important;
          //           height: ${certificate?.JSON?.height} !important;
          //           width: ${certificate?.JSON?.width} !important;
          //         }
          //         /* Ensure the image takes up the full page */
          //         img {
          //           width: 100% !important;
          //           height: 100% !important;
          //           object-fit: contain; /* Ensures the image fits within the page */
          //         }
          //         /* Hide print metadata (headers and footers) */
          //         @page {
          //           size: auto; /* Use the size of the image */
          //           margin: 25mm 25mm 25mm 25mm !important;
          //         }
          //       </style>
          //     </head>
          //     <body>
          //       <img src="${imageUrl}" alt="Printable Image" onload="window.print()" />
          //     </body>
          //   </html>
          // `);

          // // Close the window after printing
          // printWindow.document.close();
          // printWindow.onbeforeunload = () => {
          //   printWindow.close();
          // };
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      return (
        <div className="flex items-center gap-2 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Link
                  href={`/assign/admin/view/${certificateId}`}
                  className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center hover:bg-basePrimary/20 hover:text-basePrimary"
                >
                  <Eye className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <span>View</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  aria-label="Download"
                  onClick={() => editor?.savePng()}
                  className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center hover:bg-basePrimary/20 hover:text-basePrimary"
                >
                  <Download className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Save as PNG</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <button
                  aria-label="Print"
                  onClick={handlePrint}
                  // onClick={() =>
                  //   editor?.printPdf({
                  //     width: certificate?.JSON?.width,
                  //     height: certificate?.JSON?.height,
                  //   })
                  // }
                  className="bg-gray-200 text-gray-700 rounded-full p-2 flex items-center justify-center hover:bg-basePrimary/20 hover:text-basePrimary"
                >
                  <PrinterIcon className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Print</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
    enableSorting: false,
  },
];

export const failedColumns: ColumnDef<FailedCertificateRecipient>[] = [
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
  // {
  //   accessorKey: "certificate.name",
  //   header: "Credential",
  //   sortingFn: "alphanumeric",
  // },
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
    accessorKey: "failureReason",
    header: "Reason",
    cell: ({ getValue }) => {
      const reason = getValue() as string;
      return <span>{reason}</span>;
    },
  },
  {
    header: "Actions",
    cell: ({ row }) => {
      const { id, certificateId, recipientAlias, failureReason, isValid } =
        row.original;

      const ReissueModal = () => {
        return (
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-full hover:bg-gray-100 text-red-700 hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <span className="p-2">Reissue</span>
              </button>
            </DialogTrigger>
            <DialogContent className="px-4 py-6 z-[1000]">
              <DialogHeader className="px-3">
                <DialogTitle>Reissue Certificate</DialogTitle>
              </DialogHeader>

              <div className="space-y-4"></div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    row.original.isValid = true;
                    row.original.failureReason = null;
                    updateRecipient(row.original);
                    clsBtnRef.current?.click();
                  }}
                  className="bg-basePrimary w-full"
                >
                  Reissue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      };

      return (
        <div className="flex justify-center">
          <ReissueModal />
        </div>
      );
    },
  },
];
