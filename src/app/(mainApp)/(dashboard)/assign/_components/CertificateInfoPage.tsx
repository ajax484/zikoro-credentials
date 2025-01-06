"use client";
import { useGetData, useGetPaginatedData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import React, { useState } from "react";
import Issue from "./Issue";
import useUserStore from "@/store/globalUserStore";
import useOrganizationStore from "@/store/globalOrganizationStore";

const RecipientsPage = ({ certificateAlias }: { certificateAlias: string }) => {
  const { organization, setOrganization } = useOrganizationStore();

  const { data: certificates, isLoading } = useGetData<TCertificate[]>(
    `/certificates?workspaceAlias=${organization?.organizationAlias}`,

    []
  );

  const searchParams = new URLSearchParams({
    workspaceAlias: organization?.organizationAlias || "",
  });

  const {
    data: certificateIssuees,
    isLoading: certificateIssueesIsLoading,
    total,
    totalPages,
    pagination,
    setPagination,
  } = useGetPaginatedData<CertificateRecipient & { certificate: TCertificate }>(
    `/certificates/recipients`,
    searchParams
  );

  const updatePage = (page: number) => {
    setPagination({ page, limit: 10 });
  };

  const updateLimit = (limit: number) => {
    setPagination({ page: 1, limit });
  };

  console.log(certificateIssuees);

  return (
    <section>
      <Issue
        certificateAlias={certificateAlias}
        certificates={certificates}
        certificateIssuees={certificateIssuees}
        updatePage={updatePage}
        updateLimit={updateLimit}
        total={total}
        totalPages={totalPages}
        pagination={pagination}
        isLoading={certificateIssueesIsLoading}
      />
    </section>
  );
};

export default RecipientsPage;
