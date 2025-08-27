import React from "react";
import AssignExcelPage from "./_components/AssignExcelPage";

export const generateMetadata = async () => {
  return {
    title: `Assign Certificate - Excel`,
    description: `Assign Certificate - Excel`,
  };
};

const page = ({ params }: { params: { certificateAlias: string } }) => {
  return <AssignExcelPage certificateAlias={params.certificateAlias} />;
};

export default page;
