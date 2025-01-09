import Onboarding from "@/components/onboarding/Onboarding";
import Image from "next/image";
import React from "react";
import sBanner from "@/public/appointments/signupBannerS.png";
import Banner from "@/public/appointments/signupBanner.png";

type SearchParamsType = {
  email: string;
  createdAt: string;
};

const AppointmentSignupPage = ({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) => {
  return (
    <div>
      {/* large screen */}
      <div className="bg-[#f9faff] hidden lg:flex items-center">
        <div className="w-[50%]">
          <Image
            src={Banner}
            alt="banner"
            width={864}
            className="w-full h-fit"
          />
        </div>

        <div className="w-[50%]">
          <Onboarding searchParams={searchParams} />
        </div>
      </div>
      {/* small screen */}
      <div className="bg-[#f9faff] min-h-screen block lg:hidden">
        {/* banner */}
        <Image
          src={sBanner}
          alt="banner"
          width={375}
          height={215}
          className="w-full h-full object-cover"
        />

        {/* dynamic components */}
        <Onboarding searchParams={searchParams} />
      </div>
    </div>
  );
};

export default AppointmentSignupPage;
