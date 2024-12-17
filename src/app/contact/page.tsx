"use client";
import AppointmentContactForm from "@/components/contact/AppointmentContactForm";
import AppointmentFooter from "@/components/home/Footer";
import AppointmentNav from "@/components/home/Navbar";
import Image from "next/image";
import sImage from "@/public/appointments/contactForm.webp";

const AppointmentContactPage = () => {
  return (
    <div className="">
      <div className="sticky top-10 z-10">
        <AppointmentNav />
      </div>
      <div className="mt-[140px] flex flex-col lg:flex-row gap-x-[60px] max-w-full lg:max-w-full 2xl:max-w-[97rem] mx-auto ">
        {/* left */}
        <div className="hidden lg:block w-1/2">
          <div className=" max-w-[383px] mx-auto ">
            <p className=" bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text text-[40px] font-extrabold leading-none">
              Send Us a message
            </p>
            <p className="text-xl text-[#1F1F1F] font-normal mt-[10px]">
              - Let&apos;s talk
            </p>
          </div>

          <Image
            src={sImage}
            width={746}
            height={605}
            alt=""
            className="w-full h-[520px] xl:h-[605px]"
          />
        </div>
        {/* right */}
        <div className="w-full lg:w-1/2 px-3 lg:px-0">
          {/* Small and tablet Screens Only */}
          <div className="block lg:hidden">
            <p className=" bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text text-2xl font-extrabold text-center leading-none">
              Send Us a message
            </p>
            <p className="text-[12px]  text-[#1F1F1F] font-normal  mt-[10px] text-center ">
              Let&apos;s talk
            </p>
          </div>
          <AppointmentContactForm />
        </div>
      </div>
      <AppointmentFooter />
    </div>
  );
};

export default AppointmentContactPage;
