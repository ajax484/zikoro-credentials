"use client";
import { useGetData, useGetPaginatedData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import React, { useState } from "react";
import Issue from "./Issue";
import useOrganizationStore from "@/store/globalOrganizationStore";
import {
  useFetchCertificateRecipients,
  useFetchCertificates,
} from "@/queries/certificates.queries";

const RecipientsPage = ({ certificateAlias }: { certificateAlias: string }) => {
  const { organization, setOrganization } = useOrganizationStore();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<{ page: number; limit: number }>(
    { page: 1, limit: 10 }
  );

  const { data: certificates, isFetching: certificatesIsLoading } =
    useFetchCertificates(organization?.organizationAlias!);

  const searchParams = new URLSearchParams({
    workspaceAlias: organization?.organizationAlias || "",
  });

  const {
    data,
    isFetching: certificateIssueesIsLoading,
    status,
    error,
    refetch,
  } = useFetchCertificateRecipients(
    organization?.organizationAlias!,
    pagination,
    searchTerm
  );

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  console.log(data);

  return (
    <section>
      <Issue
        certificateAlias={certificateAlias}
        certificates={certificates}
        certificateIssuees={data?.data}
        updatePage={updatePage}
        updateLimit={updateLimit}
        total={data?.total}
        totalPages={data?.totalPages}
        pagination={pagination}
        isLoading={certificateIssueesIsLoading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </section>
  );
};

export default RecipientsPage;
