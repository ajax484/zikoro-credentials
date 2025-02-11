import React from "react";
import TemplatePage from "./_components/TemplatePage";

const page = (
  { params }: { params: { templateAlias: string } },
) => {
  return <TemplatePage
    templateAlias={params.templateAlias}
  />;
};

export default page;
