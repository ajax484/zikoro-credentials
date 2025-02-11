import { Metadata } from "next";
import React from "react";
import EmailTemplates from "./_components/EmailTemplates";

export const metadata: Metadata = {
  title: "Credentials - Email Templates",
};

const page = () => {
  return <EmailTemplates />;
};

export default page;
