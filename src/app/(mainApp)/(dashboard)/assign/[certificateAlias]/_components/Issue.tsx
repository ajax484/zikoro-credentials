import { DataTable } from "@/components/DataTable/data-table";
import Filter from "@/components/Filter";
import { Button } from "@/components/ui/button";
import { useFilter } from "@/hooks";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { fabric } from "fabric";
import { TFilter } from "@/types/filter";
import {
  convertCamelToNormal,
  extractUniqueTypes,
  replaceSpecialText,
  replaceURIVariable,
} from "@/utils/helpers";
import { PrinterIcon, Send, Trash } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PiExport } from "react-icons/pi";
import { issueesColumns } from "./columns";
import logo from "@/public/icons/logo.svg";
import excel from "@/public/icons/vscode-icons_file-type-excel.svg";
import penPaper from "@/public/icons/clarity_form-line.svg";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import GradientBorderSelect from "@/components/CustomSelect/GradientSelectBorder";
import { useRouter } from "next/navigation";
import { RowSelectionState } from "@tanstack/react-table";
import Link from "next/link";
import {
  Pagination,
  useGetData,
  useMutateData,
} from "@/hooks/services/request";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { format } from "date-fns";
import { CredentialsWorkspaceToken } from "@/types/token";
import AccountCancel from "@/public/icons/mdi_account-cancel.svg";
import ExportFill from "@/public/icons/ph_export-fill.svg";
import SendIcon from "@/public/icons/fa_send.svg";
import GradientText from "@/components/GradientText";
import { Input } from "@/components/ui/input";
import {
  useRecallCertificates,
  useReIssueCertificates,
  useResendCertificates,
} from "@/mutations/certificates.mutations";
import { useFetchWorkspaceCredits } from "@/queries/credits.queries";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { Label } from "@/components/ui/label";
import { Hint } from "@/components/hint";

const issueesFilter: TFilter<
  CertificateRecipient & { certificate: TCertificate }
>[] = [
  {
    label: "Issue Date",
    accessor: "created_at",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={25}
        height={24}
        viewBox="0 0 25 24"
        fill="none"
      >
        <path
          d="M9.27979 11H7.27979V13H9.27979V11ZM13.2798 11H11.2798V13H13.2798V11ZM17.2798 11H15.2798V13H17.2798V11ZM19.2798 4H18.2798V2H16.2798V4H8.27979V2H6.27979V4H5.27979C4.16979 4 3.28979 4.9 3.28979 6L3.27979 20C3.27979 20.5304 3.4905 21.0391 3.86557 21.4142C4.24064 21.7893 4.74935 22 5.27979 22H19.2798C20.3798 22 21.2798 21.1 21.2798 20V6C21.2798 4.9 20.3798 4 19.2798 4ZM19.2798 20H5.27979V9H19.2798V20Z"
          fill="#717171"
        />
      </svg>
    ),
    type: "dateSingle",
    order: 1,
  },
  {
    label: "Status",
    type: "multiple",
    order: 2,
    icon: (
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth={0}
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M20,3H4C3.447,3,3,3.448,3,4v16c0,0.552,0.447,1,1,1h16c0.553,0,1-0.448,1-1V4C21,3.448,20.553,3,20,3z M19,19H5V5h14V19z" />
        <path d="M11 7H13V9H11zM11 11H13V17H11z" />
      </svg>
    ),
    accessor: "status",
    optionsFromData: true,
  },
];

const Issue = ({
  certificates,
  certificateIssuees,
  updatePage,
  total,
  pagination,
  isLoading,
  certificateAlias,
  updateLimit,
  searchTerm,
  updateSearchTerm,
}: {
  certificates: TCertificate[];
  certificateIssuees: (CertificateRecipient & { certificate: TCertificate })[];
  total: number;
  totalPages: number;
  pagination: Pagination;
  updatePage: (page: number) => void;
  isLoading: boolean;
  certificateAlias: string;
  updateLimit: (limit: number) => void;
  searchTerm: string;
  updateSearchTerm: (searchTerm: string) => void;
}) => {
  const router = useRouter();

  const { organization } = useOrganizationStore();

  console.log(certificateIssuees);

  const {
    filteredData: filteredIssuees,
    filters,
    selectedFilters,
    applyFilter,
    setOptions,
  } = useFilter<CertificateRecipient & { certificate: TCertificate }>({
    data: certificateIssuees,
    dataFilters: issueesFilter,
  });

  useEffect(() => {
    if (isLoading) return;
    filters
      .filter((filter) => filter.optionsFromData)
      .forEach(({ accessor }) => {
        setOptions(
          accessor,
          extractUniqueTypes<CertificateRecipient>(certificateIssuees, accessor)
        );
      });
    // }, []);
  }, [isLoading]);

  const [selectedOption, setSelectedOption] = useState("manual");

  const [selectedCertificate, setSelectedCertificate] = useState<
    string | undefined
  >(certificateAlias);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  console.log(rowSelection);

  const updateSelectedCertificate = (certificateAlias: string) => {
    setSelectedCertificate(certificateAlias);
    console.log("Selected Certificate:", certificateAlias);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.currentTarget.value);
    console.log("Selected Option:", event.target.value);
  };

  const selectType = () => {
    if (selectedOption === "manual") {
      router.push(`/designs/certificate/${selectedCertificate}/issue/`);
    } else if (selectedOption === "spreadsheet") {
      router.push(`/assign/certificate/${selectedCertificate}/excel/`);
    } else if (selectedOption === "event") {
      router.push(`/assign/certificate/${selectedCertificate}/fromEvent/`);
    }
  };

  const { mutateAsync: recallCertificates, isPending: isLoadingRecall } =
    useRecallCertificates(organization?.organizationAlias!);

  const { mutateAsync: reIssueCertificates, isPending: isLoadingReissue } =
    useReIssueCertificates(organization?.organizationAlias!);

  const { mutateAsync: resendCertificates, isPending: isLoadingResend } =
    useResendCertificates(organization?.organizationAlias!);

  const ToggleStatus = () => {
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <Hint
          label={"Select a issuees to enable"}
          side="bottom"
          sideOffset={10}
        >
          <DialogTrigger asChild>
            <button
              className={cn(
                "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm",
                filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                  0 ||
                  (!filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => isValid) &&
                    !filteredIssuees
                      .filter(({ id }) => rowSelection[id])
                      .every(({ isValid }) => !isValid)) ||
                  isLoadingRecall ||
                  isLoadingReissue
                  ? "border-gray-600 text-gray-600"
                  : "border-red-600  text-red-600"
              )}
              disabled={
                filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                  0 ||
                (!filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid) &&
                  !filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => !isValid)) ||
                isLoadingRecall ||
                isLoadingReissue
              }
            >
              <Trash className="size-4" />
              <span>
                {filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid)
                  ? "Revoke"
                  : "Reissue"}
              </span>
            </button>
          </DialogTrigger>
        </Hint>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              {filteredIssuees
                .filter(({ id }) => rowSelection[id])
                .every(({ isValid }) => isValid) ? (
                <Trash className="size-12 text-red-600" />
              ) : (
                <svg
                  width={57}
                  height={50}
                  viewBox="0 0 57 50"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M55.6998 41.0225L33.8373 3.05501C33.2909 2.12482 32.511 1.35356 31.5748 0.817663C30.6385 0.281767 29.5785 -0.000152588 28.4998 -0.000152588C27.421 -0.000152588 26.361 0.281767 25.4247 0.817663C24.4885 1.35356 23.7086 2.12482 23.1623 3.05501L1.29975 41.0225C0.774092 41.9222 0.49707 42.9455 0.49707 43.9875C0.49707 45.0295 0.774092 46.0528 1.29975 46.9525C1.83908 47.8883 2.61768 48.6638 3.55566 49.1993C4.49363 49.7349 5.55721 50.0112 6.63725 50H50.3623C51.4414 50.0103 52.504 49.7336 53.441 49.1981C54.378 48.6626 55.1558 47.8876 55.6948 46.9525C56.2212 46.0532 56.4991 45.0302 56.4999 43.9882C56.5008 42.9462 56.2247 41.9227 55.6998 41.0225ZM52.2323 44.95C52.0417 45.2751 51.768 45.5437 51.4394 45.7282C51.1108 45.9127 50.7391 46.0065 50.3623 46H6.63725C6.26044 46.0065 5.88868 45.9127 5.56008 45.7282C5.23147 45.5437 4.95784 45.2751 4.76725 44.95C4.59461 44.6577 4.50355 44.3245 4.50355 43.985C4.50355 43.6455 4.59461 43.3123 4.76725 43.02L26.6298 5.05251C26.8242 4.72894 27.0991 4.4612 27.4276 4.27532C27.7562 4.08944 28.1273 3.99175 28.5048 3.99175C28.8822 3.99175 29.2533 4.08944 29.5819 4.27532C29.9104 4.4612 30.1853 4.72894 30.3798 5.05251L52.2423 43.02C52.4134 43.3132 52.5027 43.6469 52.501 43.9864C52.4992 44.3258 52.4064 44.6586 52.2323 44.95ZM26.4998 30V20C26.4998 19.4696 26.7105 18.9609 27.0855 18.5858C27.4606 18.2107 27.9693 18 28.4998 18C29.0302 18 29.5389 18.2107 29.914 18.5858C30.289 18.9609 30.4998 19.4696 30.4998 20V30C30.4998 30.5304 30.289 31.0392 29.914 31.4142C29.5389 31.7893 29.0302 32 28.4998 32C27.9693 32 27.4606 31.7893 27.0855 31.4142C26.7105 31.0392 26.4998 30.5304 26.4998 30ZM31.4998 39C31.4998 39.5934 31.3238 40.1734 30.9942 40.6667C30.6645 41.1601 30.196 41.5446 29.6478 41.7716C29.0996 41.9987 28.4964 42.0581 27.9145 41.9424C27.3325 41.8266 26.798 41.5409 26.3784 41.1213C25.9589 40.7018 25.6732 40.1672 25.5574 39.5853C25.4416 39.0033 25.5011 38.4001 25.7281 37.852C25.9552 37.3038 26.3397 36.8352 26.833 36.5056C27.3264 36.176 27.9064 36 28.4998 36C29.2954 36 30.0585 36.3161 30.6211 36.8787C31.1837 37.4413 31.4998 38.2044 31.4998 39Z"
                    fill="#001FCC"
                  />
                </svg>
              )}
              <h2 className="font-semibold text-center">
                {" "}
                {filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid)
                  ? "Revoke"
                  : "Reissue"}{" "}
                Credentials
              </h2>
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>
                  Are you sure you want to{" "}
                  {filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => isValid)
                    ? "revoke"
                    : "reissue"}{" "}
                  these credentials?
                </span>
              </div>
            </div>
            <div className="flex w-full">
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                onClick={async (e) => {
                  e.stopPropagation();
                  await toggleCertificatesFn();
                  clsBtnRef.current?.click();
                }}
                className={cn(
                  "px-4 mx-auto",
                  filteredIssuees
                    .filter(({ id }) => rowSelection[id])
                    .every(({ isValid }) => isValid)
                    ? "bg-red-600"
                    : "bg-basePrimary"
                )}
              >
                {filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(({ isValid }) => isValid)
                  ? "Revoke"
                  : "Reissue"}
              </Button>
            </div>
          </div>
          <DialogClose asChild>
            <button className="hidden" ref={clsBtnRef}>
              close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  const Resend = () => {
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <Hint
          label={"Select a issuees to enable"}
          side="bottom"
          sideOffset={10}
        >
          <DialogTrigger asChild>
            <button
              className={cn(
                "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm",
                filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                  0
                  ? "border-gray-600 text-gray-600"
                  : "border-basePrimary text-basePrimary"
              )}
              disabled={
                filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                  0 ||
                isLoadingRecall ||
                isLoadingReissue ||
                isLoadingResend
              }
            >
              <Send className="size-4" />
              <span>Resend</span>
            </button>
          </DialogTrigger>
        </Hint>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <Image src={SendIcon} alt="resend" width={40} height={40} />
              <h2 className="font-semibold text-center"> Resend Credentials</h2>
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>Are you sure you want to resend these credentials?</span>
              </div>
            </div>
            <div className="flex w-full">
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                onClick={async (e) => {
                  e.stopPropagation();
                  await resendCertificatesFn();
                  clsBtnRef.current?.click();
                }}
                className={cn("px-4 mx-auto", "bg-basePrimary")}
              >
                resend
              </Button>
            </div>
          </div>
          <DialogClose asChild>
            <button className="hidden" ref={clsBtnRef}>
              close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  const ExportRecipients = () => {
    const [itemsPerRow, setItemsPerRow] = useState<number>(1);
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <Hint
          label={"Select a issuees to enable"}
          side="bottom"
          sideOffset={10}
        >
          <DialogTrigger asChild>
            <button
              className={cn(
                "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm disabled:border-gray-600 disabled:text-gray-600 border-basePrimary text-basePrimary"
              )}
              disabled={
                filteredIssuees.filter(({ id }) => rowSelection[id]).length ===
                  0 ||
                isLoadingRecall ||
                isLoadingReissue ||
                isLoadingResend ||
                !filteredIssuees
                  .filter(({ id }) => rowSelection[id])
                  .every(
                    (item, _, arr) =>
                      item.certificateGroupId === arr[0]?.certificateGroupId
                  ) ||
                isPrintLoading
              }
              // onClick={exportRecipients}
            >
              <PrinterIcon className="size-4" />
              <span>{isPrintLoading ? "Preparing..." : "Print"}</span>
            </button>
          </DialogTrigger>
        </Hint>
        <DialogContent className="px-4 py-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <Image src={ExportFill} alt="export" width={40} height={40} />
              <h2 className="font-semibold text-center">Export Credentials</h2>
            </div>
            <div className="relative w-full">
              <div className="relative border mb-4">
                <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
                  Items per row
                </Label>
                <GradientBorderSelect
                  placeholder="Select limit"
                  value={itemsPerRow.toString()}
                  onChange={(value: string) => setItemsPerRow(parseInt(value))}
                  options={[1, 2, 3, 4, 5].map((number) => ({
                    label: number.toString(),
                    value: number.toString(),
                  }))}
                />
              </div>
            </div>
            <div className="flex w-full">
              <Button
                disabled={isLoadingRecall || isLoadingReissue}
                onClick={async (e) => {
                  e.stopPropagation();
                  await exportRecipientsFn({ imagesPerRow: itemsPerRow });
                  clsBtnRef.current?.click();
                }}
                className={cn("px-4 mx-auto", "bg-basePrimary")}
              >
                Export
              </Button>
            </div>
          </div>
          <DialogClose asChild>
            <button className="hidden" ref={clsBtnRef}>
              close
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  const toggleCertificatesFn = async () => {
    const toggleFn = filteredIssuees
      .filter(({ id }) => rowSelection[id])
      .every(({ isValid }) => isValid)
      ? recallCertificates
      : reIssueCertificates;

    await toggleFn({
      ids: filteredIssuees
        .filter(({ id }) => rowSelection[id])
        .map(({ id }) => id),
    });
    updatePage(1);
  };

  const resendCertificatesFn = async () => {
    await resendCertificates({
      recipients: filteredIssuees
        .filter(({ id }) => rowSelection[id])
        .map(({ id, statusDetails }) => ({
          id,
          statusDetails,
        })),
    });
    updatePage(1);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { init, editor } = useEditor({
    defaultState: "",
    defaultWidth: 900,
    defaultHeight: 1200,
    toggleQRCode: () => {},
  });

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

  const [defaultUrl, setDefaultUrl] = useState<string>("");

  // useEffect(() => {
  //   if (defaultUrl) return;
  //   (async () => {
  //     const url1 = await editor?.loadJsonAsync(JSON.stringify(DEFAULT_JSON));
  //     const url2 = await editor?.loadJsonAsync(JSON.stringify(DEFAULT_JSON));
  //     console.log(url1);
  //     if (url2) setDefaultUrl(url2);
  //   })();
  // }, [editor]);

  const [firstGenerate, setFirstGenerate] = useState(true);

  const [isPrintLoading, setIsPrintLoading] = useState(false);

  async function exportRecipientsFn(options?: { imagesPerRow?: number }) {
    try {
      setIsPrintLoading(true);
      const exportedCertificates = filteredIssuees.filter(
        ({ id }) => rowSelection[id]
      );

      let dataUrls: string[] | undefined = [];

      const jsonData = exportedCertificates.map((recipient) => ({
        json: (() => {
          let newState = JSON.parse(
            replaceURIVariable(
              replaceSpecialText(
                JSON.stringify(recipient?.certificate?.JSON?.json || {}),
                {
                  asset: recipient.certificate,
                  recipient: recipient,
                  organization: organization!,
                }
              ),
              recipient.certificateId || ""
            )
          );

          // Handle image replacement
          newState = String(newState).replaceAll(
            "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
            recipient?.profilePicture?.trim()!
          );

          return newState;
        })(),
        width: recipient?.certificate?.JSON.width || 1200,
        height: recipient.certificate.JSON?.height || 900,
      }));

      if (firstGenerate) {
        setFirstGenerate(false);
        await editor?.loadMultipleJsonAsync(jsonData);
        await editor?.loadMultipleJsonAsync(jsonData);
      }

      dataUrls = await editor?.loadMultipleJsonAsync(jsonData);

      if (!dataUrls) return;

      console.log(dataUrls);

      // Prepare print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) throw new Error("Popup blocked");

      printWindow.document.write(`
        <html>
          <head>
            <title>Certificates</title>
            <style>
              body { 
                margin: 0;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                padding: 10px;
              }
              img {
                max-width: calc(${100 / (options?.imagesPerRow || 4)}% - 10px);
                height: auto;
                flex-grow: 1;
                page-break-inside: avoid;
              }
            </style>
          </head>
          <body>
            ${dataUrls.map((url) => `<img src="${url}">`).join("")}
          </body>
        </html>
      `);

      // Print handling
      printWindow.document.close();
      await new Promise((resolve) => setTimeout(resolve, 500)); // Ensure DOM ready

      printWindow.focus();
      printWindow.print();
      // setTimeout(() => printWindow.close(), 3000);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Error generating certificates. Check console for details.");
    } finally {
      setIsPrintLoading(false);
    }
  }

  const { data: credits, isFetching: creditsIsLoading } =
    useFetchWorkspaceCredits(organization?.id!);

  const creditBalance = {
    bronze: credits
      .filter((v) => v.tokenId === 1)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    silver: credits
      .filter((v) => v.tokenId === 2)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    gold: credits
      .filter((v) => v.tokenId === 3)
      .reduce((acc, curr) => acc + curr.creditRemaining, 0),
  };

  console.log(filteredIssuees);

  const creditType = useMemo(() => {
    const certificate = certificates.find(
      ({ certificateAlias }) => certificateAlias === selectedCertificate
    );
    if (!certificate) return "bronze";

    return certificate?.attributes?.length > 0
      ? "gold"
      : certificate?.hasQRCode
      ? "silver"
      : "bronze";
  }, [selectedCertificate]);

  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="flex gap-2 items-center">
          <ToggleStatus />
          <ExportRecipients />
          <Resend />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Link
            href={"/credits/buy"}
            className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize text-sm"
          >
            Buy more credits
          </Link>
          <Dialog
            defaultOpen={!!certificateAlias}
            open={open}
            onOpenChange={setOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => setOpen(true)}
                disabled={isLoadingRecall || isLoadingReissue}
                className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 w-fit text-sm"
              >
                Assign Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[50%]">
              <DialogHeader>
                <DialogTitle>How would you like to add recipients?</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                <label
                  htmlFor="manual"
                  className={cn(
                    "border-2 hover:border-basePrimary h-[250px] py-4 flex flex-col rounded-lg cursor-pointer",
                    selectedOption === "manual" && "border-basePrimary"
                  )}
                >
                  <input
                    type="radio"
                    id="manual"
                    name="options"
                    value="manual"
                    checked={selectedOption === "manual"}
                    onChange={handleChange}
                  />
                  <div className="my-auto flex gap-2 flex-col items-center w-full">
                    <Image
                      src={penPaper}
                      width={40}
                      height={40}
                      alt="excel"
                      className="cursor-pointer"
                    />
                    <span>Add Manually</span>
                  </div>
                </label>
                <label
                  htmlFor="spreadsheet"
                  className={cn(
                    "border-2 hover:border-basePrimary h-[250px] py-4 flex flex-col rounded-lg cursor-pointer",
                    selectedOption === "spreadsheet" && "border-basePrimary"
                  )}
                >
                  <input
                    type="radio"
                    id="spreadsheet"
                    name="recipientType"
                    value="spreadsheet"
                    checked={selectedOption === "spreadsheet"}
                    onChange={handleChange}
                  />
                  <div className="my-auto flex gap-2 flex-col items-center w-full">
                    <Image
                      src={excel}
                      width={40}
                      height={40}
                      alt="excel"
                      className="cursor-pointer"
                    />
                    <span className="text-center">
                      Upload using a spreadsheet
                    </span>
                  </div>
                </label>
                <label
                  className={cn(
                    "border-2 hover:border-basePrimary h-[250px] py-4 flex flex-col rounded-lg cursor-pointer",
                    selectedOption === "event" && "border-basePrimary"
                  )}
                  htmlFor="event"
                >
                  <input
                    type="radio"
                    id="event"
                    name="recipientType"
                    value="event"
                    checked={selectedOption === "event"}
                    onChange={handleChange}
                  />
                  <div className="my-auto flex gap-2 flex-col items-center w-full">
                    <Image
                      src={logo}
                      width={40}
                      height={40}
                      alt="logo"
                      className="cursor-pointer"
                    />
                    <span>Add from Zikoro event</span>
                  </div>
                </label>
              </div>
              {selectedCertificate && (
                <div className="flex flex-col items-center gap-2 text-xs text-gray-600">
                  <span>
                    Assigning this certificate costs <b>1 {creditType} token</b>{" "}
                    per recipient
                  </span>
                  <span>
                    You have <b>{creditBalance[creditType]}</b> {creditType}{" "}
                    tokens
                  </span>
                </div>
              )}
              <GradientBorderSelect
                placeholder="Select Credential"
                value={selectedCertificate || ""}
                onChange={(value: string) => updateSelectedCertificate(value)}
                options={certificates.map(({ certificateAlias, name }) => ({
                  label: name,
                  value: certificateAlias || "",
                }))}
              />

              <DialogFooter>
                {selectedCertificate && (
                  <Button
                    onClick={selectType}
                    className="bg-basePrimary text-white rounded-lg"
                  >
                    Add recipients
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {!isLoading && certificateIssuees.length === 0 && searchTerm === "" ? (
        <div className="flex flex-col items-center justify-center gap-4 text-gray-600 h-[250px]">
          <div className="bg-basePrimary rounded-full p-6">
            <Image src={AccountCancel} width={40} height={40} alt="logo" />
          </div>
          <GradientText className="font-bold text-2xl" Tag={"h1"}>
            No Assignments Yet
          </GradientText>
          <p className="text-gray-800 text-sm font-medium">
            You haven't issued any certificates yet. Once you have assigned
            certificates, the list of recipients will appear here
          </p>
          <Button
            className="bg-basePrimary text-white"
            onClick={() => setOpen(true)}
          >
            Assign Credentials
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-end">
            <input
              type="text"
              placeholder="Search"
              // value={searchTerm}
              onInput={(event) => {
                updateSearchTerm(event.currentTarget.value);
                // updateSearchTerm(event.currentTarget.value);
              }}
              className="placeholder:text-sm placeholder:text-gray-400 text-gray-700 bg-transparent px-4 py-2 w-1/3 border-b focus-visible:outline-none"
            />
            <Filter
              className={`space-y-4 w-1/3 mx-auto hide-scrollbar`}
              filters={filters.sort(
                (a, b) => (a.order || Infinity) - (b.order || Infinity)
              )}
              applyFilter={applyFilter}
              selectedFilters={selectedFilters}
            />
            <GradientBorderSelect
              placeholder="Select limit"
              value={pagination.limit.toString()}
              onChange={(value: string) => updateLimit(parseInt(value))}
              options={[10, 50, 100, 1000].map((limit) => ({
                label: limit.toString(),
                value: limit.toString(),
              }))}
            />
          </div>
          <DataTable<CertificateRecipient & { certificate: TCertificate }>
            columns={issueesColumns}
            data={filteredIssuees}
            currentPage={pagination.page}
            setCurrentPage={updatePage}
            limit={pagination.limit}
            refetch={() => {}}
            totalDocs={total}
            isFetching={isLoading}
            onClick={() => {}}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        </>
      )}
      <div
        className="relative h-[500px] md:h-[calc(100%-124px)] w-full hidden"
        ref={containerRef}
      >
        <div className="absolute inset-0 bg-transparent z-50" />
        <canvas id="canvas" ref={canvasRef} />
      </div>
    </section>
  );
};

export default Issue;
