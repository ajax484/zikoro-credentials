import React from "react";
import DashboardLayout from "@/components/layout/Dashboard.layout";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default layout;