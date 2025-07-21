"use client";
import useUserStore from "@/store/globalUserStore";
import React, { useEffect, useState } from "react";
import Question from "@/public/icons/Question.svg";
import Certificate from "@/public/icons/ph_certificate-duotone.svg";
import Image from "next/image";
import { useMutateData } from "@/hooks/services/request";
import Link from "next/link";
import { toast } from "react-toastify";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { TOrganization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import { CreateOrganization } from "@/components/CreateOrganisation/createOrganisation";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import SelectOrganization from "@/components/SelectOrganization/SelectOrganization";
import CertificateIcon from "@/public/icons/teenyicons_certificate-solid.svg";
import CertificateIcon2 from "@/public/icons/ph_certificate-duotone.svg";
import CertificateAssignIcon from "@/public/icons/PaperPlaneTilt.svg";
import EmailOpenedIcon from "@/public/icons/EnvelopeSimpleOpen.svg";
import ShareIcon from "@/public/icons/ShareNetwork.svg";
import NibIcon from "@/public/icons/PenNib.svg";
import Assign from "@/public/icons/PaperPlaneTilt.svg";
import Analytics from "@/public/icons/ChartBar.svg";
import { generateAlphanumericHash } from "@/utils/helpers";
import { useFetchWorkspaces } from "@/queries/Workspaces.queries";
import {
  useFetchCertificates,
  useFetchRecentCertificate,
} from "@/queries/certificates.queries";
import { useFetchWorkspaceCredits } from "@/queries/credits.queries";
import { useUpdateWorkspaceCredits } from "@/mutations/credits.mutations";
import { useFetchRecipients } from "@/queries/recipients.queries";
import { motion } from "framer-motion";
import CreateCertificateDialog from "@/components/modals/CreateCertificate.modal";
import { useCreateCertificate } from "@/mutations/certificates.mutations";
import { BsInfoCircle } from "react-icons/bs";
import { CredentialType } from "@/types/certificates";

const Home = ({ workspaceAlias }: { workspaceAlias: string }) => {
  const { user, setUser } = useUserStore();
  const { organization, setOrganization } = useOrganizationStore();
  const router = useRouter();

  const {
    data: workspaces,
    isFetching: workspacesIsLoading,
    refetch: refetchWorkspaces,
    error: workspacesError,
  } = useFetchWorkspaces(user?.userEmail!);

  const { mutateData: updateUser, isLoading: updateUserIsLoading } =
    useMutateData(`/users/${user?.id}`, true);

  const { mutateAsync: claimCredits, isPending: claimCreditsIsLoading } =
    useUpdateWorkspaceCredits();

  console.log(organization);

  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const { data: recentCertificate, isFetching: recentCertificateIsLoading } =
    useFetchRecentCertificate(organization?.organizationAlias!);

  //fetch recipients
  const { data: recipients, isFetching: recipientsIsLoading } =
    useFetchRecipients(organization?.organizationAlias!);

  console.log(recentCertificate);
  console.log(recipients);

  const { data: credits, isFetching: creditsIsLoading } =
    useFetchWorkspaceCredits(organization?.id!);

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
    credentialType: CredentialType;
  }) => {
    if (!organization) return toast.error("Please select an organization");
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
    });

    if (!data) return;

    setClaimCreditIsOpen(false);

    const updatedUser = await updateUser({
      payload: {
        freeCreditClaimed: true,
      },
    });

    if (updatedUser) setUser(updatedUser);
  };

  const slideIn = {
    initial: {
      opacity: 0,
      width: 0,
    },
    animate: {
      opacity: 1,
      width: "100%",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="space-y-4">
      {/* {claimCreditIsOpen && (
        <div className="p-4 bg-basePrimary rounded-lg flex items-center justify-center text-white gap-4 relative">
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
      )} */}
      <div className="flex items-center justify-between">
        <div className="text-gray-700 font-medium">
          <p className="text-zikoroGrey">
            Hello{" "}
            <span className="text-xl font-semibold text-zikoroBlack">
              {user?.firstName}
            </span>
            ,
          </p>
          <p className="text-sm text-zikoroGrey">
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
            <div className="grid grid-cols-3 gap-6 min-h-fit">
              <CreateCertificateDialog
                triggerButton={
                  <button className="rounded-lg flex flex-col items-center justify-center px-2 py-12 bg-white border">
                    <Image
                      src={Certificate}
                      alt={"certificate"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <p className="font-semibold text-zikoroBlack">
                      Create new credential
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
              <Link
                href={"https://help.zikoro.com/credentials"}
                target={"_blank"}
                rel={"noreferrer"}
                className="rounded-lg flex flex-col items-center justify-center px-4 py-12 bg-white border relative"
              >
                <Image
                  src={Question}
                  alt={"badge certificate"}
                  width={32}
                  height={32}
                  className="rounded-full mb-2"
                />
                <p className="font-semibold text-zikoroBlack text-sm text-center">
                  Explore quick tutorials to become a pro in no time
                </p>
              </Link>
              <div className="bg-white text-zikoroBlack px-1 py-4 rounded-xl flex flex-col justify-center items-center gap-y-2 border">
                <div className="">
                  <div className="flex gap-8 justify-center">
                    <div>
                      <span className="font-medium text-sm">Bronze</span>
                      <div className="flex gap-x-1 items-center">
                        <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%)]">
                          <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%)]" />
                        </div>
                        <span className="font-semibold">
                          {creditBalance.bronze}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Silver</span>
                      <div className="flex gap-x-1">
                        <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1))]">
                          <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1))]" />
                        </div>
                        <span className="font-semibold">
                          {creditBalance.silver}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Gold</span>
                      <div className="flex gap-x-1">
                        <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%)]">
                          <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%)]" />
                        </div>
                        <span className="font-semibold">
                          {creditBalance.gold}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-center font-medium text-zikoroGrey text-sm">
                  You need credits to issue credentials.
                </p>
                <Link
                  href={"/credits/buy"}
                  className="bg-basePrimary gap-x-2 font-semibold flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit text-white"
                >
                  Buy more credits
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-9 gap-6">
              <div className="rounded-lg border border-gray-200 bg-white col-span-6 p-4 space-y-4">
                <h3 className="font-semibold text-zikoroBlack">
                  📍Pick up where you left off
                </h3>
                <div className="flex gap-4 items-center">
                  <Link
                    className="size-[250px] justify-center items-center p-8 border-basePrimary/10 border relative group bg-[#f7f8f9] rounded-lg"
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
                      <div className="absolute inset-0 p-2 bg-zikoroBlack/80 group-hover:flex hidden z-10 group-hover:gap-8 group-hover:justify-center group-hover:items-center rounded-lg">
                        <div className="flex flex-col gap-2 items-center">
                          <div className="text-white font-medium text-center flex flex-col items-center gap-2">
                            <span className="text-sm">Continue editing</span>
                            <span className="underline underline-offset-2 text-xl">
                              {recentCertificate?.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>

                  <div className="flex-[60%] space-y-4 text-sm">
                    <div>
                      <div className="flex gap-2">
                        <div className="border rounded-lg p-4 flex items-center justify-center border-basePrimary bg-[#f7f8ff]">
                          <Image
                            src={NibIcon}
                            alt="Nib Icon"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="flex flex-col justify-evenly">
                          <span className="font-semibold text-gray-700">
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
                              <span className="text-basePrimary underline underline-offset-2 font-medium">
                                Proceed
                              </span>
                              <motion.div
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                animate={{
                                  x: [0, 10, 0],
                                }}
                              >
                                <ArrowRight className="text-basePrimary size-5" />
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="ml-[32px] h-5 w-[1px] bg-basePrimary" />
                      <div className="flex gap-2">
                        <div className="rounded-lg p-4 flex items-center justify-center border-basePrimary border bg-[#f7f8ff]">
                          <Image
                            src={Assign}
                            alt="Assign Icon"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="flex flex-col justify-evenly">
                          <span className="font-semibold text-gray-700">
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
                              <span className="text-basePrimary underline underline-offset-2 font-medium">
                                Proceed
                              </span>
                              <motion.div
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                animate={{
                                  x: [0, 10, 0],
                                }}
                              >
                                <ArrowRight className="text-basePrimary size-5" />
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="ml-[32px] h-5 w-[1px] bg-basePrimary" />
                      <div className="flex gap-2">
                        <div className="border rounded-lg p-4 flex items-center justify-center border-basePrimary bg-[#f7f8ff]">
                          <Image
                            src={Analytics}
                            alt="analytics icon"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="flex flex-col justify-evenly">
                          <span className="font-semibold text-gray-700">
                            Track Usage
                          </span>
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
                              <span className="text-basePrimary underline underline-offset-2 font-medium">
                                Proceed
                              </span>
                              <motion.div
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                                animate={{
                                  x: [0, 10, 0],
                                }}
                              >
                                <ArrowRight className="text-basePrimary size-5" />
                              </motion.div>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {!recentCertificate && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BsInfoCircle size={20} className="text-red-600" />
                          <span className="text-xs text-gray-500">
                            Looks like you haven't started designing
                          </span>
                        </div>
                        <CreateCertificateDialog
                          triggerButton={
                            <Button className="rounded-lg">
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
                            <BsInfoCircle size={20} className="text-red-600" />
                            <span className="text-xs text-gray-500">
                              Looks like you haven't assigned any recipients
                            </span>
                          </div>
                          <Button
                            onClick={() => router.push("/assign")}
                            className="bg-basePrimary text-white rounded-lg"
                          >
                            Assign Recipients
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div className="border rounded-lg bg-white p-4 col-span-3 w-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-zikoroBlack">
                      <span className="text-[18.75px]">📊</span> Analytics
                    </h3>
                  </div>
                  <div className="space-y-2 divide-y divide-gray-200 [&>*]:pt-4 text-zikoroBlack">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={CertificateIcon2}
                          alt={"certificate"}
                          width={24}
                          height={24}
                        />
                        <span className="text-sm">Created Credentials</span>
                      </div>
                      <span className="font-semibold text-xl">
                        {certificates.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={CertificateAssignIcon}
                          alt={"assigned"}
                          width={24}
                          height={24}
                        />
                        <span className="text-sm">Assigned Credentials</span>
                      </div>
                      <span className="font-semibold text-xl">
                        {assignedCertificates?.reduce(
                          (acc, { recipientCount }) => acc + recipientCount,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Image
                          src={EmailOpenedIcon}
                          alt={"assigned"}
                          width={24}
                          height={24}
                        />
                        <span className="text-sm">Viewed</span>
                      </div>
                      <span className="font-semibold text-xl">
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
                          width={24}
                          height={24}
                        />
                        <span className="text-sm">Shared On Socials</span>
                      </div>
                      <span className="font-semibold text-xl">
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
                </div>
                <div className="flex justify-center items-center gap-2">
                  <Link href={"/analytics"}>
                    <motion.div
                      initial="initial"
                      animate="initial"
                      whileHover="animate"
                      className="space-y-0"
                    >
                      <span className="bg-gradient-to-r from-[#001FCC] to-[#9D00FF] bg-clip-text text-transparent mx-auto">
                        See all
                      </span>
                      <motion.div
                        variants={slideIn}
                        className="bg-basePrimary h-0.5"
                      />
                    </motion.div>
                  </Link>
                </div>
              </div>
            </div>

            {/* <div className="border rounded-lg bg-white">
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
