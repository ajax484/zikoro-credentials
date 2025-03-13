import { Metadata } from "next";
import React from "react";
import Integrations from "./_components/Integrations";

export const metadata: Metadata = {
  title: "Credentials - Integrations",
};

const page = () => {
  return <Integrations />;
};

export default page;
