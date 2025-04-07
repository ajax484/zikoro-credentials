import React, { Suspense } from "react";
import DashboardLayout from "@/components/layout/Dashboard.layout";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500" />
        </div>
      }
    >
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
};

export default layout;
