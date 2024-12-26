"use client";
import React, { useState } from "react";
import RecipientsPage from "./Recipients";
import { useGetData } from "@/hooks/services/request";
import { TCertificate } from "@/types/certificates";
import SendEmail from "./SendEmail";

const IssuePage = ({ alias }: { alias: string }) => {
  const [page, setPage] = useState<number>(0);
  const [recipients, setRecipients] = useState([]);
  const { data: certificate, isLoading } = useGetData<TCertificate>(
    `/certificates/${alias}`,
    true
  );

  const updatePage = (page: number) => {
    setPage(page);
  };

  if (isLoading) return <div>Loading...</div>;

  if (page === 0) {
    return <RecipientsPage certificate={certificate} updatePage={updatePage} />;
  }

  if (page === 1) {
    return <SendEmail certificate={certificate} updatePage={updatePage} />;
  }
};

export default IssuePage;
