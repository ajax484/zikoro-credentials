import type { Metadata } from "next";
import { montserrat } from "../utils/fonts";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Zikoro - Credentials",
  description:
    "Secure and Verifiable Digital Credentials for Achievements. Create, manage and share digital certificates and badges in 5 minutes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        <ToastContainer />
        <Toaster />
        {children}
      </body>
    </html>
  );
}
