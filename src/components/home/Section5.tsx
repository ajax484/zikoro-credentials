"use client";
import { useRouter } from "next/navigation";

export default function Section5() {
  const router = useRouter();
  return (
    <div className="">
      <div className="mt-[80px] flex justify-center items-center bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end max-w-full  2xl:max-w-[1128px] mx-auto">
        {/* header text */}
        <div className="py-[100px] lg:py-[141px]">
          <p className="text-center font-semibold text-[32px] text-white ">
            Start Recognizing <br className="block md:hidden" /> Achievements{" "}
            <br className="block md:hidden" /> Today{" "}
          </p>
          <p className=" mt-[14px] text-center font-medium text-xl text-white ">
            Join organizations creating credentials that inspire trust and
            recognition.{" "}
          </p>

          <div className="flex justify-center">
            <button
              className="mt-8 font-semibold rounded-[10px] py-2 px-4 text-[14px] text-medium text-indigo-600 bg-white"
              onClick={() => router.push("/signup")}
            >
              Create My First Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
