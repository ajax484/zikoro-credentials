"use client";
import { useFetchCertificates } from "@/queries/certificates.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Email from "@/public/icons/mdi_email-sent.svg";
import { TbCancel } from "react-icons/tb";

const AssignPage = () => {
  const { organization } = useOrganizationStore();
  const {
    data: certificates,
    isFetching: certificatesIsLoading,
    refetch: refetchCertificates,
    error: certificatesError,
  } = useFetchCertificates(organization?.organizationAlias!);

  console.log(certificates);

  if (certificatesIsLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-6 mb-4">
      {certificates?.map((certificate) => (
        <Link
          href={`/assign/${certificate.certificateAlias}`}
          key={certificate.id}
        >
          <div
            key={certificate.id}
            className="rounded-lg border border-gray-200 bg-white group flex flex-col px-2 py-4 gap-6 hover:border-basePrimary"
          >
            <p className="font-medium text-gray-700 text-sm capitalize">
              {certificate.name}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <p className="text-gray-600">
                {certificate.credentialType ?? "certificate"}
              </p>
              <p className="text-gray-600">
                {certificate?.attributes && certificate?.attributes.length > 0
                  ? "gold"
                  : certificate?.hasQRCode
                  ? "silver"
                  : "bronze"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Image
                  src={Email}
                  alt={"email"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p className="text-sm text-gray-600">
                  {certificate?.recipientCount}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <TbCancel className="size-6 text-[#555555]" />
                <p className="text-sm text-gray-600">
                  {certificate?.failedRecipientCount}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default AssignPage;
