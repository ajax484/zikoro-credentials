"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "styled-icons/bootstrap";
import {
  NavModalIcon,
  NavModalIcon2,
  ThreeLineCircle,
  XCircle,
} from "@/constants/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import logo from "@/public/logo.png";

const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewShowing, setIsPreviewShowing] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const topSectionHeight = 100; // Adjust this to define the "top section" height
      if (window.scrollY > topSectionHeight) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Trigger handleScroll on scroll and when the browser regains focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleScroll(); // Re-check scroll position
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Initial check on mount
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="py-6 px-3 md:px-6 relative ">
      <div
        className={`flex items-center lg:max-w-[980px] xl:max-w-[1300px] py-3 px-3 md:px-6 lg:px-[36px] rounded-[64px] justify-between mx-auto ${
          isScrolled ? "bg-white" : "bg-transparent"
        }`}
      >
        <Image
          src={logo}
          width={115}
          height={40}
          alt=""
          className="cursor-pointer"
          onClick={() => router.push("/")}
        />

        <div className="gap-x-8 hidden lg:flex ">
          <p
            className="text-base font-medium cursor-pointer"
            onClick={() => router.push("credentials/verify/certificate")}
          >
            Verify
          </p>
          <p
            className="text-base font-medium cursor-pointer flex gap-2 items-center"
            onClick={() => setIsPreviewShowing(!isPreviewShowing)}
          >
            <span>Other Products</span> <ChevronDown size={20} />
          </p>

          <p
            onClick={() => router.push("/contact")}
            className="text-base font-medium cursor-pointer"
          >
            Contact us
          </p>
        </div>

        <div className=" border-[1px] border-gray-200 rounded-[51px] hidden lg:flex gap-x-4 p-3 ">
          <SignupBtn />
          <SigninBtn />
        </div>

        <div className="lg:hidden">
          <button className="text-black" onClick={toggleMenu}>
            {isOpen ? <XCircle /> : <ThreeLineCircle />}
          </button>
        </div>
      </div>

      {/* preview modal */}
      {isPreviewShowing && (
        <div className="absolute bg-white  hidden lg:flex flex-col mt-3 gap-y-6 p-3 left-1/2 transform -translate-x-1/2  rounded-[10px] ">
          {/* 1st div */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Events
              </p>
              <p className="text-[12px] font-medium text-[#31353B] w-[282px]">
                Create event tickets, check-in attendees, send RSVPs and more.{" "}
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() => router.push("https://www.zikoro.com")}
            >
              <NavModalIcon />
            </div>
          </div>

          {/* 2nd app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Engagement
              </p>
              <p className="text-[12px] font-medium text-[#31353B] w-[282px]">
                Drive interaction with engaging polls, quizzes,and live Q&A{" "}
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() => router.push("https://engagements.zikoro.com/")}
            >
              <NavModalIcon />
            </div>
          </div>

          {/* 3rd app */}
          <div className="w-full flex items-center gap-x-4">
            {/* left */}
            <div>
              <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                Zikoro Bookings
              </p>
              <p className="text-[12px] font-medium text-[#31353B]  w-[282px]">
                Simplify appointment booking and scheduling for seamless
                coordination.
              </p>
            </div>

            {/* right */}
            <div
              className="cursor-pointer "
              onClick={() => router.push("https://bookings.zikoro.com/")}
            >
              <NavModalIcon />
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="bg-violet-100 flex-col absolute p-[30px] mt-3 w-full max-w-[92%] lg:hidden rounded-[8px] z-10">
          <ul className="">
            <li
              className="mt-5 font-medium"
              onClick={() => router.push("credentials/verify/certificate")}
            >
              Verify{" "}
            </li>
            <li
              className="font-medium mt-5"
              onClick={() => setIsPreviewShowing(!isPreviewShowing)}
            >
              Other Products <ChevronDown size={20} />{" "}
              {isPreviewShowing && (
                <div className="bg-white flex flex-col mt-3 gap-y-6 p-3 lg:hidden rounded-[10px] ">
                  {/* 1st div */}
                  <div className="w-full flex items-center gap-x-4">
                    {/* left */}
                    <div>
                      <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                        Zikoro Events
                      </p>
                      <p className="text-[11px] font-medium text-[#31353B] w-[232px]">
                        Create event tickets, check-in attendees, send RSVPs and
                        more.{" "}
                      </p>
                    </div>

                    {/* right */}
                    <div
                      className="cursor-pointer"
                      onClick={() => router.push("https://www.zikoro.com")}
                    >
                      <NavModalIcon2 />
                    </div>
                  </div>

                  {/* 2nd app */}
                  <div className="w-full flex items-center gap-x-4">
                    {/* left */}
                    <div>
                      <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                        Zikoro Engagement
                      </p>
                      <p className="text-[11px] font-medium text-[#31353B] w-[232px]">
                        Drive interaction with engaging polls, quizzes,and live
                        Q&A{" "}
                      </p>
                    </div>

                    {/* right */}
                    <div
                      className="cursor-pointer "
                      onClick={() =>
                        router.push("https://engagements.zikoro.com/")
                      }
                    >
                      <NavModalIcon2 />
                    </div>
                  </div>

                  {/* 3rd app */}
                  <div className="w-full flex items-center gap-x-4">
                    {/* left */}
                    <div>
                      <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                        Zikoro Bookings
                      </p>
                      <p className="text-[11px] font-medium text-[#31353B]  w-[232px]">
                        Simplify appointment booking and scheduling for seamless
                        coordination.
                      </p>
                    </div>

                    {/* right */}
                    <div
                      className="cursor-pointer "
                      onClick={() =>
                        router.push("https://bookings.zikoro.com/")
                      }
                    >
                      <NavModalIcon2 />
                    </div>
                  </div>
                </div>
              )}
            </li>
            <li
              className="mt-5 font-medium "
              onClick={() => router.push("/contact")}
            >
              Contact Us{" "}
            </li>
          </ul>

          <div className=" border-[1px] border-gray-300 rounded-[51px] flex gap-x-4 p-3 mt-[72px] items-center w-fit mx-auto ">
            <SignupBtn />
            <SigninBtn />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;

const SignupBtn = () => {
  return (
    <Link
      href={"/signup"}
      className="text-base px-[20px] py-[10px] text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end rounded-[28px]"
    >
      Sign Up
    </Link>
  );
};
const SigninBtn = () => {
  return (
    <Link
      href={"/login"}
      className="text-base px-[20px] py-[10px] text-indigo-700 bg-transparent border border-indigo-800 rounded-[28px]"
    >
      Login
    </Link>
  );
};
