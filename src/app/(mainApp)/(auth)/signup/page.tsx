import React from "react";
import AppointmentSignupForm from "@/components/signup/AppointmentSignupForm";
import bgImg from "@/public/bgImg.webp";

const AppointmentSignupPage = () => {
  return (
    <div
      className="flex items-center lg:items-start w-full h-screen justify-center gap-x-[162px] lg:h-screen xl:h-screen py-1 px-5 lg:py-[50px] lg:px-[50px] xl:px-[91px] xl:py-[50px] max-w-full"
      style={{
        backgroundImage: `url(${bgImg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mt-[34px] hidden lg:block">
        <p className=" bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text text-[32px] font-extrabold leading-none">
          Get started with{" "}
          <span className="leading-none text-[40px] inline lg:block">
            Zikoro Bookings
          </span>{" "}
        </p>
        <p className="text-base p-2 text-white bg-blue-500 font-medium opacity-50 mt-[10px] rounded-[8px]">
          Simplify Scheduling for a Seamless Client Experience.
        </p>
      </div>
      <div>
        <AppointmentSignupForm />
      </div>
    </div>
  );
};

export default AppointmentSignupPage;
