"use client";
import React from "react";
import AppointmentLoginForm from "@/components/login/AppointmentLoginForm";
import Banner from "@/public/appointments/signupBanner.png";
import Image from "next/image";

const AppointmentLoginPage = () => {
  return (
    <div className=" flex items-center w-full h-screen ">
      <div className="w-[50%] hidden lg:block">
        <Image
          src={Banner}
          alt="banner"
          width={864}
          className="w-full h-screen"
        />
      </div>
      <div className="w-full lg:w-[50%]">
        <AppointmentLoginForm />
      </div>
    </div>
  );
};

export default AppointmentLoginPage;
