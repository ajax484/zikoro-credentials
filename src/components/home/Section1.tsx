"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NewPlayIcon } from "@/constants";
import { useState } from "react";
import banner from "@/public/banner.png"

export default function Section1() {
  const router = useRouter();
  const [showIcon, setShowIcon] = useState(true);

  const handleClick = () => {
    setShowIcon(false);
  };

  const handleVideoEnd = () => {
    setShowIcon(true);
  };
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
              <button className="mt-6 font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end" onClick={() => router.push('/signup')}>
                Get Started For Free
              </button>
              <p className="text-center text-[12px] text-[#55555] mt-2">
                No credit card required
              </p>
            </div>
          </div>

          {/* big white board */}
          <div className="relative mt-6">
            <div className="absolute bg-[#001FCC] blur-[70px] rounded-full h-[150px] w-[80px] -bottom-[20px] -left-[20px] opacity-80 "></div>

            <div className="absolute bg-[#9D00FF] blur-[70px] rounded-full h-[150px] w-[80px] -top-[20px] -right-[5px] opacity-80 "></div>
            {showIcon ? (
              <div className="relative z-5  rounded-[10px] shadow-md p-10 w-full lg:w-[970px] xl:w-[1128px] h-[205px] md:h-[405px]  lg:h-[651px]" style={{
                backgroundImage: `url(${banner.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" onClick={handleClick}>
                  <NewPlayIcon />
                </div>
              </div>
            ) : (
              <div className="w-full lg:w-[970px] xl:w-[1128px] h-[205px] lg:h-[651px] rounded-[10px] shadow-md">
                <video
                  className="max-w-full max-h-full rounded-[10px]"
                  autoPlay
                  controls
                  muted
                  onEnded={handleVideoEnd}
                  style={{ minWidth: "100%", minHeight: "100%" }}
                >
                  <source
                    src="https://res.cloudinary.com/zikoro/video/upload/v1736186789/ZIKORO/videos/zikoro_credentials_2_vrvxqh.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

          </div>

        </div >
      </div >
    </>
  );
}


