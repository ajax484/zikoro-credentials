"use client";
import React from "react";
import Sidebar from "../sidebar/Sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen relative bg-[#f7f8ff] flex w-full">
      <aside className="hidden md:block min-h-full border-r group bg-white fixed z-[50]">
        <Sidebar />
      </aside>
      <section className="py-16 px-12 flex-1 ml-[100px] 3xl:ml-auto max-w-[1400px] mx-auto">
        {children}
      </section>
    </main>
  );
};

export default DashboardLayout;
