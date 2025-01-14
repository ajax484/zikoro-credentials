import Onboarding from "@/components/onboarding/Onboarding";
import Image from "next/image";
import React from "react";
import sBanner from "@/public/appointments/signupBannerS.png";
import Banner from "@/public/appointments/signupBanner.png";

type SearchParamsType = {
  email: string;
  createdAt: string;
};

const OnboardingPage = ({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) => {
  return (
    <div>
      {/* large screen */}
      <div className="bg-[#f9faff] hidden lg:flex items-center">
        <div className="w-[50%] hidden lg:flex items-center bg-gradient-to-tr from-concert-gradient-start to-concert-gradient-end">
          <Image
            src={Banner}
            alt="banner"
            width={760}
            className=" mx-auto w-fit h-screen bg-contain"
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

export default OnboardingPage;
