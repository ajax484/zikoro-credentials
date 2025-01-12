"use client";
import React from "react";
import AppointmentLoginForm from "@/components/login/AppointmentLoginForm";
import Banner from "@/public/appointments/signupBanner.png";
import Image from "next/image";

const AppointmentLoginPage = () => {
  return (
    <div className=" flex items-center w-full h-screen ">
      <div className="lg:w-[50%] xl:w-[864px] 2xl:w-[60%] hidden lg:block">
        <Image
          src={Banner}
          alt="banner"
          width={864}
          className="w-full h-screen"
        />
      </div>
      <div className="w-full lg:w-[50%] xl:w-[calc(100%-864px)] 2xl:w-[40%]">
        <AppointmentLoginForm />
      </div>
    </div>
  );
};

export default AppointmentLoginPage;
