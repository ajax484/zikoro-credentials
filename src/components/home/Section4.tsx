"use client";
import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import img1 from "@/public/slider1.png";
import img2 from "@/public/slider2.png";
import img3 from "@/public/slider3.png";
import img4 from "@/public/slider4.png";
import img5 from "@/public/slider5.png";
import img6 from "@/public/slider6.png";

import { Pagination, Navigation, Autoplay } from "swiper/modules";
import Image from "next/image";

export default function Section2() {
  return (
    <div>
      <div className=" mt-[80px] lg:mt-[100px] max-w-full lg:max-w-[1128px] mx-auto">
        <p className="text-center text-2xl lg:text-[32px] font-semibold mb-3">
          Who Benefits from Our Platform?
        </p>
        <p className=" text-[#555555] text-center text-base lg:text-xl font-medium mb-8 lg:mb-[52px]">
          Designed to meet the needs of a diverse range of organizations.
        </p>

        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          //   navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="mySwiper "
        >
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3 mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">
                    Educational Institutions
                  </p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Award diplomas, course completions,{" "}
                    <br className="hidden lg:block" /> and participation
                    certificates. sessions.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={img1}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Corporate Training</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Certify skill acquisitions and professional{" "}
                    <br className="hidden lg:block" /> development.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={img2}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">
                    Events and Conferences
                  </p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Recognize attendance, speaking
                    <br className="hidden lg:block" /> engagements, and
                    contributions.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={img3}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Online Courses</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Offer verified credentials to showcase learner
                    <br className="hidden lg:block" /> achievements.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={img4}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">Religious Bodies</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Celebrate milestones like ordinations, training
                    <br className="hidden lg:block" /> completions, or community
                    service
                    <br className="hidden lg:block" /> recognitions.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={img5}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            {" "}
            <div className="flex flex-col lg:flex-row gap-y-6 bg-white p-3  mb-8">
              <div className="flex justify-center items-center w-full lg:w-[50%]">
                <div>
                  <p className="font-semibold text-2xl">NGOs</p>
                  <p className="font-medium text-[#555555] mt-3 ">
                    Acknowledge volunteer efforts, partnerships,
                    <br className="hidden lg:block" /> and project completions.
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-[50%]">
                <Image
                  alt=""
                  src={img6}
                  width={600}
                  height={374}
                  className="w-full lg:w-[600px] h-full"
                />
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}
