import React from "react";
import AnalyticsPage from "./_components/AnalyticsPage";

const page = ({
  searchParams,
}: {
  searchParams: { certificateAlias: string };
}) => {
  return <AnalyticsPage certificateAlias={searchParams.certificateAlias} />;
};

export default page;
