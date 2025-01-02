"use client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LoaderAlt } from "styled-icons/boxicons-regular";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizationSchema } from "@/schemas";
import InputOffsetLabel from "@/components/InputOffsetLabel";
import { useCreateOrganisation } from "@/hooks";
import { useGetData, useMutateData } from "@/hooks/services/request";
import useUserStore from "@/store/globalUserStore";
import { useEffect, useState, useMemo } from "react";
import { Plus } from "styled-icons/bootstrap";
import { Minus } from "styled-icons/feather";
import { cn } from "@/lib/utils";
import React from "react";
import toast from "react-hot-toast";
import { Form, FormField } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { generateAlias } from "@/utils/helpers";
import { Lock } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";

type TPricingPlan = {
  amount: number | null;
  created_at: string;
  currency: string;
  id: number;
  monthPrice: number | null;
  plan: string | null;
  productType: string;
  yearPrice: number | null;
};

type TCurrencyConverter = {
  id: number;
  created_at: string;
  currency: string;
  amount: number;
};

type TZikoroDiscount = {
  id: number;
  created_at: string;
  discountCode: string;
  validUntil: string;
  discountAmount: number;
  discountPercentage: string;
};

export function CreateOrganization({
  close,
  refetch,
  allowRedirect = false,
}: {
  refetch?: () => Promise<any>;
  close: () => void;
  allowRedirect?: boolean;
}) {
  const router = useRouter();
  const { data: pricing } = useGetData<TPricingPlan[]>("/pricing");
  const { data: zikoroDiscounts } =
    useGetData<TZikoroDiscount[]>("/pricing/discount");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [code, setCode] = useState("");
  const { data: currencyConverter } =
    useGetData<TCurrencyConverter[]>(`/pricing/currency`);
  const { user } = useUserStore();
  const [isMonthly, setIsMonthly] = useState(true);
  const [discount, setDiscount] = useState<TZikoroDiscount | null>(null);
  const { organisation, loading } = useCreateOrganisation();
  const [selectedPricing, setSelectedPricing] = useState<TPricingPlan | null>(
    null
  );
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organizationAlias: generateAlias(),
      subscriptionPlan: "Free",
      organizationName: "",
      userEmail: user?.userEmail,
      firstName: user?.firstName,
      lastName: user?.lastName,
      organizationType: "Private",
    },
  });
  const [isDiscount, setIsDiscount] = useState(false);

  useEffect(() => {
    if (user) {
      form.setValue("userEmail", user.userEmail);
      form.setValue("lastName", user.lastName);
      form.setValue("firstName", user.firstName);
    }
  }, [user]);

  const watchedSubSelection = form.watch("subscriptionPlan");
  const organizationAlias = form.watch("organizationAlias");

  useEffect(() => {
    if (pricing && watchedSubSelection) {
      const chosenPlan = pricing?.find(
        ({ plan }) => plan === watchedSubSelection
      );
      setSelectedPricing(chosenPlan || null);
    }
  }, [pricing, watchedSubSelection]);

  const subPlanPrice = useMemo(() => {
    if (selectedPricing && currencyConverter) {
      const amount = currencyConverter?.find(
        (v) => v?.currency === selectedCurrency
      )?.amount;
      return isMonthly
        ? Number(selectedPricing?.monthPrice || 0) * (amount || 0)
        : Number(selectedPricing?.yearPrice || 0) * (amount || 0) * 12;
    } else {
      return 0;
    }
  }, [selectedPricing, isMonthly, currencyConverter, selectedCurrency]);

  const appliedDiscount = useMemo(() => {
    if (discount) {
      return ((Number(discount?.discountPercentage) || 0) / 100) * subPlanPrice;
    } else return 0;
  }, [subPlanPrice, discount]);

  async function onSubmit(values: z.infer<typeof organizationSchema>) {
    await organisation(values);
    if (refetch) refetch();
    if (allowRedirect && buyCredits) {
      router.push("/credits/buy");
    }
    close();
  }

  function applyDiscount() {
    if (!zikoroDiscounts) return;

    const percent = zikoroDiscounts?.find((v) => v?.discountCode === code);
    if (percent) {
      if (percent.validUntil && new Date(percent.validUntil) < new Date()) {
        toast.error("Oops! Discount code has expired. Try another one");
        return;
      }
      setDiscount(percent);
      toast.success("Greate move!. Discount has been applied");
      setIsDiscount(true);
      return;
    } else {
      setDiscount(null);
      toast.error("Oops! Discount code is incorrect. Try again");
      return;
    }
  }

  const [buyCredits, setBuyCredits] = useState(false);

  return (
    <div
      onClick={close}
      className="w-full h-full fixed overflow-y-auto no-scrollbar z-[100] inset-0 bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95%] h-[90vh] overflow-y-auto max-w-5xl grid grid-cols-1 md:grid-cols-9 box-animation bg-white mx-auto my-12  md:my-auto absolute inset-x-0 md:inset-y-0 "
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full md:col-span-5 grid grid-cols-1 py-8 sm:py-10 px-4 sm:px-8 lg:px-10 bg-white"
          >
            <h2 className="text-base sm:text-xl font-semibold">
              Personal Information
            </h2>

            <div className="w-full flex py-4 flex-col gap-y-3 items-start justify-start">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <InputOffsetLabel label="First Name">
                    <Input
                      type="text"
                      placeholder="Enter First Name"
                      {...field}
                      readOnly
                      className="h-11 placeholder:text-sm placeholder:text-zinc-500 text-zinv-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <InputOffsetLabel label="Last Name">
                    <Input
                      type="text"
                      placeholder="Enter Last Name"
                      {...field}
                      readOnly
                      className="h-11 placeholder:text-sm placeholder:text-zinc-500 text-zinv-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <InputOffsetLabel label="Email Address">
                    <Input
                      type="text"
                      placeholder="Enter Email Address"
                      {...field}
                      readOnly
                      className="placeholder:text-sm h-11  text-zinv-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <InputOffsetLabel label="Workspace Name">
                    <Input
                      type="text"
                      placeholder="Enter Workspace Name"
                      {...field}
                      className="placeholder:text-sm h-11  text-zinv-700"
                    />
                  </InputOffsetLabel>
                )}
              />
              {/* <FormField
                control={form.control}
                name="organizationType"
                render={({ field }) => (
                  <InputOffsetLabel label="Workspace Type">
                    <ReactSelect
                      {...form.register("organizationType")}
                      options={orgType.map((value) => {
                        return { value, label: value };
                      })}
                      borderColor="#001fcc"
                      bgColor="#001fcc1a"
                      height="2.5rem"
                      placeHolderColor="#64748b"
                      placeHolder="Select Workspace"
                    />
                  </InputOffsetLabel>
                )}
              /> */}
            </div>

            <div className="w-full hidden flex-col items-start justify-start gap-y-2">
              <h2 className="font-semibold text-base sm:text-xl mb-2">
                Add-Ons
              </h2>

              <div className="w-full grid grid-cols-5">
                <p className="col-span-2">Certificate</p>
                <div className="col-span-3 flex items-center gap-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex rounded-full items-center justify-center h-6 w-6 bg-gray-200"
                  >
                    <Minus size={15} />
                  </button>
                  <p className="font-medium text-mobile sm:text-sm">0</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex rounded-full items-center justify-center h-6 w-6 bg-basePrimary text-white"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
              <div className="w-full grid grid-cols-5">
                <p className="col-span-2">Badges</p>
                <div className="col-span-3 flex items-center gap-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex rounded-full items-center justify-center h-6 w-6 bg-gray-200"
                  >
                    <Minus size={15} />
                  </button>
                  <p className="font-medium text-mobile sm:text-sm">0</p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex rounded-full items-center justify-center h-6 w-6 bg-basePrimary text-white"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full pt-4 flex flex-col items-start justify-start gap-y-3">
              {/* <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDiscount(true);
                }}
                className={cn(
                  "text-xs sm:text-mobile text-basePrimary",
                  isDiscount && "hidden"
                )}
              >
                Have a discount code? Click here to enter the code.
              </button>
              <div
                className={cn(
                  "w-full flex items-center ",
                  !isDiscount && "hidden"
                )}
              >
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter a valid discount code"
                  className="bg-transparent h-10 rounded-l-md px-3 outline-none placeholder:text-gray-300 border border-gray-300 w-[75%]"
                />
                <Button
                  disabled={code === ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    applyDiscount();
                  }}
                  className="h-10 text-white rounded-r-md rounded-l-none bg-gray-500 font-medium px-0 w-[25%]"
                >
                  {"" ? "Verifying..." : "Redeem"}
                </Button>
              </div> */}

              {allowRedirect && (
                <div className="flex items-center justify-center gap-2">
                  <Checkbox
                    checked={buyCredits}
                    onCheckedChange={(value) => setBuyCredits(value)}
                    className="data-[state=checked]:bg-basePrimary"
                  />
                  <label className="text-xs font-bold text-gray-700">
                    Buy Credits After Creating Workspace
                  </label>
                </div>
              )}
              <div className="w-full flex items-center justify-center">
                <Button
                  type="submit"
                  className="w-full gap-x-2 bg-basePrimary text-gray-50 font-medium"
                >
                  {loading ? (
                    <LoaderAlt size={20} className="animate-spin" />
                  ) : (
                    <Lock size={22} />
                  )}
                  Create
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
