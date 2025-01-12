import React from "react";
import AppointmentSignupForm from "@/components/signup/AppointmentSignupForm";
import Banner from "@/public/appointments/signupBanner.png";
import Image from "next/image";

const AppointmentSignupPage = () => {
  return (
    <div className="flex items-center w-full h-screen ">
      <div className="lg:w-[50%] xl:w-[864px] 2xl:w-[60%] hidden lg:block">
        <Image
          src={Banner}
          alt="banner"
          width={864}
          className="w-full h-screen"
        />
      </div>
      <div className="w-full lg:w-[50%] xl:w-[calc(100%-864px)] 2xl:w-[40%]">
        <AppointmentSignupForm />
      </div>
    </div>
  );
};

export default AppointmentSignupPage;
