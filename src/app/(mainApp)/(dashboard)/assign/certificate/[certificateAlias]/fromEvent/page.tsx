import React from "react";
import FromEvent from "./_components/FromEvent";

export const generateMetadata = async () => {
  return {
    title: `Assign Credentials - From Event`,
    description: `Import recipients from event`,
  };
};

const page = ({ params }: { params: { certificateAlias: string } }) => {
  return <FromEvent certificateAlias={params.certificateAlias} />;
};

export default page;
