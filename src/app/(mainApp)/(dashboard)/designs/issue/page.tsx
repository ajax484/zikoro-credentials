import { Metadata } from "next";
import React from "react";
import IssuePage from "./_components/IssuePage";

export const generateMetadata = async ({
  params,
}: {
  params: { alias: string };
}): Promise<Metadata> => {
  const { alias } = params;

  return {
    title: `Issue Certificate - ${alias}`,
    description: `Issue Certificate - ${alias}`,
  };
};

const page = ({ params }: { params: { alias: string } }) => {
  return <IssuePage alias={params.alias} />;
};

export default page;