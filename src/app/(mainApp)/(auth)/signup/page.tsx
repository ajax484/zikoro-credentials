import React from "react";
import AppointmentSignupForm from "@/components/signup/AppointmentSignupForm";
import Banner from "@/public/appointments/signupBanner.png";
import Image from "next/image";

const AppointmentSignupPage = ({
  searchParams,
}: {
  searchParams: { workspaceAlias?: string };
}) => {
  return (
    <div className="flex items-center w-full h-screen ">
      <div className="w-[50%] hidden lg:flex items-center bg-gradient-to-tr from-concert-gradient-start to-concert-gradient-end">
        <Image
          src={Banner}
          alt="banner"
          width={760}
          className=" mx-auto w-fit h-screen bg-contain"
        />
      </div>
      <div className="w-full lg:w-[50%]">
        <AppointmentSignupForm workspaceAlias={searchParams?.workspaceAlias} />
      </div>
    </div>
  );
};

export default AppointmentSignupPage;
