import React from "react";
import FromDirectory from "./_components/FromDirectory";

export const generateMetadata = async () => {
  return {
    title: `Assign Credentials - From Directory`,
    description: `Import recipients from Directory`,
  };
};

const page = ({ params }: { params: { certificateAlias: string } }) => {
  return <FromDirectory certificateAlias={params.certificateAlias} />;
};

export default page;
