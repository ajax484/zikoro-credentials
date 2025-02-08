"use client";
import React from "react";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import logo from "@/public/logo.png";
import { useRouter } from "next/navigation";

const layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  return (
    <>
      <header className="py-2.5 px-4 bg-white fixed w-screen z-[100]">
        <Image
          src={logo}
          width={115}
          height={40}
          alt=""
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />
      </header>
      <main className="bg-baseBody pt-12">{children}</main>
      <footer className="border-t border-t-basePrimary py-4 flex justify-between px-4 md:px-8 items-center">
        <span>
          <span className="hidden md:inline">Copyright</span> ©{" "}
          {new Date().getFullYear()} - Zikoro{" "}
          <span className="hidden md:inline">- an OrthoEx</span>
        </span>
      </footer>
      <Toaster />
    </>
  );
};

export default layout;
