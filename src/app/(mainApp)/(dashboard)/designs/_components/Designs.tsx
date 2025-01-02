"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useGetData } from "@/hooks/services/request";
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
import { useCreateCertificate } from "@/hooks";
import { Button } from "@/components/ui/button";
import { CredentialsWorkspaceToken } from "@/types/token";

const Designs = () => {
  const { organization, setOrganization } = useOrganizationStore();

  const { createCertificate, isLoading: certificateIsCreating } =
    useCreateCertificate();

  const createCertificateFn = async () => {
    if (!organization) return toast.error("Please select an organization");
    const data = await createCertificate({
      payload: { workspaceAlias: organization.organizationAlias },
    });

    if (!data) return;

    if (typeof window !== "undefined") {
      window.open(
        `/credentials/create/${data.certificateAlias}?type=certificate&workspaceId=${organization.id}`
      );
    }
  };

  console.log(organization);

  const {
    data: certificates,
    isLoading: certificatesIsLoading,
    error,
  } = useGetData<TCertificate[]>(
    `/certificates?workspaceAlias=${organization?.organizationAlias}`,
    true,
    []
  );

  const { data: credits, isLoading: creditsIsLoading } = useGetData<
    CredentialsWorkspaceToken[]
  >(`/workspaces/${organization?.id}/credits`, true, []);

  console.log(credits);

  const {
    searchTerm,
    searchedData: filteredCertificates,
    setSearchTerm,
  } = useSearch<TCertificate>({
    data: certificates || [],
    accessorKey: ["name"],
  });

  return (
    <div>
      <SelectOrganization />
      <div className="bg-basePrimary/10 text-[#1F1F1F] px-1 py-4 rounded-xl space-y-2 border w-1/2 mx-auto my-6">
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
                <span className="font-semibold">
                  {credits
                    .filter((v) => v.tokenId === 1)
                    .reduce((acc, curr) => acc + curr.CreditPurchased, 0)}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">Silver</span>
              <div className="flex gap-x-1">
                <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
                  <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
                </div>
                <span className="font-semibold">
                  {credits
                    .filter((v) => v.tokenId === 2)
                    .reduce((acc, curr) => acc + curr.CreditPurchased, 0)}
                </span>
              </div>
            </div>
            <div>
              <span className="font-medium">Gold</span>
              <div className="flex gap-x-1">
                <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
                  <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
                </div>
                <span className="font-semibold">
                  {credits
                    .filter((v) => v.tokenId === 3)
                    .reduce((acc, curr) => acc + curr.CreditPurchased, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center font-medium text-gray-800 text-sm">
          You need credits to issue credentials.
        </p>
        <Link
          href={"/credits/buy"}
          className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit capitalize"
        >
          Buy more credits
        </Link>
      </div>
      <Tabs defaultValue="certificates" className="w-full">
        <TabsList className="flex mx-auto w-2/5 border my-6">
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
            disabled
          >
            Badges (coming soon)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="certificates">
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
                <button
                  onClick={createCertificateFn}
                  disabled={certificateIsCreating}
                  className="rounded-md border bg-white flex flex-col items-center justify-center gap-2 min-h-[250px]"
                >
                  <Image
                    src={Solar}
                    alt={"solar"}
                    width={30}
                    height={30}
                    className="rounded-full"
                  />
                  <span className="text-sm text-basePrimary">Create New</span>
                </button>
                {filteredCertificates?.map((certificate) => (
                  <div
                    key={certificate.id}
                    className="rounded-lg border border-gray-200 bg-white group"
                  >
                    <div className="h-[250px] w-full bg-gray-200 relative">
                      {certificate?.cerificateUrl && (
                        <Image
                          src={certificate?.cerificateUrl ?? ""}
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
                            "?type=certificate"
                          }
                          target={"_blank"}
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
                            "/designs/certificate/" +
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
              </>
            )}
          </div>
        </TabsContent>
        <TabsContent value="badges">Change your password here.</TabsContent>
      </Tabs>
    </div>
  );
};

export default Designs;
