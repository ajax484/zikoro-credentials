"use client";
import {
  ArrowLeft,
  InstagramLogo,
  LinkedinLogo,
  PaperPlane,
  Pencil,
  ShareNetwork,
  WhatsappLogo,
  XLogo,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import DirectoryLogo from "@/public/icons/DirectoryLogo.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Credentials from "./_components/Credentials";
import Skills from "./_components/Skills";
import Contact from "./_components/Contact";
import { useFetchDirectoryRecipient } from "@/queries/directories.queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { is } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddRecipientForm from "../../../_components/CreateRecipient";
import { useRouter } from "next/navigation";
import { useRecipientsStore } from "@/store/globalRecipientsStore";
import { useFetchCertificates } from "@/queries/certificates.queries";
import { Hint } from "@/components/hint";
import { Label } from "@/components/ui/label";
import GradientBorderSelect from "@/components/GradientBorderSelect";
import { Button } from "@/components/ui/button";
import { Certificate } from "crypto";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import { DirectoryRecipient } from "@/types/directories";

interface Tabs {
  recipient: DirectoryRecipient;
}

interface Tabs {
  label: string;
  Component: React.FC<Tabs>;
}

const tabs: Tabs[] = [
  {
    label: "Credentials",
    Component: Credentials,
  },
  {
    label: "Skills",
    Component: Skills,
  },
  {
    label: "Contact",
    Component: Contact,
  },
];

const DirectoryRecipient = ({
  directoryAlias,
  recipientAlias,
}: {
  directoryAlias: string;
  recipientAlias: string;
}) => {
  const { organization } = useOrganizationStore();
  const { data: recipient, isFetching } = useFetchDirectoryRecipient(
    organization?.organizationAlias!,
    directoryAlias,
    recipientAlias
  );

  const [isRecipientDialog, toggleRecipientDialog] = useState(false);

  const router = useRouter();

  const { setRecipients } = useRecipientsStore();

  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const AssignToRecipient = () => {
    const [certificateAlias, setCertificateAlias] = useState<string>("");

    const updateCertificateAlias = (certificateAlias: string) => {
      setCertificateAlias(certificateAlias);
    };

    const [openDialog, setOpenDialog] = useState(false);
    return (
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Hint
          label={"Issue a certificate to this recipient"}
          side="bottom"
          sideOffset={10}
        >
          <DialogTrigger asChild>
            <button
              disabled={isFetching || certificatesIsLoading}
              className={cn(
                "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
              )}
            >
              <PaperPlane
                size={16}
                className="text-zikoroBlack"
                weight="bold"
              />
              <span>Assign</span>
            </button>
          </DialogTrigger>
        </Hint>
        <DialogContent className="px-4 py-6 z-[1000]">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
              <PaperPlane
                size={16}
                className="text-zikoroBlack"
                weight="bold"
              />
              <h2 className="font-semibold text-center">Assign</h2>
            </div>
            <div className="relative w-full">
              <div className="relative border mb-4">
                <Label className="absolute top-0 -translate-y-1/2 right-4 bg-white text-gray-600 text-tiny px-1">
                  Certificate
                </Label>
                <GradientBorderSelect
                  placeholder="Select limit"
                  value={certificateAlias}
                  onChange={(value: string) => updateCertificateAlias(value)}
                  options={certificates.map((certificate) => ({
                    label: certificate.name,
                    value: certificate.certificateAlias,
                  }))}
                />
              </div>
            </div>
            <div className="flex w-full">
              <Button
                disabled={certificatesIsLoading || certificateAlias === ""}
                onClick={() => {
                  setRecipients([
                    {
                      recipientFirstName: recipient?.first_name,
                      recipientLastName: recipient?.last_name,
                      recipientEmail: recipient?.email,
                      recipientAlias: recipient?.recipientAlias,
                      profilePicture:
                        recipient?.profile_picture ||
                        "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg",
                    },
                  ]);
                  setOpenDialog(false);
                  router.push(
                    `/designs/certificate/${certificateAlias}/issue?from=directory`
                  );
                }}
                className={cn("px-4 mx-auto", "bg-basePrimary")}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

  const [isShareDialog, toggleShareDialog] = useState(false);

  console.log(recipient?.assignedCertificates.map((c) => c.certificateGroupId));
  return (
    <section className="space-y-8">
      <section className="border-b py-4 flex items-center justify-between">
        {/* back */}
        <div className="flex gap-2 items-center">
          <Link
            href={"/directory"}
            className="rounded-full border bg-white p-2"
          >
            <ArrowLeft size={24} className="text-zikoroBlack" weight="bold" />
          </Link>
          <Image
            src={DirectoryLogo}
            alt="Directory Logo"
            width={174}
            height={39}
          />
        </div>
        <div className="flex gap-2 items-center">
          <Dialog open={isRecipientDialog} onOpenChange={toggleRecipientDialog}>
            <DialogTrigger asChild>
              <button
                disabled={isFetching}
                className={cn(
                  "border rounded-xl flex items-center gap-2 bg-white px-4 py-2 text-sm"
                )}
              >
                <Pencil size={16} className="text-zikoroBlack" weight="bold" />
                <span>Edit Recipient</span>
              </button>
            </DialogTrigger>
            <DialogContent className="px-4 py-6 max-h-[90vh] overflow-auto">
              <AddRecipientForm
                directoryAlias={directoryAlias}
                onClose={() => {
                  toggleRecipientDialog(false);
                }}
                recipient={recipient}
              />
            </DialogContent>
          </Dialog>
          <AssignToRecipient />
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

      <section className="">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            {isFetching ? (
              <Skeleton className="rounded-full size-[50px]" />
            ) : (
              <Avatar className="size-12">
                <AvatarImage src={recipient?.profile_picture} />
                <AvatarFallback>
                  {(recipient?.first_name[0] || "#") +
                    (recipient?.last_name[0] || "#")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>

          <div className="mb-2">
            {isFetching ? (
              <Skeleton className="w-1/4 h-7 rounded-lg" />
            ) : (
              <h1 className="text-xl font-semibold">
                {recipient?.first_name + " " + recipient?.last_name}
              </h1>
            )}
          </div>

          <div className="text-xs flex gap-0.5 mb-2">
            <span className="text-zikoroGray">Last certified:</span>
            <span>12th, May 2024</span>
          </div>
        </div>
        <Tabs defaultValue="Credentials" className="w-full !p-0 mt-4">
          <TabsList className="bg-transparent border-none !p-0 w-full !flex !h-fit !rounded-none">
            {tabs.map(({ label }) => (
              <TabsTrigger
                key={label}
                value={label}
                className="!font-semibold w-fit px-8 py-2 data-[state=active]:bg-transparent group data-[state=active]:text-zikoroBlack border-b-2 data-[state=active]:border-zikoroBlack flex gap-2 !rounded-none !h-fit focus-visible:!ring-0 focus-visible:!outline-none data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{label}</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(({ label, Component }) => (
            <TabsContent key={label} value={label} className="p-4 ">
              <div className="flex justify-center">
                {isFetching ? (
                  <div>Loading...</div>
                ) : (
                  <Component recipient={recipient} />
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </section>
  );
};

export default DirectoryRecipient;
