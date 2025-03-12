"use client";
import Link from "next/link";
import React from "react";

const CustomLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="bg-basePrimary text-gray-50 shadow hover:bg-basePrimary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2"
    >
      {children}
    </Link>
  );
};

export default CustomLink;
