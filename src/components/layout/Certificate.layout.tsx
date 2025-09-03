"use client";
import { useFetchCertificate } from "@/queries/certificates.queries";
import useOrganizationStore from "@/store/globalOrganizationStore";
import React from "react";

const CertificateLayout = ({
  children,
  certificateAlias,
}: {
  children: React.ReactNode;
  certificateAlias: string;
}) => {
  const { organization } = useOrganizationStore();
  const { data: certificate, isFetching: isFetchingCertificate } =
    useFetchCertificate(organization?.organizationAlias!, certificateAlias);

  if (isFetchingCertificate) {
    return <div>Loading...</div>;
  }

  console.log(certificate);

  return (
    <section>
      <h1 className="text-2xl font-semibold text-zikoroBlack mb-8 capitalize">
        {certificate?.name}
      </h1>
      {children}
    </section>
  );
};

export default CertificateLayout;
