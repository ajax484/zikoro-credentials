"use client";
import React, { useState } from "react";
import RecipientsPage from "./Recipients";
import { useGetData } from "@/hooks/services/request";
import { CertificateRecipient, TCertificate } from "@/types/certificates";
import SendEmail from "./SendEmail";

const IssuePage = ({ alias }: { alias: string }) => {
  const [page, setPage] = useState<number>(0);
  const [recipients, setRecipients] = useState<CertificateRecipient[]>([]);
  const { data: certificate, isLoading } = useGetData<TCertificate>(
    `/certificates/${alias}`,
    true
  );

  const updatePage = (page: number) => {
    setPage(page);
  };

  if (isLoading) return <div>Loading...</div>;

  const updateRecipients = (recipients: CertificateRecipient[]) => {
    setRecipients(recipients);
  };

  if (page === 0) {
    return (
      <RecipientsPage
        certificate={certificate}
        updatePage={updatePage}
        recipients={recipients}
        updateRecipients={updateRecipients}
      />
    );
  }

  if (page === 1) {
    return (
      <SendEmail
        certificate={certificate}
        updatePage={updatePage}
        recipients={recipients}
      />
    );
  }
};

export default IssuePage;
