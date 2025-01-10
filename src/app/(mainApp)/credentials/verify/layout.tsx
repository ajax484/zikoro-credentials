"use client";
import React from "react";
import Image from "next/image";
import { Toaster } from "@/components/ui/toaster";
import logo from "@/public/icons/logo.svg";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <header className="py-2.5 px-4 bg-white fixed w-screen z-[100]">
        <a href="https://zikoro.com" rel="noopener noreferrer">
          <Image src={logo} alt={"zikoro logo"} width={50} height={25}></Image>
        </a>
      </header>
      <main className="bg-baseBody">{children}</main>
      <footer className="border-t border-t-basePrimary py-4 flex justify-between px-4 md:px-8 items-center">
        <span>
          <span className="hidden md:inline">Copyright</span> © 2024 - Zikoro{" "}
          <span className="hidden md:inline">- an OrthoEx</span>
        </span>
      </footer>
      <Toaster />
    </>
  );
};

export default layout;
