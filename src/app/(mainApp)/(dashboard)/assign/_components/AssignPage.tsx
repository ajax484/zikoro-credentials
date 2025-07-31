"use client";
import {
  useFetchCertificates,
  useFetchWorkspaceCertificates,
} from "@/queries/certificates.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import PaperPlaneIcon from "@/public/icons/PaperPlaneTilt_assign.svg";
import CertificateIcon from "@/public/icons/Certificate_assign.svg";
import IDBadgeIcon from "@/public/icons/idBadge_assign.svg";
import TagIcon from "@/public/icons/Tag_assign.svg";
import PackageIcon from "@/public/icons/Package_assign.svg";
import CancelIcon from "@/public/icons/ProhibitInset_assign.svg";
import { TbCancel } from "react-icons/tb";
import { CredentialType } from "@/types/certificates";
import { cn } from "@/lib/utils";

const CredentialTypeIcon: Record<CredentialType, string> = {
  certificate: CertificateIcon,
  badge: IDBadgeIcon,
  "product label": TagIcon,
  "shipping label": PackageIcon,
};

const creditTypeClassName = {
  silver:
    "[background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]",
  gold: "[background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]",
  bronze:
    "[background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]",
};

const AssignPage = () => {
  const { organization } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  // const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<{ page: number; limit: number }>(
    { page: 1, limit: 10 }
  );

  const {
    data: certificates,
    isFetching: certificatesIsLoading,
    refetch: refetchCertificates,
    error: certificatesError,
  } = useFetchCertificates(organization?.organizationAlias!);

  const { data, isFetching: certificateIssueesIsLoading } =
    useFetchWorkspaceCertificates(
      organization?.organizationAlias!,
      pagination,
      searchTerm
    );

  console.log(data);

  if (certificatesIsLoading) return <div>Loading...</div>;

  return (
    <section className="">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800">
          Assigned Credentials
        </h1>
        <p className="text-gray-600 text-sm">
          View and manage your assigned credentials
        </p>
      </div>
      <div className="grid grid-cols-4 gap-6 mb-4">
        {certificates?.map((certificate) => (
          <Link
            href={`/assign/${certificate.certificateAlias}`}
            key={certificate.id}
          >
            <div
              key={certificate.id}
              className="rounded-lg border border-gray-200 bg-white group p-2 hover:border-basePrimary"
            >
              <h2 className="font-semibold text-gray-800 text-sm capitalize mb-2">
                {certificate.name}
              </h2>
              <div className="flex items-center justify-between text-sm mb-8">
                <div className="flex items-center gap-1">
                  <Image
                    src={
                      CredentialTypeIcon[
                        certificate.credentialType ?? "certificate"
                      ]
                    }
                    alt={"credential type"}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  <p className="text-gray-600">
                    {certificate.credentialType ?? "certificate"}
                  </p>
                </div>
                <div className="flex items-center gap-1 mr-6">
                  <div
                    className={cn(
                      "rounded-full size-4 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;]",
                      creditTypeClassName[
                        certificate?.attributes &&
                        certificate?.attributes.length > 0
                          ? "gold"
                          : certificate?.hasQRCode
                          ? "silver"
                          : "bronze"
                      ]
                    )}
                  />
                  <p className="text-gray-600 capitalize">
                    {certificate?.attributes &&
                    certificate?.attributes.length > 0
                      ? "gold"
                      : certificate?.hasQRCode
                      ? "silver"
                      : "bronze"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 divide-x-2">
                <div className="flex items-center gap-1">
                  <Image
                    src={PaperPlaneIcon}
                    alt={"email"}
                    width={16}
                    height={16}
                  />
                  <span className="text-sm text-gray-800">
                    {certificate?.recipientCount}
                  </span>
                  <span className="text-sm text-gray-600">Issued</span>
                </div>
                <div className="flex items-center gap-1 pl-2">
                  <Image
                    src={CancelIcon}
                    alt={"cancel"}
                    width={16}
                    height={16}
                  />
                  <span className="text-sm text-gray-800">
                    {certificate?.failedRecipientCount}
                  </span>
                  <span className="text-sm text-gray-600">Cancelled</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AssignPage;
