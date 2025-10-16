"use client";

import { loginSchema, onboardingSchema } from "@/schemas/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { postRequest } from "@/utils/api";
import useUserStore from "@/store/globalUserStore";
import { createClient } from "@/utils/supabase/client";
import { TUser } from "@/types/user";
import { nanoid } from "nanoid";
import useOrganizationStore from "@/store/globalOrganizationStore";

const supabase = createClient();

export function useRegistration() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function register(
    values: z.infer<typeof loginSchema>,
    workspaceAlias?: string
  ) {
    setLoading(true);

    try {
      const { data } = await postRequest<z.infer<typeof loginSchema>>({
        endpoint: `https://ddlepujpbqjoogkmiwfu.supabase.co/functions/v1/register`,
        payload: values,
      });

      if (data.error) {
        toast.error(data.error ?? "Unknown error");
        setLoading(false);
        return;
      }

      if (data) {
        //  saveCookie("user", data);
        toast.success("Registration Successful");
        router.push(
          `/verify-email?email=${values.email}&type=verify${
            workspaceAlias ? `&workspaceAlias=${workspaceAlias}` : ""
          }`
        );
      }
    } catch (error) {
      setLoading(false);
    }
  }
  return {
    register,
    loading,
  };
}

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setLoggedInUser } = useSetLoggedInUser();
  // Assuming this is a hook

  async function logIn(
    values: z.infer<typeof loginSchema>,
    redirectTo?: string
  ) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (data && data?.user?.email) {
        await setLoggedInUser(data?.user?.email);
        //  console.log(data?.user?.email);
        toast.success("Sign In Successful");
        router.push(redirectTo ?? "/home");
        setLoading(false);
      } else {
        toast.error("Incorrect Details");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  }

  return {
    logIn,
    loading,
  };
}

export function useLogOut(redirectPath: string = "/") {
  const router = useRouter();
  const { setUser } = useUserStore();
  const { setOrganization } = useOrganizationStore();

  async function logOut() {
    await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
    router.push(redirectPath);
  }

  return {
    logOut,
  };
}

export const useSetLoggedInUser = () => {
  const { setUser } = useUserStore();

  const setLoggedInUser = async (email: string | null) => {
    if (!email) return;
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("userEmail", email)
      .single();
    if (error) {
      console.log({ error });
      // window.open(
      //   `/onboarding?email=${email}&createdAt=${new Date().toISOString()}`,
      //   "_self"
      // );
      return;
    }
    console.log(user);
    setUser(user);
    return user;
  };

  return { setLoggedInUser };
};

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function forgotPassword(email: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        //  saveCookie("user", data);

        router.push(
          `/verify-email?message=Reset Password&content=If the email you entered is registered, we've sent an OTP code to your inbox. Please check your email and follow the instructions to reset your password.&email=${email}&type=reset-password`
        );
      }
    } catch (error) {
      setLoading(false);
    }
  }

  return {
    forgotPassword,
    loading,
  };
}

export function useUpdatePassword() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updatePassword(password: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        //  saveCookie("user", data);
        toast.success("Password Reset Successfully");
        router.push(`/login`);
      }
    } catch (error) {
      setLoading(false);
    }
  }

  return {
    updatePassword,
    loading,
  };
}

export function useResendLink() {
  const [loading, setLoading] = useState(false);

  async function resendLink(email: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return {
    resendLink,
    loading,
  };
}

export function useVerifyCode() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function verifyCode(
    email: string,
    token: string,
    type: string | null,
    workspaceAlias?: string
  ) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) {
        throw error;
      }

      if (type === "reset-password") {
        router.push(`${window.location.origin}/update-password`);
      } else {
        router.push(
          `${
            window.location.origin
          }/onboarding?email=${email}&createdAt=${new Date().toISOString()}${
            workspaceAlias ? `&workspaceAlias=${workspaceAlias}` : ""
          }`
        );
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    verifyCode,
  };
}

export const getUser = async (email: string | null) => {
  if (!email) return;
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("userEmail", email)
    .single();
  if (error) {
    //  console.log({error});
    if (typeof window !== "undefined")
      window.open(
        `/onboarding?email=${email}&createdAt=${new Date().toISOString()}`,
        "_self"
      );
    return;
  }
  // console.log(user);
  // saveCookie("user", user);
  return user;
};

export function useOnboarding() {
  const [loading, setLoading] = useState(false);
  const { setUser } = useUserStore();
  const params = useSearchParams();

  type CreateUser = {
    values: z.infer<typeof onboardingSchema>;
    email: string | null;
    createdAt: string | null;
  };
  type FormData = {
    referralCode: string;
    referredBy: string;
    phoneNumber: string;
    country: string;
    firstName: string;
    lastName: string;
    industry: string;
  };

  async function registration(
    values: FormData,
    email: string | null,
    createdAt: string | null
  ) {
    try {
      setLoading(true);
      if (params.get("token")) {
        const token = params.get("token");
        const userId = params.get("userId");

        const { data, status } = await postRequest<any>({
          endpoint: `/verifyuser/${userId}/${token}`,
          payload: "",
        });
      }

      const { data, error, status } = await supabase
        .from("users")
        .insert({
          userEmail: email,
          firstName: values.firstName,
          lastName: values.lastName,
          created_at: createdAt,
          industry: values.industry,
          referralCode: values.referralCode,
          phoneNumber: values.phoneNumber,
          referredBy: values.referredBy,
        })
        .select("*")
        .maybeSingle();

      if (error) {
        toast.error(error.message);
        return;
      }

      setLoading(false);
      toast.success("Profile Updated Successfully");
      const user = data as unknown as TUser;
      setUser(user);

      console.log(user);
      return data as unknown as TUser;
    } catch (error: any) {
      //
      toast.error(error?.response?.data?.error);
    } finally {
      setLoading(false);
    }
  }
  return {
    registration,
    loading,
  };
}

export const useGetUserId = () => {
  const getUserId = async (
    email: string | null
  ): Promise<string | undefined> => {
    if (!email) return;

    const { data: user, error } = await supabase
      .from("users")
      .select("id") // Select only the id field
      .eq("userEmail", email)
      .order("created_at", { ascending: false })
      .single();

    if (error) {
      console.error("Error fetching user ID:", error);
      return;
    }
    return user.id; // Return the user ID
  };

  return { getUserId };
};
