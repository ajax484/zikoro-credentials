"use client";
import React, { useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useDeleteRequest, useGetData } from "@/hooks/services/request";
import { TCertificate } from "@/types/certificates";
import Link from "next/link";
import Email from "@/public/icons/mdi_email-sent.svg";
import Calendar from "@/public/icons/duo-icons_calendar.svg";
import Solar from "@/public/icons/solar_pen-new-square-bold-duotone.svg";
import { format } from "date-fns";
import useSearch from "@/hooks/common/useSearch";
import useOrganizationStore from "@/store/globalOrganizationStore";
import SelectOrganization from "@/components/SelectOrganization/SelectOrganization";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { CredentialsWorkspaceToken } from "@/types/token";
import { useRouter } from "next/navigation";
import { TOrganization } from "@/types/organization";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateOrganization } from "@/components/CreateOrganisation/createOrganisation";
import useUserStore from "@/store/globalUserStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Nib from "@/public/icons/iconoir_design-nib-solid2.svg";
import GradientText from "@/components/GradientText";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import {
  useFetchCertificates,
  useFetchCertificateTemplates,
} from "@/queries/certificates.queries";
import CreateCertificateDialog from "@/components/modals/CreateCertificate.modal";
import {
  useCreateCertificate,
  useCreateTemplate,
  useDeleteCertificate,
} from "@/mutations/certificates.mutations";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/utils/helpers";

const Designs = () => {
  const { user, setUser } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();
  const router = useRouter();

  const {
    data: workspaces,
    isFetching: workspacesIsLoading,
    refetch: refetchWorkspaces,
    error: workspacesError,
  } = useFetchWorkspaces(user?.userEmail!);

  const { mutateAsync: createCertificate, isPending: certificateIsCreating } =
    useCreateCertificate();

  const createCertificateFn = async ({
    name,
    workspace,
    JSON,
    credentialType,
  }: {
    name: string;
    workspace: TOrganization;
    JSON: Record<string, any> | null;
    credentialType: "label" | "certificate" | "badge";
  }) => {
    if (!organization) return toast.error("Please select an organization");
    console.log(JSON);
    const data = await createCertificate({
      workspaceAlias: workspace.organizationAlias,
      name,
      createdBy: user?.id!,
      JSON,
      hasQRCode: !!JSON,
      credentialType,
    });

    console.log(data);
    if (!data) return;

    router.push(
      `/credentials/create/${data.certificateAlias}?type=${data.credentialType}&workspaceId=${workspace.id}`
    );
  };

  console.log(organization);

  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const { data: credits, isLoading: creditsIsLoading } = useGetData<
    CredentialsWorkspaceToken[]
  >(`/workspaces/${organization?.id}/credits`, []);

  console.log(credits);

  const {
    searchTerm,
    searchedData: filteredCertificates,
    setSearchTerm,
  } = useSearch<TCertificate>({
    data: certificates || [],
    accessorKey: ["name"],
  });

  const [open, setOpen] = useState(false);

  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false);

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

  const Delete = ({ certificateAlias }: { certificateAlias: string }) => {
    const { mutateAsync: deleteCertificate, isPending: isDeleting } =
      useDeleteCertificate(certificateAlias);

    const certificate = filteredCertificates.find(
      (certificate) => certificate.certificateAlias === certificateAlias
    );

    const clsBtnRef = useRef<HTMLButtonElement>(null);

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="w-full hover:bg-gray-100 text-red-700"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="p-2">Delete</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <DialogHeader className="px-3">
            <DialogTitle></DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-4 items-center py-4">
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
              <div className="text-gray-800 font-medium flex flex-col gap-2 text-center">
                <span>
                  Are you sure you want to delete {certificate?.name}? This will
                  delete all related issued certificates.
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={isDeleting}
                onClick={(e) => {
                  clsBtnRef.current?.click();
                }}
                className="border-2 bg-white border-basePrimary text-basePrimary w-full"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={async (e) => {
                  clsBtnRef.current?.click();
                  await deleteCertificate();
                }}
                className="bg-basePrimary w-full"
              >
                Delete
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

  const {
    data: certificateTemplates,
    isFetching: certificateTemplatesIsLoading,
  } = useFetchCertificateTemplates();

  const ConvertToTemplate = ({
    certificateAlias,
  }: {
    certificateAlias: string;
  }) => {
    const { mutateAsync: createTemplate, isPending: isCreating } =
      useCreateTemplate();

    const certificate = filteredCertificates.find(
      (certificate) => certificate.certificateAlias === certificateAlias
    );

    if (!certificate) return;

    const clsBtnRef = useRef<HTMLButtonElement>(null);

    const [template, setTemplate] = useState<Record<string, any>>({
      name: certificate.name,
      attributes: certificate.attributes,
      JSON: certificate.JSON,
      previewUrl: certificate.previewUrl,
      credentialType: certificate.credentialType,
      sourceId: user?.id!,
      tags: ["user created"],
    });

    const [previewUrlUploading, setPreviewUrlUploading] = useState(false);

    const uploadDocumentFn = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Allowed file types: PNG, JPEG, and PDF
      const allowedTypes = ["image/png", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PNG or JPEG file");
        return;
      }

      // Check file size (limit: 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setPreviewUrlUploading(true);

      const { url, error } = await uploadFile(file, "image");

      if (error) {
        toast.error(error);
        setPreviewUrlUploading(false);
        return;
      }

      if (url) {
        setTemplate((prev) => ({
          ...prev,
          previewUrl: url,
        }));
      }

      setPreviewUrlUploading(false);
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <button
            className="w-full hover:bg-gray-100 text-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="p-2">Convert to Template</span>
          </button>
        </DialogTrigger>
        <DialogContent className="px-4 py-6 z-[1000]">
          <DialogHeader className="px-3">
            <DialogTitle></DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 w-full">
              <label htmlFor="name" className="font-medium text-gray-700">
                Template name
              </label>
              <Input
                name="name"
                type="text"
                placeholder="Enter template name"
                className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
                onInput={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    name: e.currentTarget.value,
                  }))
                }
                value={template.name}
              />
            </div>
            {!previewUrlUploading ? (
              <div className="relative bg-basePrimary/10 rounded-lg p-8 flex flex-col gap-2 items-center">
                <b className="text-sm">Upload a preview url of your template</b>
                <label
                  htmlFor="previewUrl"
                  className="text-basePrimary underline text-sm"
                >
                  {template.previewUrl ? (
                    <span className="max-w-full truncate">
                      {certificate.name + ".png"}
                    </span>
                  ) : (
                    <span>Upload Preview url</span>
                  )}

                  <input
                    name="previewUrl"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={(e) => uploadDocumentFn(e)}
                    disabled={previewUrlUploading}
                  />
                </label>
                <p className="text-gray-700 text-xs">accepts png, jpeg.</p>
              </div>
            ) : (
              <div className="size-8 border-2 border-gray-300 rounded-full animate-spin border-t-black mx-auto my-8" />
            )}
            <div className="flex gap-2">
              <Button
                disabled={isCreating}
                onClick={(e) => {
                  clsBtnRef.current?.click();
                }}
                className="border-2 bg-white border-basePrimary text-basePrimary w-full"
              >
                Cancel
              </Button>
              <Button
                disabled={isCreating}
                onClick={async (e) => {
                  clsBtnRef.current?.click();
                  await createTemplate(template);
                }}
                className="bg-basePrimary w-full"
              >
                Proceed
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

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <SelectOrganization />
      </div>
      {/* <div className="bg-basePrimary/10 text-[#1F1F1F] px-1 py-4 rounded-xl space-y-2 border w-1/2 mx-auto my-6">
        <div className="mb-4 space-y-2">
          <h3 className="text-lg text-gray-700 font-semibold py-2 text-center">
            Current Credit Information
          </h3>
          <div className="flex gap-8 justify-center">
            <div>
              <span className="font-medium">Bronze</span>
              <div className="flex gap-x-1 items-center">
                <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
                  <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
                </div>
                <span className="font-semibold">{creditBalance.bronze}</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Silver</span>
              <div className="flex gap-x-1">
                <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
                  <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
                </div>
                <span className="font-semibold">{creditBalance.silver}</span>
              </div>
            </div>
            <div>
              <span className="font-medium">Gold</span>
              <div className="flex gap-x-1">
                <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
                  <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
                </div>
                <span className="font-semibold">{creditBalance.gold}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center font-medium text-gray-800 text-sm">
          You need credits to issue credentials.
        </p>
        <Link
          href={"/credits/buy"}
          className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize text-xs"
        >
          Buy more credits
        </Link>
      </div> */}
      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="flex mx-auto w-2/5 border my-6">
          <TabsTrigger
            className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white flex gap-2"
            value="certificates"
          >
            <span>Certificates</span>
            <span className="rounded-full text-sm items-center justify-center group-data-[state=active]:bg-white group-data-[state=active]:text-blue-700 px-3 py-1 bg-gray-300 text-gray-600">
              {certificates?.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            className="w-full data-[state=active]:bg-blue-700 data-[state=active]:text-white"
            value="badges"
            disabled
          >
            Badges (coming soon)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
          {!certificatesIsLoading && certificates?.length === 0 ? (
            <>
              <div className="flex flex-col justify-center items-center h-[250px] gap-4">
                <div className="bg-basePrimary rounded-full p-6">
                  <Image
                    src={Nib}
                    alt="nib"
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                </div>
                <GradientText className="font-bold text-2xl" Tag={"h1"}>
                  No certificates found
                </GradientText>
                <p className="text-gray-800 text-sm font-medium">
                  Get started by creating your first certificate
                </p>
                <CreateCertificateDialog
                  open={open}
                  setOpen={setOpen}
                  createCertificateFn={createCertificateFn}
                  certificateIsCreating={certificateIsCreating}
                  setDialogIsOpen={() => {
                    setOpen(false);
                    setDialogIsOpen(true);
                  }}
                  workspaces={workspaces}
                  workspacesIsLoading={workspacesIsLoading}
                  triggerButton={
                    <Button
                      type="button"
                      className="bg-basePrimary text-white"
                      disabled={certificateIsCreating}
                    >
                      Start Creating
                    </Button>
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  disabled={certificatesIsLoading}
                  onInput={(event) => setSearchTerm(event.currentTarget.value)}
                  className="placeholder:text-sm placeholder:text-gray-400 text-gray-700 bg-transparent px-4 py-2 mb-6 w-1/3 mx-auto border-b focus-visible:outline-none"
                />
              </div>
              <div className="grid grid-cols-4 gap-8 mb-4">
                {certificatesIsLoading ? (
                  <div>Loading...</div>
                ) : (
                  <>
                    <CreateCertificateDialog
                      open={open}
                      setOpen={setOpen}
                      createCertificateFn={createCertificateFn}
                      certificateIsCreating={certificateIsCreating}
                      setDialogIsOpen={() => {
                        setOpen(false);
                        setDialogIsOpen(true);
                      }}
                      workspaces={workspaces}
                      workspacesIsLoading={workspacesIsLoading}
                      triggerButton={
                        <button
                          disabled={certificateIsCreating}
                          className="rounded-lg border bg-white flex flex-col items-center justify-center gap-2 min-h-[250px]"
                        >
                          <Image
                            src={Solar}
                            alt={"solar"}
                            width={30}
                            height={30}
                            className="rounded-full"
                          />
                          <span className="text-sm text-basePrimary">
                            Create New
                          </span>
                        </button>
                      }
                    />
                    {filteredCertificates?.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-lg border border-gray-200 bg-white group"
                      >
                        <div className="h-[250px] w-full bg-gray-200 relative">
                          {certificate?.previewUrl && (
                            <Image
                              src={certificate?.previewUrl ?? ""}
                              alt={certificate.name}
                              objectFit="cover"
                              layout="fill"
                            />
                          )}
                          <div className="absolute inset-0 p-2 bg-black/50 group-hover:flex hidden z-10 group-hover:gap-8 group-hover:justify-center group-hover:items-center">
                            <Link
                              className="text-gray-50 hover:text-basePrimary"
                              href={
                                "/credentials/create/" +
                                certificate.certificateAlias +
                                "?type=certificate&workspaceId=" +
                                organization?.id +
                                "&workspaceAlias=" +
                                organization?.organizationAlias
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="36"
                                height="36"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill="currentColor"
                                  d="m14.06 9.02l.92.92L5.92 19H5v-.92zM17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83l3.75 3.75l1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29m-3.6 3.19L3 17.25V21h3.75L17.81 9.94z"
                                />
                              </svg>
                            </Link>
                            <Link
                              className="text-gray-50 hover:text-basePrimary"
                              href={
                                "/assign?certificateAlias=" +
                                certificate.certificateAlias
                              }
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="36"
                                height="36"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  fill="currentColor"
                                  d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8"
                                />
                              </svg>
                            </Link>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2">
                          <div className="flex-1 space-y-2">
                            <p className="font-medium text-gray-700 text-sm capitalize">
                              {certificate.name}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Image
                                  src={Email}
                                  alt={"email"}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                                <p className="text-xs text-gray-600">
                                  {certificate?.recipientCount}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Image
                                  src={Calendar}
                                  alt={"calendar"}
                                  width={20}
                                  height={20}
                                  className="rounded-full"
                                />
                                <p className="text-xs text-gray-600">
                                  {format(certificate.created_at, "dd/MM/yyyy")}
                                </p>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                aria-label="More options"
                                className="p-2 z-[10] rotate-90"
                              >
                                <svg
                                  stroke="currentColor"
                                  fill="currentColor"
                                  strokeWidth={0}
                                  viewBox="0 0 16 16"
                                  height="1.5em"
                                  width="1.5em"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3 9.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm5 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <ul>
                                <li className="w-full">
                                  <button
                                    className="w-full hover:bg-gray-100 text-gray-700 py-2"
                                    onClick={(e) => {
                                      organization &&
                                        createCertificateFn({
                                          name: certificate.name + " (copy)",
                                          workspace: organization,
                                          JSON: certificate.JSON,
                                          credentialType:
                                            certificate.credentialType,
                                        });
                                    }}
                                  >
                                    <span className="p-2">Make a copy</span>
                                  </button>
                                </li>
                                <li className="text-center p-2 hover:bg-gray-100 text-gray-700">
                                  <ConvertToTemplate
                                    certificateAlias={
                                      certificate.certificateAlias
                                    }
                                  />
                                </li>
                                <li className="text-center p-2 hover:bg-gray-100 text-red-700">
                                  <Delete
                                    certificateAlias={
                                      certificate.certificateAlias
                                    }
                                  />
                                </li>
                              </ul>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="badges">Change your password here.</TabsContent>
      </Tabs>
      {dialogIsOpen && (
        <CreateOrganization
          refetch={refetchWorkspaces}
          close={() => {
            setDialogIsOpen(false);
            setOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default Designs;
