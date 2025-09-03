import React from "react";
import DirectoryRecipient from "./DirectoryRecipient";

const page = ({
  params: { directoryAlias, recipientAlias },
}: {
  params: {
    directoryAlias: string;
    recipientAlias: string;
  };
}) => {
  return (
    <DirectoryRecipient
      directoryAlias={directoryAlias}
      recipientAlias={recipientAlias}
    />
  );
};

export default page;
