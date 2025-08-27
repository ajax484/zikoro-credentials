"use client";
import {
  ArrowLeft,
  InstagramLogo,
  LinkedinLogo,
  Pencil,
  Share,
  ShareNetwork,
  Upload,
  UploadSimple,
  WhatsappLogo,
  XLogo,
} from "@phosphor-icons/react";
import React, { useEffect, useState } from "react";
import DirectoryLogo from "@/public/icons/DirectoryLogo.svg";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  useFetchDirectory,
  useFetchDirectoryRecipients,
} from "@/queries/directories.queries";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Hint } from "@/components/hint";
import AddRecipientForm from "./_components/CreateRecipient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, isPast } from "date-fns";
import { DirectoryRecipient } from "@/types/directories";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { convertCamelToNormal } from "@/utils/helpers";
import * as XLSX from "xlsx";
import Pagination from "@/components/Pagination";

const Directory = () => {
  const { organization } = useOrganizationStore();
  console.log(organization?.organizationAlias);

  const { data: directory, isFetching } = useFetchDirectory(
    organization?.organizationAlias!
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<{ page: number; limit: number }>(
    { page: 1, limit: 10 }
  );

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  const {
    data: recipients,
    isFetching: recipientsIsFetching,
    refetch,
  } = useFetchDirectoryRecipients(
    organization?.organizationAlias!,
    directory?.directoryAlias!,
    pagination,
    searchTerm
  );
  console.log(recipients);

  useEffect(() => {
    if (directory) {
      refetch();
    }
  }, [directory]);

  console.log(directory);

  console.log(recipients);

  const DirectoryRecipient = ({
    recipient,
  }: {
    recipient: DirectoryRecipient;
  }) => {
    console.log(
      recipient.assignedCertificates.map(
        (c) => c?.certificate?.certificateSettings?.cpdHours
      )
    );
    console.log(
      recipient.assignedCertificates.map(
        (c) => c?.certificate?.certificateSettings?.cpdPoints
      )
    );
    const cpdPoints = recipient?.assignedCertificates.reduce(
      (acc, curr) =>
        acc + (curr.certificate.certificateSettings?.cpdPoints || 0),
      0
    );

    const cpdHours = recipient?.assignedCertificates.reduce(
      (acc, curr) =>
        acc + (curr.certificate.certificateSettings?.cpdHours || 0),
      0
    );

    return (
      <div className="rounded-md border bg-white">
        <div className="p-2 border-b">
          <Avatar className="size-12">
            <AvatarImage src={recipient?.profile_picture} />
            <AvatarFallback>
              {(recipient.first_name[0] || "#") +
                (recipient.last_name[0] || "#")}
            </AvatarFallback>
          </Avatar>

          <Link
            className="font-semibold hover:underline hover:underline-offset-1"
            href={`/directory/${directory?.directoryAlias}/recipients/${recipient.recipientAlias}`}
          >
            {recipient.first_name + " " + recipient.last_name}
          </Link>
          <div className="text-xs flex gap-0.5 mb-2">
            <span className="text-zikoroGray">Last certified:</span>
            <span>
              {/* most recent certificate */}
              {recipient?.assignedCertificates.length > 0
                ? format(
                    new Date(recipient.assignedCertificates[0]?.created_at),
                    "dd MMM, yyyy"
                  )
                : "N/A"}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap mb-2">
            <div className="rounded-xl text-pink-500 bg-pink-50 border-pink-500 px-2 py-1 text-xs border">
              Label
            </div>
          </div>
          <div className="border rounded-md flex">
            <div className="flex flex-col gap-1 px-2 py-2 border-r">
              <span className="font-semibold">{cpdPoints || 0}</span>
              <span className="text-sm text-zikoroGray">Points</span>
            </div>
            <div className="flex flex-col gap-1 px-2 py-2 border-r">
              <span className="font-semibold">
                {recipient?.assignedCertificates.length || 0}
              </span>
              <span className="text-sm text-zikoroGray">Certificates</span>
            </div>
            <div className="flex flex-col gap-1 px-2 py-2">
              <span className="font-semibold">{cpdHours || 0}</span>
              <span className="text-sm text-zikoroGray">Hrs</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center gap-1 p-1 text-xs">
          <span className="text-zikoroGray">Added on:</span>
          <span>{format(new Date(recipient.created_at), "dd MMM, yyyy")}</span>
        </div>
      </div>
    );
  };

  const ExportData = ({
    onOpenChange,
  }: {
    onOpenChange: (open: boolean) => void;
  }) => {
    const exportRecipientsFn = (
      name = `directory_recipients_${
        organization?.organizationName
      }_${new Date().toISOString()}`
    ) => {
      const omittedFields: (keyof (CertificateRecipient & {
        certificate: TCertificate;
      }))[] = [
        "certificateId",
        "certificateGroupId",
        "id",
        "statusDetails",
        "recipientAlias",
      ];

      const normalizedData = convertCamelToNormal<
        CertificateRecipient & {
          certificate: TCertificate;
        }
      >(
        recipients.data.map((obj) =>
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
      onOpenChange(false);
    };

    return (
      <div className="flex flex-col gap-4 items-center py-4">
        <div className="rounded-md border bg-white p-2">
          <UploadSimple size={32} className="text-zikoroBlack" weight="bold" />
        </div>

        <h5 className="text-2xl font-semibold text-center">
          Export Member's Data
        </h5>
        <div className="text-gray-600 font-medium flex flex-col gap-2 text-center">
          <span>Export {recipients.length} members data in view as CSV</span>
        </div>
        <Button
          onClick={() => exportRecipientsFn()}
          disabled={recipients.length === 0}
          className="flex items-center gap-2"
        >
          <UploadSimple size={32} className="text-white" weight="bold" />
          <span>Export</span>
        </Button>
      </div>
    );
  };

  const ShareDialog = ({
    onOpenChange,
  }: {
    onOpenChange: (open: boolean) => void;
  }) => {
    const [copied, setCopied] = useState(false);

    // copy to clipboard'
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    };

    return (
      <div className="flex flex-col gap-4 items-center py-4 w-full max-w-[512px] overflow-hidden">
        {/* share "www.zikoro.com/directory/directoryAlias/recipients/recipientAlias" to instagram, linkedin, whatsapp, x, use icon as buttons on flex*/}
        <div className="flex gap-2 justify-center items-center">
          <button className="rounded-md border bg-white p-1">
            <InstagramLogo
              size={24}
              className="text-zikoroBlack"
              weight="duotone"
            />
          </button>
          <button className="rounded-md border bg-white p-1">
            <LinkedinLogo
              size={24}
              className="text-zikoroBlack"
              weight="duotone"
            />
          </button>
          <button className="rounded-md border bg-white p-1">
            <WhatsappLogo
              size={24}
              className="text-zikoroBlack"
              weight="duotone"
            />
          </button>
          <button className="rounded-md border bg-white p-1">
            <XLogo size={24} className="text-zikoroBlack" weight="duotone" />
          </button>
        </div>

        <div className="border rounded-xl flex items-center gap-2 p-2 w-full">
          <span className="text-zikoroGray text-sm truncate max-w-full">
            https://www.zikoro.com/directory/directoryAlias/recipients/recipientAlias
          </span>
          <button
            onClick={() =>
              copyToClipboard(
                "https://www.zikoro.com/directory/directoryAlias/recipients/recipientAlias"
              )
            }
            className="bg-zikoroBlack rounded-2xl text-white w-[200px] p-2"
          >
            {copied ? <span>Copied</span> : <span>Copy Link</span>}
          </button>
        </div>
      </div>
    );
  };

  const [isRecipientDialog, toggleRecipientDialog] = useState(false);
  const [isExportDialog, toggleExportDialog] = useState(false);
  const [isShareDialog, toggleShareDialog] = useState(false);

  return (
    <section className="space-y-8">
      <section className="border-b py-4 flex justify-end items-center">
        {/* <button className="rounded-full border bg-white p-2">
          <ArrowLeft size={24} className="text-zikoroBlack" weight="bold" />
        </button> */}

        <div className="flex gap-2">
          <Dialog open={isRecipientDialog} onOpenChange={toggleRecipientDialog}>
            <DialogTrigger asChild>
              <button
                className={cn(
                  "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
                )}
              >
                <Pencil size={16} className="text-zikoroBlack" weight="bold" />
                <span>Add Recipient</span>
              </button>
            </DialogTrigger>
            <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
              <AddRecipientForm
                directoryAlias={directory?.directoryAlias}
                onClose={() => {
                  toggleRecipientDialog(false);
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isExportDialog} onOpenChange={toggleExportDialog}>
            <DialogTrigger asChild>
              <button
                className={cn(
                  "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
                )}
              >
                <UploadSimple
                  size={16}
                  className="text-zikoroBlack"
                  weight="bold"
                />
                <span>Export Data</span>
              </button>
            </DialogTrigger>
            <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
              </DialogHeader>
              <ExportData
                onOpenChange={() => {
                  toggleExportDialog(false);
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={isShareDialog} onOpenChange={toggleShareDialog}>
            <DialogTrigger asChild>
              <button
                className={cn(
                  "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
                )}
              >
                <ShareNetwork
                  size={16}
                  className="text-zikoroBlack"
                  weight="bold"
                />
                <span>Share</span>
              </button>
            </DialogTrigger>
            <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Share Page</DialogTitle>
              </DialogHeader>
              <ShareDialog
                onOpenChange={() => {
                  toggleShareDialog(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      <section className="space-y-4 w-3/4">
        {/* <Image
          src={DirectoryLogo}
          alt="Directory Logo"
          width={174}
          height={39}
        /> */}
        {isFetching ? (
          <Skeleton className="w-1/2 h-7 rounded-lg mt-10" />
        ) : (
          <h1 className="text-xl font-semibold mt-10">
            {directory?.directoryName}
          </h1>
        )}

        <div className="border rounded-md flex">
          <div className="flex flex-col gap-1 px-2 py-2 border-r flex-1">
            <span className="font-semibold text-[40px]">
              {recipients.total || 0}
            </span>
            <span className="text-sm text-zikoroGray">
              Total members listed
            </span>
          </div>
          <div className="flex flex-col gap-1 px-2 py-2 border-r flex-1">
            <span className="font-semibold text-[40px]">
              {/* count of all recipients certificates */}
              {recipients.data?.reduce(
                (acc, curr) => acc + (curr?.assignedCertificates.length || 0),
                0
              ) || 0}
            </span>
            <span className="text-sm text-zikoroGray">
              Total certificates earned
            </span>
          </div>
          <div className="flex flex-col gap-1 px-2 py-2 flex-1">
            <span className="font-semibold text-[40px]">
              {recipients.data.reduce(
                (acc, curr) =>
                  acc +
                  curr.assignedCertificates.reduce(
                    (innerAcc, innerCurr) =>
                      innerCurr.certificate.certificateSettings.expiryDate &&
                      isPast(
                        innerCurr.certificate.certificateSettings.expiryDate
                      )
                        ? innerAcc + 1
                        : innerAcc,
                    0
                  ),
                0
              )}
            </span>
            <span className="text-sm text-red-500">
              Total expired certificates
            </span>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-zikoroBlack">Members</h2>
        <div className="w-3/4">
          <Input
            placeholder="Search member name"
            onInput={(e) => setSearchTerm(e.currentTarget.value)}
            value={searchTerm}
            className="border-none !border-b"
          />
        </div>
        {isFetching || recipientsIsFetching ? (
          <div>Loading...</div>
        ) : (
          <>
            {recipients.data.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {recipients.data.map((recipient) => (
                    <DirectoryRecipient
                      key={recipient.id}
                      recipient={recipient}
                    />
                  ))}
                </div>
                <Pagination
                  totalDocs={recipients.total}
                  currentPage={recipients.page}
                  setCurrentPage={updatePage}
                  limit={recipients.limit}
                  isLoading={recipientsIsLoading}
                />
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center gap-4 p-4">
                <p className="text-zikoroBlack text-xl font-semibold">
                  No members found
                </p>
                <p className="text-zikoroBlack text-sm">
                  Add members to your directory to see how many credentials they
                  have received from your organization.
                </p>
                <Dialog
                  open={isRecipientDialog}
                  onOpenChange={toggleRecipientDialog}
                >
                  <DialogTrigger asChild>
                    <button
                      className={cn(
                        "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
                      )}
                    >
                      <Pencil
                        size={16}
                        className="text-zikoroBlack"
                        weight="bold"
                      />
                      <span>Add Recipient</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
                    <AddRecipientForm
                      directoryAlias={directory?.directoryAlias}
                      onClose={() => {
                        toggleRecipientDialog(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
};

export default Directory;
