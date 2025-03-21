"use client";
import { useEditor } from "@/components/editor/hooks/use-editor";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { TOrganization } from "@/types/organization";
import { replaceSpecialText, replaceURIVariable } from "@/utils/helpers";
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { DownloadIcon, Eye, PrinterIcon, Send, Trash } from "lucide-react";
import Link from "next/link";
import Information from "./tabs/Information";
import History from "./tabs/History";
import Analytics from "./tabs/Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { ArrowBack } from "styled-icons/boxicons-regular";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SendIcon from "@/public/icons/fa_send.svg";
import { ActionModal } from "@/app/(mainApp)/credentials/verify/certificate/[certificateId]/page";
import { initialize } from "next/dist/server/lib/render-server";

interface TTab {
  label: string;
  Component: React.FC<{
    recipient: CertificateRecipient & {
      originalCertificate: TCertificate & {
        workspace: TOrganization;
      };
    };
    getCertificate: () => Promise<void>;
  }>;
}

const tabs: TTab[] = [
  {
    label: "information",
    Component: Information,
  },
  {
    label: "History",
    Component: History,
  },
  {
    label: "Analytics",
    Component: Analytics,
  },
];

const CertificateView = ({
  certificate,
  getCertificate,
}: {
  certificate: CertificateRecipient & {
    originalCertificate: TCertificate & {
      workspace: TOrganization;
    };
  };
  getCertificate: () => Promise<void>;
}) => {
  const router = useRouter();

  const initialData = certificate?.originalCertificate.JSON;

  const [isShareDropDown, showShareDropDown] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log(certificate?.originalCertificate, "initialData");

  let newState = JSON.parse(
    replaceURIVariable(
      replaceSpecialText(
        JSON.stringify(certificate?.originalCertificate.JSON?.json || {}),
        {
          asset: certificate.originalCertificate,
          recipient: certificate,
          organization: certificate.originalCertificate.workspace,
        }
      ),
      certificate.certificateId || ""
    )
  );

  console.log(newState);

  // Find placeholder in newState and replace with profile picture in the string
  newState = String(newState).replaceAll(
    "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
    certificate?.profilePicture?.trim() ||
      "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg"
  );

  console.log(newState);

  const { init, editor } = useEditor({
    defaultState: newState,
    defaultWidth: initialData?.width ?? 900,
    defaultHeight: initialData?.height ?? 1200,
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

  const { mutateData: recallCertificates, isLoading: isLoadingRecall } =
    useMutateData(`/certificates/recipients/recall`);

  const { mutateData: reIssueCertificates, isLoading: isLoadingReissue } =
    useMutateData(`/certificates/recipients/reissue`);

  const { mutateData: resendCertificates, isLoading: isLoadingResend } =
    useMutateData(`/certificates/recipients/resend`);

  const toggleCertificatesFn = async () => {
    const toggleFn = certificate.isValid
      ? recallCertificates
      : reIssueCertificates;

    await toggleFn({
      payload: {
        ids: [certificate.id],
      },
    });
  };

  const resendCertificatesFn = async () => {
    await resendCertificates({
      payload: {
        recipients: [
          {
            id: certificate.id,
            statusDetails: certificate.statusDetails,
          },
        ],
      },
    });
  };

  const ToggleStatus = () => {
    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm",
              !certificate.isValid
                ? "border-gray-600 text-gray-600"
                : "border-red-600  text-red-600"
            )}
          >
            <Trash className="size-4" />
            <span>{certificate.isValid ? "Revoke" : "Reissue"}</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              {certificate.isValid ? (
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
                {certificate.isValid ? "Revoke" : "Reissue"} Credentials
              </h2>
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>
                  Are you sure you want to{" "}
                  {certificate.isValid ? "revoke" : "reissue"} these this
                  credential?
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
                  certificate.isValid ? "bg-red-600" : "bg-basePrimary"
                )}
              >
                {certificate.isValid ? "Revoke" : "Reissue"}
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
        <DialogTrigger asChild>
          <button
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm border-basePrimary text-basePrimary"
            )}
          >
            <Send className="size-4" />
            <span>Resend</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <Image src={SendIcon} alt="resend" width={40} height={40} />
              <h2 className="font-semibold text-center"> Resend Credentials</h2>
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>Are you sure you want to resend these credential?</span>
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

  const Download = () => {
    return (
      <Popover>
        <PopoverTrigger>
          <button
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm border-basePrimary text-basePrimary"
            )}
          >
            <DownloadIcon className="size-4" />
            <span>Download</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-4 flex w-[150px] items-center justify-between gap-2 bg-white rounded-md text-basePrimary">
          <button
            aria-label="Download pdf"
            onClick={() =>
              editor?.savePdf(
                {
                  width: initialData?.width ?? 900,
                  height: initialData?.height ?? 1200,
                },
                `${
                  certificate?.recipientFirstName +
                  "_" +
                  certificate?.recipientLastName
                }_${certificate?.originalCertificate.name}.pdf`
              )
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              className="iconify iconify--carbon"
              width="1.5em"
              height="1.5em"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 32 32"
            >
              <path
                fill="currentColor"
                d="M30 11V9h-8v14h2v-6h5v-2h-5v-4zM8 9H2v14h2v-5h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m0 7H4v-5h4zm8 7h-4V9h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4m-2-2h2a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2z"
              />
            </svg>
          </button>
          <button aria-label="Download png" onClick={() => editor?.savePng()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              className="iconify iconify--tabler"
              width="1.5em"
              height="1.5em"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1M3 16V8h2a2 2 0 1 1 0 4H3m7 4V8l4 8V8"
              />
            </svg>
          </button>
          <button aria-label="Download jpg" onClick={() => editor?.saveSvg()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              aria-hidden="true"
              role="img"
              className="iconify iconify--tabler"
              width="1.5em"
              height="1.5em"
              preserveAspectRatio="xMidYMid meet"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1M7 8H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3m7-8l1.5 8h1L14 8"
              />
            </svg>
          </button>
        </PopoverContent>
      </Popover>
    );
  };

  const btnRef = useRef<HTMLButtonElement>(null);

  function toggleShareDropDown() {
    showShareDropDown((prev) => !prev);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      toggleShareDropDown();
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

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

      // Open a new window with the image
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Failed to open print window.");
      }

      // Write the image to the new window
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Image</title>
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
            <img src="${imageUrl}" alt="Printable Image" onload="window.print()" />
          </body>
        </html>
      `);

      // Close the window after printing
      printWindow.document.close();
      printWindow.onbeforeunload = () => {
        printWindow.close();
      };
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <section className="flex items-center justify-between">
        <button onClick={() => router.back()} aria-label="Back">
          <ArrowBack className="size-4" />
        </button>
        <h1 className="text-lg font-medium capitalize">
          {certificate.originalCertificate.name}
        </h1>
        <div className="flex gap-2 items-center">
          <ToggleStatus />
          <Resend />
          <Download />
          <button
            onClick={handlePrint}
            // onClick={() => {
            //   if (typeof window !== "undefined") {
            //     const imageUrl = editor?.generateLink(true);
            //     window.open(
            //       imageUrl,
            //       certificate.certificateId!,
            //       `width=${initialData.width},height=${initialData.height}`
            //     );
            //   }
            // }}
            disabled={isLoading}
            className={cn(
              "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm border-basePrimary text-basePrimary"
            )}
          >
            <PrinterIcon className="size-4" />
            <span> {isLoading ? "Loading..." : "Print"}</span>
          </button>
        </div>
      </section>
      <section className="grid grid-cols-12 gap-4">
        <div className="bg-white p-4 border rounded-md w-full col-span-4">
          <Tabs defaultValue="information" className="w-full !p-0">
            <TabsList className="bg-white border-b-2 !p-0 w-full !flex !h-fit !rounded-none !justify-start">
              {tabs.map(({ label }) => (
                <TabsTrigger
                  key={label}
                  value={label}
                  className="w-fit px-6 py-2 data-[state=active]:bg-transparent group data-[state=active]:text-basePrimary data-[state=active]:border-b-2 data-[state=active]:border-basePrimary flex gap-2 !rounded-none !h-fit focus-visible:!ring-0 focus-visible:!outline-none data-[state=active]:shadow-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map(({ label, Component }) => (
              <TabsContent key={label} value={label} className="p-4">
                <Component
                  recipient={certificate}
                  getCertificate={getCertificate}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
        <div className="bg-white p-4 border rounded-md w-full col-span-8 h-fit">
          <div
            className="relative h-[500px] md:h-[calc(100%-124px)] w-full hidden"
            ref={containerRef}
          >
            <div className="absolute inset-0 bg-transparent z-50" />
            <canvas ref={canvasRef} />
          </div>
          <Link
            href={
              "/credentials/verify/certificate/" + certificate.certificateId
            }
            className="border-basePrimary border-2 text-basePrimary bg-transparent hover:bg-basePrimary/20 flex gap-2 items-center justify-center rounded-md py-2 px-4 ml-auto w-fit text-sm"
          >
            <Eye className="size-4" />
            <span>User View</span>
          </Link>
          <div className="relative h-full w-full flex justify-center items-center flex-1">
            <img
              alt="certificate"
              src={editor?.generateLink(true)}
              style={{ width: "50%" }}
              className="h-auto"
            />{" "}
          </div>
        </div>
      </section>
      <div className="relative flex gap-4 items-center opacity-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-basePrimary text-white hover:bg-basePrimary/20 py-1 px-2 h-fit">
              <h3 className="font-medium text-[10px]">Share Credential</h3>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2">
            <ActionModal
              recordShare={() => {}}
              close={toggleShareDropDown}
              url={window.location.href}
              shareText={"text"}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger>
            <Download className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="p-4 flex w-[150px] items-center justify-between gap-2 bg-white rounded-md text-basePrimary">
            <button
              aria-label="Download pdf"
              onClick={() =>
                editor?.savePdf(
                  {
                    width: initialData?.width ?? 900,
                    height: initialData?.height ?? 1200,
                  },
                  `${
                    certificate?.recipientFirstName +
                    "_" +
                    certificate?.recipientLastName
                  }_${certificate?.originalCertificate.name}.pdf`
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                aria-hidden="true"
                role="img"
                className="iconify iconify--carbon"
                width="1.5em"
                height="1.5em"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 32 32"
              >
                <path
                  fill="currentColor"
                  d="M30 11V9h-8v14h2v-6h5v-2h-5v-4zM8 9H2v14h2v-5h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2m0 7H4v-5h4zm8 7h-4V9h4a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4m-2-2h2a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2z"
                />
              </svg>
            </button>
            <button aria-label="Download png" onClick={() => editor?.savePng()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                aria-hidden="true"
                role="img"
                className="iconify iconify--tabler"
                width="1.5em"
                height="1.5em"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1M3 16V8h2a2 2 0 1 1 0 4H3m7 4V8l4 8V8"
                />
              </svg>
            </button>
            <button aria-label="Download jpg" onClick={() => editor?.saveSvg()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                aria-hidden="true"
                role="img"
                className="iconify iconify--tabler"
                width="1.5em"
                height="1.5em"
                preserveAspectRatio="xMidYMid meet"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 8h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v-4h-1M7 8H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3m7-8l1.5 8h1L14 8"
                />
              </svg>
            </button>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
};

const AdminView = ({ certificateId }: { certificateId: string }) => {
  const {
    data: certificate,
    isLoading,
    getData: getCertificate,
  } = useGetData<
    CertificateRecipient & {
      originalCertificate: TCertificate & {
        workspace: TOrganization;
      };
    }
  >(`/certificates/recipients/${certificateId}`);

  console.log(certificate);

  return (
    <section>
      {!isLoading && certificate ? (
        <div className="w-[90%] mx-auto">
          <CertificateView
            certificate={certificate}
            getCertificate={getCertificate}
          />
        </div>
      ) : !isLoading && !certificate ? (
        <div>this certificate does not exist</div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid" />
        </div>
      )}
    </section>
  );
};

export default AdminView;
