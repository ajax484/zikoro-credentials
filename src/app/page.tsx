import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";
import Section1 from "@/components/home/Section1";
import Section2 from "@/components/home/Section2";
import Section3 from "@/components/home/Section3";
import Section4 from "@/components/home/Section4";
import Section5 from "@/components/home/Section5";

export default function Home() {
  return (
    <div className="bg-[#f7f7f7]">
      <div className="sticky top-4 z-10">
        <Navbar />
      </div>
      <Section1 />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Footer />
    </div>
  );
}
