import { Metadata } from "next";
import React from "react";
import CertificateInfoPage from "./_components/CertificateInfoPage";

export const generateMetadata = async ({
  params,
}: {
  params: { alias: string };
}): Promise<Metadata> => {
  const { alias } = params;

  return {
    title: `Certificate - ${alias}`,
    description: `Certificate - ${alias}`,
  };
};

const page = ({ params }: { params: { alias: string } }) => {
  return <CertificateInfoPage alias={params.alias} />;
};

export default page;
