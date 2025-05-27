"use client";
import { CrossedEye } from "@/constants/icons";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLogin } from "@/hooks/services/auth";
import logoFooter from "@/public/appointments/logoFooter.png";
import { Loader } from "lucide-react";

const AppointmentLoginForm = (
  {
    redirectedFrom,
  }: {
    redirectedFrom?: string;
  }
) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { loading, logIn } = useLogin();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await logIn(formData, redirectedFrom);
  }

  return (
    <div className="bg-white md:mx-auto py-[16px] lg:py-[20px] px-3 sm:px-[42px] lg:px-[42px] rounded-[8px] w-full max-w-full sm:max-w-md md:max-w-[542px] lg:max-w-[542px] ">
      <div className="flex justify-center ">
        <Image
          src={logoFooter}
          width={115}
          height={40}
          alt=""
          className="w-[115px] h-[40px]"
        />
      </div>

      <p className="text-2xl text-indigo-600 text-center mt-5 font-semibold">
        Welcome Back
      </p>
      <p className="mt-4 font-normal text-center">
        Take Charge of Your Progress –{" "}
        <span className="block">
          {" "}
          Log In, Manage, and Issue Certificates with Ease!
        </span>
      </p>

      <form action="" className="mt-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-y-3 mt-6">
          <label htmlFor="">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email Address"
            className="border-[1px] border-gray-200 px-[10px] py-4 w-full text-base rounded-[6px] outline-none"
          />
        </div>
        <div className="flex flex-col gap-y-3 mt-6">
          <label htmlFor="">Password</label>
          <div className="flex items-center justify-around border-[1px] border-gray-200 rounded-[6px] ">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter Password"
              className="w-[90%] px-[10px] py-4 h-full text-base  outline-none"
              minLength={8}
            />
            <div onClick={() => setShowPassword(!showPassword)}>
              <CrossedEye />
            </div>
          </div>
          <p
            className="text-blue-500 text-right cursor-pointer"
            onClick={() => router.push("/forgot-password")}
          >
            Forgot password?
          </p>
        </div>

        <button
          // disabled={loading}
          type="submit"
          className="py-4 px-3 text-base w-full rounded-[8px] font-semibold mt-10 mb-6 text-white bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end"
        >
          {loading && <Loader size={22} className="animate-spin" />}
          Login
        </button>
      </form>

      {/* <div className="max-[400px]:hidden ">
        <OrIcon />
      </div>

      <button
        type="submit"
        className="py-4 px-3 flex items-center justify-center gap-x-2 text-base w-full rounded-[8px] mt-10 mb-6  border-[1px] border-gray-200"
      >
        <GoogleBlackIcon /> Sign Up with google
      </button> */}

      <p className="mt-[14px] text-center">
        Don&apos;t have an account?{" "}
        <span
          className="text-indigo-400 cursor-pointer"
          onClick={() => router.push("/signup")}
        >
          Signup
        </span>
      </p>
    </div>
  );
};

export default AppointmentLoginForm;
