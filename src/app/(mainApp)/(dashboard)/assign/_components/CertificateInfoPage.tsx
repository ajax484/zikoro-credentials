"use client";
import { useGetData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import React, { useState } from "react";
import Issue from "./Issue";
import useUserStore from "@/store/globalUserStore";

const RecipientsPage = () => {
  const { user } = useUserStore();

  const { data: certificates, isLoading } = useGetData<TCertificate[]>(
    `/certificates?userId=${user?.id}`,
    true,
    []
  );

  const [page, setPage] = useState<number>(1);

  const updatePage = (page: number) => {
    setPage(page);
  };

  const { data: certificateIssuees, isLoading: certificateIssueesIsLoading } =
    useGetData<CertificateRecipient[]>(
      `/certificates/recipients?page=${page}`,
      true,
      []
    );

  console.log(certificateIssuees);

  return (
    <section>
      {certificateIssueesIsLoading ? (
        <div>Loading...</div>
      ) : (
        <Issue
          certificates={certificates}
          certificateIssuees={certificateIssuees}
          updatePage={updatePage}
          page={page}
        />
      )}
    </section>
  );
};

export default RecipientsPage;