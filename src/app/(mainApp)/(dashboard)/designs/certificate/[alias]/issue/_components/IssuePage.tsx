"use client";
import React, { useEffect, useState } from "react";
import RecipientsPage, { RecipientType } from "./Recipients";
import { useGetData } from "@/hooks/services/request";
import { TCertificate } from "@/types/certificates";
import SendEmail from "./SendEmail";
import { useRecipientsStore } from "@/store/globalRecipientsStore";

const IssuePage = ({ alias, from }: { alias: string; from: string }) => {
  const [page, setPage] = useState<number>(0);
  const [recipients, setRecipients] = useState<RecipientType>([]);
  const { data: certificate, isLoading } = useGetData<TCertificate>(
    `/certificates/${alias}`,
    true
  );

  const { recipients: importedRecipients } = useRecipientsStore();

  useEffect(() => {
    if (from === "excel") {
      setRecipients(importedRecipients);
    }
  }, []);

  const updatePage = (page: number) => {
    setPage(page);
  };

  if (isLoading) return <div>Loading...</div>;

  const updateRecipients = (recipients: RecipientType) => {
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
