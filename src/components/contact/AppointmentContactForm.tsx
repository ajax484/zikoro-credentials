"use client";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";
import { useContactUs } from "@/hooks/services/contactUs";
import confirm from "@/public/appointments/bookingsMessage.png";
import { LocateIcon } from "lucide-react";

const AppointmentContactForm = () => {
  const [mailSent, setMailSent] = useState<boolean>(false);
  const root = "credentials";
  const { submitForm } = useContactUs();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    comments: "",
    phoneNumber: "",
    source: root,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submitForm(formData);
    toast.success("Submitted Successfully:");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      comments: "",
      phoneNumber: "",
      source: "",
    });
    setMailSent(true);
  };

  return (
    <div className="bg-white rounded-[8px] max-w-full lg:max-w-[400px]  ">
      {mailSent ? (
        <div className="flex flex-col items-center h-[50vh] justify-center">
          <Image
            src={confirm}
            width={82}
            height={82}
            alt=""
            className="w-[82px] h-[82px]"
          />
          <div className="mt-4">
            <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text text-2xl font-bold leading-none ">
              Message sent
            </p>
            <p className="text-[12px] mt-2">we will get back to you soon 🤞</p>
          </div>
        </div>
      ) : (
        <form action="" className="mt-10" onSubmit={handSubmitForm}>
          <div className="flex flex-col gap-y-3 ">
            <label htmlFor="">First Name</label>
            <input
              required
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter First Name"
              className="border-[1px] border-gray-200 px-[10px] py-4 w-full text-base rounded-[6px] outline-none"
            />
          </div>
          <div className="flex flex-col gap-y-3 mt-6 ">
            <label htmlFor="">Last Name</label>
            <input
              required
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter Last Name"
              className="border-[1px] border-gray-200 px-[10px] py-4 w-full text-base rounded-[6px] outline-none"
            />
          </div>
          <div className="flex flex-col gap-y-3 mt-6">
            <label htmlFor="">Email Address</label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter Email Address"
              className="border-[1px] border-gray-200 px-[10px] py-4 w-full text-base rounded-[6px] outline-none"
            />
          </div>
          <div className="flex flex-col gap-y-3 mt-6">
            <label htmlFor="">Phone Number</label>
            <input
              required
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter Phone Number"
              className="border-[1px] border-gray-200 px-[10px] py-4 w-full text-base rounded-[6px] outline-none"
            />
          </div>
          <div className="flex flex-col gap-y-3 mt-6">
            <label htmlFor="">Message</label>
            <textarea
              required
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              id=""
              cols={30}
              rows={10}
              className="border-[1px] border-gray-200 px-[10px] py-4 text-base rounded-[6px] h-full outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="py-4 px-3 text-base w-full rounded-[8px] font-semibold mt-10 mb-3 text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end"
          >
            Submit
          </button>

          <div className="mt-3 mb-6 gap-x-6 flex items-center ">
            <LocateIcon size={16} />
            <p className="font-normal text-[10px] lg:text-[12px] ">
              2A Musari Apena Street, Mafoluku, Lagos State, Nigeria{" "}
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default AppointmentContactForm;
