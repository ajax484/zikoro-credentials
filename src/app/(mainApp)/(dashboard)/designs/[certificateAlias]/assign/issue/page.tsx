import { Metadata } from "next";
import React from "react";
import IssuePage from "./_components/IssuePage";

export const generateMetadata = async ({
  params,
}: {
  params: { certificateAlias: string };
}): Promise<Metadata> => {
  const { certificateAlias } = params;

  return {
    title: `Issue Certificate - ${certificateAlias}`,
    description: `Issue Certificate - ${certificateAlias}`,
  };
};

const page = ({
  params,
  searchParams,
}: {
  params: { certificateAlias: string };
  searchParams: { from: string };
}) => {
  return (
    <IssuePage
      certificateAlias={params.certificateAlias}
      from={searchParams.from}
    />
  );
};

export default page;
