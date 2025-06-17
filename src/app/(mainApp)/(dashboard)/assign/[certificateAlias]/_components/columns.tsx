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
import {
  convertCamelToNormal,
  replaceSpecialText,
  replaceURIVariable,
} from "@/utils/helpers";
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
import * as XLSX from "xlsx";
import { PiExport } from "react-icons/pi";

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
    header: ({ table }) => {
      const selected = table
        .getSelectedRowModel()
        .rows.map((row) => row.original);

      const { organization } = useOrganizationStore();

      const exportRecipients = (
        name = `credentials_recipients_${
          organization?.organizationName
        }_${new Date().toISOString()}`
      ) => {
        const omittedFields: (keyof (CertificateRecipient & {
          certificate: TCertificate;
        }))[] = ["certificateId", "certificateGroupId", "id", "statusDetails"];

        const normalizedData = convertCamelToNormal<
          CertificateRecipient & {
            certificate: TCertificate;
          }
        >(
          selected.map((obj) =>
            Object.keys(obj).reduce(
              (newObj, key) => {
                if (
                  !omittedFields.includes(
                    key as keyof (CertificateRecipient & {
                      certificate: TCertificate;
                    })
                  )
                ) {
                  (newObj as any)[key] =
                    key === "created_at"
                      ? obj[key]
                        ? format(new Date(obj[key]), "MM/dd/yyyy")
                        : "N/A"
                      : key === "certificate"
                      ? obj[key].name
                      : (obj as any)[key];
                }
                return newObj;
              },
              {} as Partial<
                CertificateRecipient & {
                  certificate: TCertificate;
                }
              >
            )
          ) as (CertificateRecipient & {
            certificate: TCertificate;
          })[],
          " "
        );

        const worksheet = XLSX.utils.json_to_sheet(normalizedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${name}.xlsx`);
      };

      if (selected.length === 0) return null;

      return (
        <div className="flex items-center justify-center">
          <button
            onClick={() => exportRecipients()}
            className="flex items-center gap-1 justify-center border px-4 py-2 border-black rounded-md text-xs"
          >
            <PiExport className="size-4" />
            <span>Export</span>
          </button>
        </div>
      );
    },
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

      const [isPrintLoading, setIsPrintLoading] = useState(false);

      const [imageIsLoading, setImageIsLoading] = useState(false);
      const [imageError, setImageError] = useState<string | null>(null);
      const [imageSrc, setImageSrc] = useState<string>("");
      const [firstGenerate, setFirstGenerate] = useState(true);

      useEffect(() => {
        const generateImage = async () => {
          if (!editor || imageIsLoading) return;

          setImageIsLoading(true);
          setImageError(null);

          try {
            console.log("Generating certificate image...");

            if (firstGenerate) {
              setFirstGenerate(false);
              await editor.loadJsonAsync(newState);
            }

            const url = await editor.loadJsonAsync(newState);

            if (!url) {
              throw new Error("Failed to generate image URL");
            }

            console.log(url);

            setImageSrc(url);
            console.log("Certificate image generated successfully");
          } catch (error) {
            console.error("Error generating certificate image:", error);
            setImageError("Failed to generate certificate image");
          } finally {
            setImageIsLoading(false);
          }
        };

        // Only generate if we don't have an image yet and editor is available
        if (editor && !imageSrc && !imageIsLoading) {
          generateImage();
        }
      }, [editor, newState, imageSrc, imageIsLoading]);

      const handlePrint = async () => {
        if (!editor || typeof window === "undefined") {
          return;
        }

        setIsPrintLoading(true);

        try {
          console.log("Generating print image...");

          // Use loadJsonAsync to generate a fresh image with all barcodes processed
          const imageUrl = await editor.loadJsonAsync(newState);

          if (!imageUrl) {
            throw new Error("Failed to generate image for printing");
          }

          console.log("Print image generated, opening print window...");

          // Open a new window with the image
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            throw new Error(
              "Failed to open print window. Please check popup blocker settings."
            );
          }

          // Write the image to the new window
          printWindow.document.write(`
        <html>
          <head>
            <title>Print Certificate</title>
            <style>
              /* Remove default margins and padding */
              body, html { 
                margin: 0 !important; 
                padding: 0 !important; 
                height: 100% !important; 
                width: 100% !important; 
              }
              /* Ensure the image takes up the full page */
              img { 
                width: 100% !important; 
                height: 100% !important; 
                object-fit: contain; /* Ensures the image fits within the page */
              }
              /* Hide print metadata (headers and footers) */
              @page { 
                size: auto; /* Use the size of the image */
                margin: 0 !important; /* Remove default margins */
              }
            </style>
          </head>
          <body>
            <img src="${imageUrl}" alt="Certificate" onload="window.print(); window.onafterprint = function() { window.close(); }" />
          </body>
        </html>
      `);

          // Close the document to finish loading
          printWindow.document.close();

          console.log("Print window opened successfully");
        } catch (error) {
          console.error("Print error:", error);
          alert(`Failed to print certificate: ${error.message}`);
        } finally {
          setIsPrintLoading(false);
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
                  disabled={isPrintLoading}
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
