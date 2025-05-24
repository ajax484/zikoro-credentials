"use client";
import {
  CredentialSec1,
  CredentialSec2,
  CredentialSec3,
  StraightLineIcon,
  StraightLineIcon2,
} from "@/constants";
import { useRouter } from "next/navigation";

export default function Section3() {
  const router = useRouter();

  return (
    <div className="mt-[80px] flex justify-center text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end max-w-full 2xl:max-w-[1128px] mx-auto">
      <div className=" py-[42px] px-[18px]">
        <p className="text-[32px] font-semibold text-center">How it works</p>

        {/* mid section */}
        <div className="flex flex-col md:flex-row mt-[34px] gap-10 relative">
          {/* lg screens */}
          <div className="hidden lg:inline xl:hidden 2xl:inline absolute top-[15%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-5 ">
            <StraightLineIcon2 />
          </div>

          {/* xl screens */}
          <div className="hidden xl:inline 2xl:hidden absolute top-[15%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-5 ">
            <StraightLineIcon />
          </div>
          {/* 1st div */}
          <div className="text-center w-full lg:w-[33%] z-20">
            <div className="flex justify-center">
              <CredentialSec2 />
            </div>
            <p className="text-xl mt-3 font-semibold ">
              Design Your Credentials
            </p>
            <p className="text-base mt-3 font-medium ">
              Choose from our premium templates,{" "}
              <br className="hidden lg:block" /> create or import your own
              custom <br className="hidden lg:block" /> design that matches your
              brand.
            </p>
          </div>

          {/* 2nd div */}
          <div className="text-center w-full lg:w-[33%] z-20">
            <div className="flex justify-center">
              <CredentialSec1 />
            </div>
            <p className="text-xl mt-3 font-semibold ">Issue Certificates</p>
            <p className="text-base mt-3 font-medium ">
              Import your recipients’ data and assign certificates to them with
              a few clicks.
            </p>
          </div>

          {/* 3rd div */}
          <div className="text-center w-full lg:w-[33%] z-20">
            <div className="flex justify-center">
              <CredentialSec3 />
            </div>
            <p className="text-xl mt-3 font-semibold ">Verify Instantly</p>
            <p className="text-base mt-3 font-medium ">
              Recipients are instantly notified.{" "}
              <br className="hidden lg:block" /> Credentials can be shared and
              verified <br className="hidden lg:block" /> anytime, anywhere.
            </p>
          </div>
        </div>
        {/* button */}
        <div>
          <div className="flex justify-center mt-[34px]">
            <button
              className=" font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-indigo-600 bg-white"
              onClick={() => router.push("/signup")}
            >
              Start creating now
            </button>
          </div>

          <p className="text-center text-[12px] text-[#55555] mt-2">
            Its super easy!
          </p>
        </div>
      </div>
    </div>
  );
}
