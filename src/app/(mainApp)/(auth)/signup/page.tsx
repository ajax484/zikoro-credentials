import React from "react";
import AppointmentSignupForm from "@/components/signup/AppointmentSignupForm";
import Banner from "@/public/appointments/signupBanner.png";
import Image from "next/image";

const AppointmentSignupPage = () => {
  return (
    <div className="flex items-center w-full h-screen ">
      <div className="lg:w-[50%] hidden lg:inline">
        <Image
          src={Banner}
          alt="banner"
          width={864}
          className="w-fit h-screen bg-contain"
        />
      </div>
      <div className="w-full lg:w-[50%]">
        <AppointmentSignupForm />
      </div>
    </div>
  );
};

export default AppointmentSignupPage;
