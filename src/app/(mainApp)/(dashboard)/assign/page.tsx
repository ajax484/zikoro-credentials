import { Metadata } from "next";
import React from "react";
import AssignPage from "./_components/AssignPage";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: `Credentials - Assign`,
    description: `Assign credentials on Zikoro`,
  };
};

const page = ({
  searchParams,
}: {
  searchParams: { certificateAlias: string };
}) => {
  return <AssignPage certificateAlias={searchParams.certificateAlias} />;
};

export default page;
