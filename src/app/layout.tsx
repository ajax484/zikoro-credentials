import type { Metadata } from "next";
import { montserrat } from "../utils/fonts";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Zikoro - Seamless Appointment Scheduling & Booking Platform",
  description:
    "Zikoro is your trusted platform for effortless appointment scheduling and booking. We streamline the process for event organizers, tutors, and clients, enabling easy management and coordination of appointments and events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className}  antialiased`}>
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
