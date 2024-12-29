import React from "react";
import CreateCredentialsPage from "./CreateCredentialsPage";

const page = ({
  params,
  searchParams,
}: {
  params: { alias: string };
  searchParams: {
    workspaceId: string;
    eventAlias: string;
    type: "certificate" | "badge";
  };
}) => {
  console.log(params);
  return (
    <CreateCredentialsPage
      alias={params.alias}
      workspaceId={searchParams.workspaceId}
      eventAlias={searchParams.eventAlias}
      type={searchParams.type}
    />
  );
};

export default page;
