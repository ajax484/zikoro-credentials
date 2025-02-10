import { Metadata } from "next";
import React from "react";
import RecipientsPage from "./_components/CertificateInfoPage";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: `Credentials - Assign`,
    description: `Assign credentials on Zikoro`,
  };
};

const page = ({
  searchParams,
}: {
  searchParams: { certificateAlias: string; searchTerm: string };
}) => {
  return (
    <RecipientsPage
      certificateAlias={searchParams.certificateAlias}
      searchTerm={searchParams.searchTerm}
    />
  );
};

export default page;
