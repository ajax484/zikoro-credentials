import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import React, { useState } from "react";

const AddPoints = ({
  prices,
  credits,
  updateCredits,
  handleNext,
}: {
  prices: {
    bronze: number;
    silver: number;
    gold: number;
  };
  credits: {
    bronze: number;
    silver: number;
    gold: number;
  };
  updateCredits: (credit: string, value: number) => void;
  handleNext: () => void;
}) => {
  return (
    <section className="space-y-6 w-full">
      <h1 className="text-center text-2xl font-bold text-gray-700">
        Add Credits
      </h1>
      <div className="grid grid-cols-3 gap-4 w-full">
        <div
          className={cn(
            "border-2 rounded-xl flex flex-col items-center gap-8 bg-white px-4 py-2 text-sm text-basePrimary",
            credits.bronze > 0 ? "border-basePrimary" : "border-gray-300"
          )}
        >
          <div className="rounded-full p-0.5 [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]">
            <div className="rounded-full size-10 [box-shadow:_0px_8px_12px_0px_#C2AF9B66;] [background:_linear-gradient(340.48deg,_#87704F_13.94%,_#CBC6C5_83.24%);]" />
          </div>
          <h2 className="text-basePrimary text-center text-xl font-bold">
            Bronze
          </h2>
          <div className="space-y-2 text-center w-full">
            <div className="flex gap-1 w-full items-center">
              <div className="flex-1 bg-gray-300 h-[1px]" />
              <h3 className="text-sm text-gray-500 font-semibold">Features</h3>
              <div className="flex-1 bg-gray-300 h-[1px]" />
            </div>
            <ul className="space-y-2 text-sm text-gray-500">
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
          <span className="text-xl font-bold">
            NGN{credits.bronze * prices.bronze}
          </span>

          <span className="text-xs font-bold text-muted-foreground">
            *1 Bronze credit costs {prices.bronze} NGN
          </span>
        </div>
        <div
          className={cn(
            "border-2 rounded-xl flex flex-col items-center gap-8 bg-white px-4 py-2 text-sm text-basePrimary",
            credits.silver > 0 ? "border-basePrimary" : "border-gray-300"
          )}
        >
          <div className="rounded-full p-0.5 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]">
            <div className="rounded-full size-10 [background:_linear-gradient(121.67deg,_#B6C0D6_22.73%,_rgba(107,_106,_123,_0.84)_79.34%),_linear-gradient(0deg,_rgba(0,_0,_0,_0.1),_rgba(0,_0,_0,_0.1));]" />
          </div>
          <h2 className="text-basePrimary text-center text-xl font-bold">
            Silver
          </h2>
          <div className="space-y-2 text-center w-full">
            <div className="flex gap-1 w-full items-center">
              <div className="flex-1 bg-gray-300 h-[1px]" />
              <h3 className="text-sm text-gray-500 font-semibold">Features</h3>
              <div className="flex-1 bg-gray-300 h-[1px]" />
            </div>
            <ul className="space-y-2 text-sm text-gray-500">
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
          <span className="text-xl font-bold">
            NGN{credits.silver * prices.silver}
          </span>

          <span className="text-xs font-bold text-muted-foreground">
            *1 Silver credit costs {prices.silver} NGN
          </span>
        </div>
        <div
          className={cn(
            "border-2 rounded-xl flex flex-col items-center gap-8 bg-white px-4 py-2 text-sm text-basePrimary",
            credits.gold > 0 ? "border-basePrimary" : "border-gray-300"
          )}
        >
          <div className="rounded-full p-0.5 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]">
            <div className="rounded-full size-10 [background:_linear-gradient(147.61deg,_#FFE092_12.55%,_#E3A302_86.73%);]" />
          </div>
          <h2 className="text-basePrimary text-center text-xl font-bold">
            Gold
          </h2>
          <div className="space-y-2 text-center w-full">
            <div className="flex gap-1 w-full items-center">
              <div className="flex-1 bg-gray-300 h-[1px]" />
              <h3 className="text-sm text-gray-500 font-semibold">Features</h3>
              <div className="flex-1 bg-gray-300 h-[1px]" />
            </div>
            <ul className="space-y-2 text-sm text-gray-500">
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
          <div className="flex items-center justify-between gap-2 w-full">
            <button
              type="button"
              onClick={() =>
                updateCredits("gold", credits.gold > 5 ? credits.gold - 5 : 0)
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
          <span className="text-xl font-bold">
            NGN{credits.gold * prices.gold}
          </span>

          <span className="text-xs font-bold text-muted-foreground">
            *1 Gold credit costs {prices.gold} NGN
          </span>
        </div>
      </div>
      <Button
        disabled={
          credits.bronze === 0 && credits.silver === 0 && credits.gold === 0
        }
        onClick={handleNext}
        className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-8 w-fit mx-auto"
      >
        Pay{" "}
        {credits.bronze * prices.bronze +
          credits.silver * prices.silver +
          credits.gold * prices.gold}
      </Button>
    </section>
  );
};

export default AddPoints;
