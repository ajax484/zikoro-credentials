import { Metadata } from "next";
import React from "react";
import Designs from "./_components/Designs";

export const metadata: Metadata = {
  title: "Credentials - Designs",
};

const page = () => {
  return <Designs />;
};

export default page;
