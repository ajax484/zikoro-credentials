import React from "react";
import Directory from "./_components/Directory";

const page = ({ params }: { params: { directoryAlias: string } }) => {
  return <Directory directoryAlias={params.directoryAlias} />;
};

export default page;
