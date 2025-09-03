import CertificateLayout from "@/components/layout/Certificate.layout";
import React from "react";

const layout = ({
  children,
  params: { certificateAlias },
}: {
  children: React.ReactNode;
  params: { certificateAlias: string };
}) => {
  return (
    <CertificateLayout certificateAlias={certificateAlias}>
      {children}
    </CertificateLayout>
  );
};

export default layout;
