import React from "react";
import EditCredentialsPage from "./EditCredentialsPage";

export const metadata = {
  title: "Credentials - Create",
  description: "Create Credentials",
};

const page = ({
  params,
  searchParams,
}: {
  params: { alias: string };
  searchParams: {
    workspaceId: string;
    workspaceAlias: string;
    eventAlias: string;
  type: "certificate" | "badge";
  };
}) => {
  console.log(params);
  return (
    <EditCredentialsPage
      alias={params.alias}
      workspaceId={searchParams.workspaceId}
      eventAlias={searchParams.eventAlias}
      type={searchParams.type}
      workspaceAlias={searchParams.workspaceAlias}
    />
  );
};

export default page;
