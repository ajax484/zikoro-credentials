import React from "react";
import AdminView from "./_components/AdminView";

export const metadata = {
  title: "Zikoro Certificate - Admin View",
  description: "Admin View for Zikoro Certificate",
};

const page = ({
  params: { certificateId },
}: {
  params: { certificateId: string };
}) => {
  return <AdminView certificateId={certificateId} />;
};

export default page;
