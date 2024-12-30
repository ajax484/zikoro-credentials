"use client";

import { useForm } from "react-hook-form";
import { ChevronDown } from "styled-icons/bootstrap";
import * as z from "zod";
import { ArrowBack, LoaderAlt } from "styled-icons/boxicons-regular";
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
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import { Form, FormField } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { generateAlias, generateAlphanumericHash } from "@/utils/helpers";
import { ReactSelect } from "../CustomSelect/customSelect";
import { Check, Lock, X } from "lucide-react";
import { PaystackButton } from "react-paystack";
import { paymentConfig } from "@/hooks/common/usePayStackPayment";

const orgType = ["Private", "Business"];

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

const currencies = ["ZAR", "GHC", "NGN", "KES", "USD"];

function CurrencyDropDown({
  currencyCode,
  setcurrencyCode,
}: {
  currencyCode: string;
  setcurrencyCode: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isOpen, setOpen] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setOpen((prev) => !prev);
      }}
      className=" text-mobile relative sm:text-desktop"
    >
      <div className="flex items-center gap-x-1 p-2 rounded-sm  border">
        <p>{currencyCode}</p>

        <ChevronDown size={16} />
      </div>
      <div className="absolute left-0 top-10 w-full">
        {isOpen && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setOpen(false);
            }}
            className="w-full z-[400] h-full fixed inset-0"
          ></button>
        )}
        {isOpen && (
          <ul className="relative shadow z-[600] w-[80px] bg-white py-2 rounded-md">
            {currencies.map((item, index) => (
              <li
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setcurrencyCode(item);
                  setOpen(false);
                }}
                className={cn(
                  "py-2 px-1",
                  currencyCode === item && "bg-[#001fcc]/10"
                )}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  );
}

export function CreateOrganization({
  close,
  refetch,
}: {
  refetch?: () => Promise<any>;
  close: () => void;
}) {
  const { data: pricing } = useGetData<TPricingPlan[]>("/pricing");
  const { data: zikoroDiscounts } =
    useGetData<TZikoroDiscount[]>("/pricing/discount");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [code, setCode] = useState("");
  const { data: currencyConverter } =
    useGetData<TCurrencyConverter[]>(`/pricing/currency`);
  const { user } = useUserStore();
  const router = useRouter();
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
      organizationType: "",
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

  const [credits, setCredits] = useState<{
    bronze: number;
    silver: number;
    gold: number;
  }>({
    bronze: 0,
    silver: 0,
    gold: 0,
  });

  const prices = {
    bronze: 5000,
    silver: 7500,
    gold: 10000,
  };

  const updateCredits = (credit: string, value: number) => {
    setCredits((prev) => ({
      ...prev,
      [credit]: value,
    }));
  };

  const total =
    credits.bronze * prices.bronze +
    credits.silver * prices.silver +
    credits.gold * prices.gold;

  const { mutateData, isLoading: mutateLoading } = useMutateData(
    `/workspaces/credits/buy`
  );

  const config = paymentConfig({
    reference: organizationAlias + "-" + generateAlphanumericHash(12),
    email: user?.userEmail,
    amount: total,
    currency: "NGN",
  });

  const componentProps: any = {
    ...config,
    children: (
      <Button
        type="button"
        className="w-full gap-x-2 bg-basePrimary text-gray-50 font-medium"
      >
        {loading || mutateLoading ? (
          <LoaderAlt size={20} className="animate-spin" />
        ) : (
          <Lock size={22} />
        )}
        <span>{`Pay NGN ${Number(total)?.toLocaleString()}`}</span>
      </Button>
    ),
    onSuccess: (reference: any) => handleSuccess(reference),
  };

  const handleSuccess = async (reference: any) => {
    const workspace = await organisation(form.getValues());

    if (!workspace)
      return toast.error("Something went wrong. Please try again.");

    await mutateData({
      payload: {
        credits: {
          bronze: {
            amount: credits.bronze,
            price: prices.bronze,
          },
          silver: {
            amount: credits.silver,
            price: prices.silver,
          },
          gold: {
            amount: credits.gold,
            price: prices.gold,
          },
        },
        workspaceId: workspace?.id,
        email: workspace?.eventContactEmail,
        name: workspace?.organizationName,
      },
    });
  };

  return (
    <div
      onClick={close}
      className="w-full h-full fixed overflow-y-auto no-scrollbar z-[100] inset-0 bg-black/50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[95%] h-[90vh] overflow-y-auto max-w-5xl grid grid-cols-1 md:grid-cols-9 box-animation bg-white mx-auto my-12  md:my-auto absolute inset-x-0 md:inset-y-0 "
      >
        <div className="w-full bg-[#001fcc]/10 py-8 sm:py-10 px-4 sm:px-8 lg:px-10 md:col-span-4 space-y-12">
          <div className="flex">
            <button
              aria-label="Close"
              onClick={close}
              className="w-fit h-fit px-0"
            >
              <ArrowBack size={22} />
            </button>
            <h1 className="font-bold text-lg capitalize sm:text-2xl mx-auto">
              Buy Points
            </h1>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justiyf-between items-center gap-2 mb-2">
                <div className="flex gap-2 w-full items-center">
                  <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
                    <div className="rounded-full size-5 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
                  </div>
                  <h2 className="text-gray-800 text-center text-xl font-bold">
                    Bronze
                  </h2>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <button
                    type="button"
                    onClick={() =>
                      updateCredits(
                        "bronze",
                        credits.bronze > 0 ? credits.bronze - 5 : 0
                      )
                    }
                    aria-label="Decrease bronze credit"
                    disabled={credits.bronze === 0}
                    className="text-basePrimary disabled:opacity-70"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                    </svg>
                  </button>
                  <span className="border-b-2 border-black font-bold text-xl">
                    {credits.bronze}
                  </span>
                  <button
                    onClick={() => updateCredits("bronze", credits.bronze + 5)}
                    aria-label="Increase bronze credit"
                    type="button"
                    className="text-basePrimary disabled:opacity-70"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M696 480H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                    </svg>
                  </button>
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                *1 Bronze credit costs {prices.bronze} NGN
              </span>
              <h3 className="text-xl font-bold">
                NGN{(credits.bronze * prices.bronze).toLocaleString()}
              </h3>
              <div className="space-y-2 w-full mt-6">
                <h3 className="text-gray-500 font-semibold">Features</h3>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex gap-2 items-center">
                    <X className="size-4" />
                    <span>QR Code</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <X className="size-4" />
                    <span>Branding</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justiyf-between items-center gap-2 mb-2">
                <div className="flex gap-2 w-full items-center">
                  <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
                    <div className="rounded-full size-5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
                  </div>
                  <h2 className="text-gray-800 text-center text-xl font-bold">
                    Silver
                  </h2>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <button
                    type="button"
                    onClick={() =>
                      updateCredits(
                        "silver",
                        credits.silver > 5 ? credits.silver - 5 : 0
                      )
                    }
                    disabled={credits.silver === 0}
                    className="text-basePrimary disabled:opacity-70"
                    aria-label="Decrease silver credit"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                    </svg>
                  </button>
                  <span className="border-b-2 border-black font-bold text-xl">
                    {credits.silver}
                  </span>
                  <button
                    aria-label="Increase silver credit"
                    onClick={() => updateCredits("silver", credits.silver + 5)}
                    type="button"
                    className="text-basePrimary disabled:opacity-70"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M696 480H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                    </svg>
                  </button>
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                *1 Silver credit costs {prices.silver} NGN
              </span>
              <h3 className="text-xl font-bold">
                NGN{(credits.silver * prices.silver).toLocaleString()}
              </h3>
              <div className="space-y-2 w-full mt-6">
                <h3 className="text-gray-500 font-semibold">Features</h3>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex gap-2 items-center">
                    <Check className="size-4" />
                    <span>QR Code</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <X className="size-4" />
                    <span>Branding</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justiyf-between items-center gap-2 mb-2">
                <div className="flex gap-2 w-full items-center">
                  <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
                    <div className="rounded-full size-5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
                  </div>
                  <h2 className="text-gray-800 text-center text-xl font-bold">
                    Gold
                  </h2>
                </div>
                <div className="flex items-center justify-between gap-2 w-full">
                  <button
                    type="button"
                    onClick={() =>
                      updateCredits(
                        "gold",
                        credits.gold > 5 ? credits.gold - 5 : 0
                      )
                    }
                    disabled={credits.gold === 0}
                    aria-label="Decrease gold credit"
                    className="text-basePrimary disabled:opacity-70"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M696 480H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                    </svg>
                  </button>
                  <span className="border-b-2 border-black font-bold text-xl">
                    {credits.gold}
                  </span>
                  <button
                    onClick={() => updateCredits("gold", credits.gold + 5)}
                    type="button"
                    className="text-basePrimary disabled:opacity-70"
                    aria-label="Increase gold credit"
                  >
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      strokeWidth={0}
                      viewBox="0 0 1024 1024"
                      height="1.5em"
                      width="1.5em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M696 480H544V328c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v152H328c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h152v152c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V544h152c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8z" />
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" />
                    </svg>
                  </button>
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                *1 Gold credit costs {prices.gold} NGN
              </span>
              <h3 className="text-xl font-bold">
                NGN{(credits.gold * prices.gold).toLocaleString()}
              </h3>
              <div className="space-y-2 w-full">
                <h3 className="text-gray-500 font-semibold">Features</h3>
                <ul className="space-y-1 text-sm text-gray-500">
                  <li className="flex gap-2 items-center">
                    <Check className="size-4" />
                    <span>QR Code</span>
                  </li>
                  <li className="flex gap-2 items-center">
                    <Check className="size-4" />
                    <span>Branding</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="py-3 px-2 flex items-center w-full justify-between bg-gradient-to-tr from-custom-bg-gradient-start to-custom-bg-gradient-end rounded-lg ">
            <p className="text-xl font-medium">Total Cost</p>
            <p className="text-xl font-medium">
              NGN
              {(
                total -
                ((Number(discount?.discountPercentage) || 0) / 100) * total
              ).toLocaleString()}
            </p>
          </div>
        </div>

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
              <FormField
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
              />
              <InputOffsetLabel label="Subscription Plan">
                <Input
                  value={"free"}
                  readOnly
                  type="text"
                  className="placeholder:text-sm h-11 text-zinv-700"
                />
              </InputOffsetLabel>
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
              <button
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
              </div>

              <div className="w-full flex items-center justify-center">
                {total > 0 ? (
                  <PaystackButton
                    disabled={form.formState.isDirty}
                    {...componentProps}
                  />
                ) : (
                  <Button
                    type="submit"
                    className="w-full gap-x-2 bg-basePrimary text-gray-50 font-medium"
                  >
                    {loading || mutateLoading ? (
                      <LoaderAlt size={20} className="animate-spin" />
                    ) : (
                      <Lock size={22} />
                    )}
                    Create
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
