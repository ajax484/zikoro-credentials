"use client";
import useUserStore from "@/store/globalUserStore";
import React, { useEffect, useState } from "react";
import Badge from "@/public/icons/iconamoon_certificate-badge-duotone.svg";
import Certificate from "@/public/icons/ph_certificate-duotone.svg";
import Image from "next/image";
import { useGetData, useMutateData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import Email from "@/public/icons/mdi_email-sent.svg";
import Calendar from "@/public/icons/duo-icons_calendar.svg";
import { format } from "date-fns";
import Link from "next/link";
import { useCreateCertificate } from "@/hooks";
import { toast } from "react-toastify";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TOrganization } from "@/types/organization";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { CreateOrganization } from "@/components/CreateOrganisation/createOrganisation";
import { ArrowRight, Check, Gift, PlusCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CredentialsWorkspaceToken } from "@/types/token";
import SelectOrganization from "@/components/SelectOrganization/SelectOrganization";
import CertificateIcon from "@/public/icons/teenyicons_certificate-solid.svg";
import CertificateIcon2 from "@/public/icons/ph_certificate-duotone.svg";
import CertificateAssignIcon from "@/public/icons/clarity_certificate-outline-alerted.svg";
import EmailOpenedIcon from "@/public/icons/line-md_email-opened-alt-twotone.svg";
import ShareIcon from "@/public/icons/ic_twotone-share.svg";
import NibIcon from "@/public/icons/iconoir_design-nib-solid.svg";
import Assign from "@/public/icons/clarity_certificate-solid-alerted (1).svg";
import Analytics from "@/public/icons/ic_twotone-analytics.svg";
import { InfoCircle } from "styled-icons/bootstrap";
import { generateAlphanumericHash } from "@/utils/helpers";

const CreateCertificateDialog = ({
  open,
  setOpen,
  createCertificateFn,
  certificateIsCreating,
  setDialogIsOpen,
  workspaces,
  workspacesIsLoading,
  triggerButton,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  createCertificateFn: ({
    name,
    workspace,
  }: {
    name: string;
    workspace: TOrganization;
  }) => void;
  certificateIsCreating: boolean;
  setDialogIsOpen: (open: boolean) => void;
  workspaces: TOrganization[];
  workspacesIsLoading: boolean;
  triggerButton: React.ReactNode;
}) => {
  const { organization, setOrganization } = useOrganizationStore();

  const [workspace, setWorkspace] = useState<TOrganization | null>(
    organization
  );

  const [name, setName] = useState<string>("Untitled Certificate");

  const updateWorkspace = (workspace: TOrganization | null) => {
    setWorkspace(workspace);
    setOrganization(workspace);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-[50%]">
        <DialogHeader>
          <DialogTitle>Create Certificate</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">
              Certificate Name
            </label>
            <Input
              type="text"
              placeholder="Enter certificate name"
              className=" placeholder:text-sm h-12 focus:border-gray-500 placeholder:text-gray-200 text-gray-700"
              onInput={(e) => setName(e.currentTarget.value)}
              value={name}
            />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <label className="font-medium text-gray-700">Workspace</label>
            <div className="flex items-center gap-4">
              <Select
                disabled={workspacesIsLoading}
                value={String(workspace?.id)}
                onValueChange={(value) =>
                  updateWorkspace(
                    workspaces?.find(({ id }) => id === parseInt(value))
                  )
                }
              >
                <SelectTrigger className="w-full rounded-md bg-white font-medium">
                  <SelectValue placeholder={"Select workspace"} />
                </SelectTrigger>
                <SelectContent>
                  {workspaces?.map(({ id, organizationName }) => (
                    <SelectItem value={String(id)} key={id}>
                      {organizationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => setDialogIsOpen(true)}
                className="bg-basePrimary gap-x-2 py-1 text-gray-50 font-medium flex items-center justify-center rounded-lg w-fit text-xs"
              >
                <span>New Workspace</span>
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => {
              workspace && createCertificateFn({ name, workspace });
              setOpen(false);
            }}
            disabled={certificateIsCreating || name === "" || !workspace}
            className="mt-4 w-full gap-x-2 hover:bg-opacity-70 bg-basePrimary h-12 rounded-md text-gray-50 font-medium"
          >
            {certificateIsCreating && (
              <LoaderAlt size={22} className="animate-spin" />
            )}
            <span>Create Certificate</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Home = ({ workspaceAlias }: { workspaceAlias: string }) => {
  const { user, setUser } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();
  const router = useRouter();

  const {
    data: workspaces,
    isLoading: workspacesIsLoading,
    getData: refetchWorkspaces,
  } = useGetData<TOrganization[]>(
    `/workspaces?userEmail=${user?.userEmail}`,

    []
  );

  const { mutateData: updateUser, isLoading: updateUserIsLoading } =
    useMutateData(`/users/${user?.id}`, true);

  const { mutateData: claimCredits, isLoading: claimCreditsIsLoading } =
    useMutateData(`/workspaces/credits/buy`);

  console.log(organization);

  const {
    data: certificates,
    isLoading: certificatesIsLoading,
    error,
  } = useGetData<TCertificate[]>(
    `/certificates?workspaceAlias=${organization?.organizationAlias}`,
    []
  );

  const { data: recentCertificate, isLoading: recentCertificateIsLoading } =
    useGetData<TCertificate>(
      `/workspaces/${organization?.organizationAlias}/certificates/recent`,
      {}
    );

  //fetch recipients
  const { data: recipients, isLoading: recipientsIsLoading } = useGetData<
    CertificateRecipient[]
  >(
    `/workspaces/${organization?.organizationAlias}/certificates/recipients`,
    []
  );

  console.log(recentCertificate);
  console.log(recipients);

  const {
    data: credits,
    isLoading: creditsIsLoading,
    getData: getCredits,
  } = useGetData<CredentialsWorkspaceToken[]>(
    `/workspaces/${organization?.id}/credits`,
    []
  );

  const { createCertificate, isLoading: certificateIsCreating } =
    useCreateCertificate();

  const createCertificateFn = async ({
    name,
    workspace,
  }: {
    name: string;
    workspace: TOrganization;
  }) => {
    if (!organization) return toast.error("Please select an organization");
    const data = await createCertificate({
      payload: {
        workspaceAlias: workspace.organizationAlias,
        name,
        createdBy: user?.id,
      },
    });

    if (!data) return;

    router.push(
      `/credentials/create/${data.certificateAlias}?type=certificate&workspaceId=${workspace.id}`
    );
  };

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

  const assignedCertificates = certificates?.filter(
    (certificate) => certificate.recipientCount > 0
  );

  const [claimCreditIsOpen, setClaimCreditIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.freeCreditClaimed) {
      setClaimCreditIsOpen(true);
    }
  }, [user]);

  const claimCreditsFn = async () => {
    if (!organization) return;

    const reference =
      "FREE-" +
      organization?.organizationAlias +
      "-" +
      generateAlphanumericHash(12);

    const data = await claimCredits({
      payload: {
        credits: {
          bronze: {
            amount: 5,
            price: 0,
          },
          silver: {
            amount: 3,
            price: 0,
          },
          gold: {
            amount: 2,
            price: 0,
          },
        },
        workspaceId: organization?.id,
        email: user?.userEmail,
        name: user?.firstName,
        workspaceName: organization?.organizationName,
        reference,
        currency: "NGN",
        workspaceAlias: organization?.organizationAlias,
        activityBy: user?.id,
      },
    });

    if (!data) return;

    setClaimCreditIsOpen(false);

    await getCredits();

    const updatedUser = await updateUser({
      payload: {
        freeCreditClaimed: true,
      },
    });

    if (updatedUser) setUser(updatedUser);
  };

  return (
    <section className="space-y-4">
      {claimCreditIsOpen && (
        <div className="p-4 bg-basePrimary rounded-md flex items-center justify-center text-white gap-4 relative">
          <button
            aria-label="Close"
            onClick={() => setClaimCreditIsOpen(false)}
            className="absolute text-white top-1 right-1"
          >
            <X className="size-5" />
          </button>
          <p className="font-semibold">
            Get started by claiming your free credits for this workspace
          </p>
          <Button
            onClick={claimCreditsFn}
            disabled={
              updateUserIsLoading || claimCreditsIsLoading || !organization
            }
            className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex
        items-center justify-center rounded-lg py-2 px-8 w-fit"
          >
            <Gift className="size-4" />
            <span>Claim</span>
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="text-gray-700">
          <p>
            Hello, <b>{user?.firstName}</b>
          </p>
          <p className="text-sm text-gray-600">
            What will you be working on today?
          </p>
        </div>
        <SelectOrganization />
      </div>

      {recentCertificateIsLoading ||
      recipientsIsLoading ||
      creditsIsLoading ||
      certificatesIsLoading ||
      workspacesIsLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 min-h-fit">
              <CreateCertificateDialog
                triggerButton={
                  <button className="rounded flex flex-col items-center justify-center px-2 py-12 bg-white border">
                    <Image
                      src={Certificate}
                      alt={"certificate"}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                    <p className="font-medium text-sm">
                      Create new certificate
                    </p>
                  </button>
                }
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
              />
              <button
                disabled
                className="rounded flex flex-col items-center justify-center px-2 py-12 bg-white border"
              >
                <Image
                  src={Badge}
                  alt={"badge certificate"}
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <p className="font-medium text-sm">Create new badge</p>
                <small className="text-xs text-gray-600">Coming soon</small>
              </button>
              <div className="bg-white text-[#1F1F1F] px-1 py-4 rounded-xl flex flex-col justify-center items-center gap-y-2 border">
                <div className="">
                  <div className="flex gap-8 justify-center">
                    <div>
                      <span className="font-medium text-sm">Bronze</span>
                      <div className="flex gap-x-1 items-center">
                        <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
                          <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
                        </div>
                        <span className="font-semibold text-sm">
                          {creditBalance.bronze}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Silver</span>
                      <div className="flex gap-x-1">
                        <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
                          <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
                        </div>
                        <span className="font-semibold text-sm">
                          {creditBalance.silver}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Gold</span>
                      <div className="flex gap-x-1">
                        <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
                          <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
                        </div>
                        <span className="font-semibold text-sm">
                          {creditBalance.gold}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center font-medium text-gray-800 text-xs">
                  You need credits to issue credentials.
                </p>
                <Link
                  href={"/credits/buy"}
                  className="text-xs bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize"
                >
                  Buy more credits
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-4">
              <div className="rounded-lg border border-gray-200 bg-white col-span-6 p-4 space-y-4">
                <h3 className="font-semibold">📍Pick up where you left off</h3>
                <div className="flex gap-2">
                  <Link
                    className="flex-[40%] flex justify-center items-center p-8 border-basePrimary/10 border rounded-lg relative group"
                    href={
                      recentCertificate?.JSON
                        ? "/credentials/create/" +
                          recentCertificate.certificateAlias +
                          "?type=certificate&workspaceId=" +
                          organization?.id +
                          "&workspaceAlias=" +
                          organization?.organizationAlias
                        : {}
                    }
                  >
                    <Image
                      src={
                        recentCertificate?.previewUrl
                          ? recentCertificate.previewUrl
                          : CertificateIcon
                      }
                      alt={"certificate"}
                      height={200}
                      width={200}
                    />
                    {recentCertificate?.JSON && (
                      <div className="absolute inset-0 p-2 bg-black/50 group-hover:flex hidden z-10 group-hover:gap-8 group-hover:justify-center group-hover:items-center rounded-lg">
                        <div className="flex flex-col gap-2 items-center">
                          <p className="text-sm text-white font-semibold capitalize text-center group-hover:underline">
                            Continue editing {recentCertificate?.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </Link>

                  <div className="flex-[60%] space-y-4">
                    <h4 className="font-medium">Your progress:</h4>

                    <div>
                      <div className="flex gap-2 ">
                        <div className="border-2 rounded-md p-4 flex items-center justify-center border-basePrimary bg-[#f7f8ff]">
                          <Image
                            src={NibIcon}
                            alt="Nib Icon"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <span className="font-medium">
                            Continue editing {recentCertificate?.name}
                          </span>
                          {recentCertificate && (
                            <Link
                              href={
                                recentCertificate?.JSON
                                  ? "/credentials/create/" +
                                    recentCertificate.certificateAlias +
                                    "?type=certificate&workspaceId=" +
                                    organization?.id +
                                    "&workspaceAlias=" +
                                    organization?.organizationAlias
                                  : {}
                              }
                              className="flex gap-2 items-center"
                            >
                              <span className="text-basePrimary underline">
                                Proceed
                              </span>
                              <ArrowRight className="text-basePrimary size-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="ml-[25px] h-10 w-[2px] bg-basePrimary" />
                      <div className="flex gap-2 items-end">
                        <div className="border-2 rounded-md p-4 flex items-center justify-center border-basePrimary bg-[#f7f8ff]">
                          <Image
                            src={Assign}
                            alt="Assign Icon"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="flex flex-col justify-between">
                          <span className="font-medium">
                            Assigned To Recipients
                          </span>
                          {recentCertificate && (
                            <Link
                              href={
                                recentCertificate?.JSON
                                  ? "assign?certificateAlias=" +
                                    recentCertificate.certificateAlias +
                                    "&type=certificate" +
                                    "workspaceId=" +
                                    organization?.id +
                                    "&workspaceAlias=" +
                                    organization?.id
                                  : {}
                              }
                              className="flex gap-2 items-center"
                            >
                              <span className="text-basePrimary underline">
                                Proceed
                              </span>
                              <ArrowRight className="text-basePrimary size-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="ml-[25px] h-10 w-[2px] bg-basePrimary" />
                      <div className="flex gap-2">
                        <div className="border-2 rounded-md p-4 flex items-center justify-center border-basePrimary bg-[#f7f8ff]">
                          <Image
                            src={Analytics}
                            alt="analytics icon"
                            width={20}
                            height={20}
                          />
                        </div>
                        <div className="flex flex-col h-full">
                          <span className="font-medium">Track Usage</span>
                          {recentCertificate && (
                            <Link
                              href={
                                recentCertificate?.JSON
                                  ? "/analytics?certificateAlias=" +
                                    recentCertificate.certificateAlias
                                  : {}
                              }
                              className="flex gap-2 items-center"
                            >
                              <span className="text-basePrimary underline">
                                Proceed
                              </span>
                              <ArrowRight className="text-basePrimary size-4" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {!recentCertificate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <InfoCircle size={20} className="text-red-600" />
                          <span className="text-xs text-gray-500">
                            Looks like you haven't started designing
                          </span>
                        </div>
                        <CreateCertificateDialog
                          triggerButton={
                            <Button className="bg-basePrimary text-white rounded-md">
                              Start Designing
                            </Button>
                          }
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
                        />
                      </div>
                    )}
                    {recentCertificate &&
                      assignedCertificates?.length === 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <InfoCircle size={20} className="text-red-600" />
                            <span className="text-xs text-gray-500">
                              Looks like you haven't assigned any recipients
                            </span>
                          </div>
                          <Button
                            onClick={() => router.push("/assign")}
                            className="bg-basePrimary text-white rounded-md"
                          >
                            Assign Recipients
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="border rounded-md bg-white p-4 col-span-3 space-y-6 w-full">
                <div className="flex justify-between">
                  <h3 className="font-semibold">📊 Analytics</h3>
                </div>
                <div className="space-y-4 divide-y divide-gray-200 [&>*]:pt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={CertificateIcon2}
                        alt={"certificate"}
                        width={30}
                        height={30}
                      />
                      <span className="text-sm">Created Credentials</span>
                    </div>
                    <span className="font-bold text-xl">
                      {certificates.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={CertificateAssignIcon}
                        alt={"assigned"}
                        width={30}
                        height={30}
                      />
                      <span className="text-sm">Assigned Credentials</span>
                    </div>
                    <span className="font-bold text-xl">
                      {assignedCertificates?.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={EmailOpenedIcon}
                        alt={"assigned"}
                        width={30}
                        height={30}
                      />
                      <span className="text-sm">Viewed</span>
                    </div>
                    <span className="font-bold text-xl">
                      {
                        recipients.filter(
                          (recipient) =>
                            recipient.statusDetails &&
                            recipient.statusDetails.some(
                              (status) => status.action === "email opened"
                            )
                        ).length
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <Image
                        src={ShareIcon}
                        alt={"assigned"}
                        width={30}
                        height={30}
                      />
                      <span className="text-sm">Shared On Socials</span>
                    </div>
                    <span className="font-bold text-xl">
                      {
                        recipients.filter(
                          (recipient) =>
                            recipient.statusDetails &&
                            recipient.statusDetails.some((status) =>
                              status.action.includes("shared")
                            )
                        ).length
                      }
                    </span>
                  </div>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Link href={"/analytics"}>
                    <span className="text-basePrimary mx-auto underline text-xs">
                      See all
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* <div className="border rounded-md bg-white">
            <h2 className="text-sm text-gray-700 font-medium text-center py-2 border-b">
              My designs
            </h2>
            <div className="p-4">
              <Tabs defaultValue="certificates" className="w-full">
                <TabsList className="flex mx-auto w-1/2 mb-6">
                  <TabsTrigger
                    className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white flex gap-2"
                    value="certificates"
                  >
                    <span>Certificates</span>
                    <span className="rounded-full text-xs items-center justify-center group-data-[state=active]:bg-white group-data-[state=active]:text-blue-700 px-2 py-1 bg-gray-300 text-gray-600">
                      {certificates?.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    className="w-full data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                    value="badges"
                  >
                    Badges
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="certificates">
                  <div className="grid grid-cols-6 gap-4 mb-4">
                    {certificates?.slice(0, 6)?.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-lg border border-gray-200 bg-white"
                      >
                        <div className="h-[150px] w-full bg-gray-200 relative">
                          {certificate?.previewUrl && (
                            <Image
                              src={certificate?.previewUrl ?? ""}
                              alt={certificate.name}
                              objectFit="cover"
                              layout="fill"
                            />
                          )}
                        </div>
                        <div className="p-2 space-y-2">
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
                              <p className="text-xs text-gray-600">40</p>
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
                      </div>
                    ))}
                  </div>
                  <Link
                    href={"/designs"}
                    className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit text-sm"
                  >
                    See all
                  </Link>
                </TabsContent>
                <TabsContent value="badges">
                  Change your password here.
                </TabsContent>
              </Tabs>
            </div>
          </div> */}
          </div>
        </div>
      )}
      {dialogIsOpen && (
        <CreateOrganization
          refetch={refetchWorkspaces}
          close={() => {
            setDialogIsOpen(false);
            setOpen(true);
          }}
        />
      )}
    </section>
  );
};

export default Home;
