"use client"
import Image from "next/image";
import whiteScreen from "@/public/bigScreen.png";
import { useRouter } from "next/navigation";

export default function Section1() {
  const router = useRouter();
  return (
    <>
      {/* big screen */}
      <div className=" flex justify-center  w-full max-w-full 2xl:max-w-[1128px] mx-auto px-3 lg:px-0 ">
        {/* header text */}
        <div className="pt-[37px] lg:pt-[80px]">
          <p className="text-center font-bold text-3xl lg:text-4xl  ">
            Empower Achievements with <br className="hidden lg:inline" />{" "}
            Verifiable Certificates & Badges
          </p>
          <p className=" text-[#555555] text-center font-medium text-base lg:text-xl mt-3">
            Seamlessly create, manage, and share digital credentials that
            inspire trust and recognition.
          </p>

          {/* button */}
          <div className="flex justify-center">
            <div>
              <button className="mt-6 font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end" onClick={()=> router.push('/signup')}>
                Get Started For Free
              </button>
              <p className="text-center text-[12px] text-[#55555] mt-2">
                No credit card required
              </p>
            </div>
          </div>

          {/* big white board */}
          <div className="flex justify-center mt-7">
            <Image
              src={whiteScreen}
              alt=""
              height={651}
              width={1128}
              className="w-full lg:w-[970px] xl:w-[1128px] "
            />
         
          </div>
        </div>
      </div>
    </>
  );
}
