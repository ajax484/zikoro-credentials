import { Metadata } from "next";
import React from "react";
import ConnectIntegrations from "./_components/ConnectIntegrations";

export const metadata: Metadata = {
  title: "Credentials - Connect Integrations",
};

const page = ({
  searchParams: { integrationAlias },
}: {
  searchParams: { integrationAlias: string };
}) => {
  return <ConnectIntegrations integrationAlias={integrationAlias} />;
};

export default page;
