import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import Section1 from "@/components/home/Section1";
import Section2 from "@/components/home/Section2";
import Section3 from "@/components/home/Section3";
import Section4 from "@/components/home/Section4";
import Section5 from "@/components/home/Section5";
import Head from "next/head";

export default function Home() {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Events",
        item: "https://www.zikoro.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Bookings",
        item: "https://bookings.zikoro.com/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Engagements",
        item: "https://engagements.zikoro.com/",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Credentials",
        item: "https://credentials.zikoro.com/",
      },
      {
        "@type": "ListItem",
        position: 5,
        name: "Pricing",
        item: "https://www.zikoro.com/pricing",
      },
    ],
  };
  return (
    <>
      {" "}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />
      </Head>
      <div className="bg-[#f7f7f7]">
        <div className="sticky top-4 z-50">
          <Navbar />
        </div>
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Footer />
      </div>
    </>
  );
}
