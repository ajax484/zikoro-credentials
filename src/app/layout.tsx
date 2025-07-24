import type { Metadata } from "next";
import { montserrat } from "../utils/fonts";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "@/components/ui/toaster";
import MainLayout from "@/components/layout/Main.layout";
import { fabric } from "fabric";

fabric.Object.prototype.toObject = (function (toObject) {
  return function (...args) {
    return {
      ...toObject.call(this, ...args),
      objectId: this.objectId,
      options: this.options,
    };
  };
})(fabric.Object.prototype.toObject);

declare module "fabric" {
  namespace fabric {
    interface Object {
      objectId?: string;
      options: Record<string, any>;
    }
  }
}

export const metadata: Metadata = {
  title: "Zikoro - Credentials",
  description:
    "Secure and Verifiable Digital Credentials for Achievements. Create, manage and share digital certificates and badges in 5 minutes",

  openGraph: {
    type: "website",
    url: "/logo.png",
    title: "Zikoro - Credentials",
    description:
      "Secure and Verifiable Digital Credentials for Achievements. Create, manage and share digital certificates and badges in 5 minutes",
    images: [
      {
        url: "/zikoro-og.jpeg",
        width: 115,
        height: 40,
        alt: "Zikoro - Credentials",
      },
    ],
  },

  // Additional SEO fields (optional)
  keywords:
    "Digital certificates, badges, verifiable credentials, skill recognition, secure certificates, Blockchain credentials, education certificates, digital learning badges, skills validation, employee recognition, training badges, corporate certificates, professional achievements, trust badges, validated achievements, shareable  badges, shareable certificates",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zikoro",
    url: "https://www.zikoro.com/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.zikoro.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
      </head>

      <body className={`${montserrat.className} antialiased`}>
        <ToastContainer />
        <Toaster />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
