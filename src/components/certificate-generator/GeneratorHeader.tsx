"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import logo from "@/public/logo.png";

interface GeneratorHeaderProps {
  currentStep: number;
  setStep: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
}

const STEPS = [
  { id: 1, title: "Template", label: "Select Template" },
  { id: 2, title: "Customize", label: "Customize Design" },
  { id: 3, title: "Recipients", label: "Add Recipients" },
  { id: 4, title: "Download", label: "Download & Share" },
];

export const GeneratorHeader: React.FC<GeneratorHeaderProps> = ({
  currentStep,
  setStep,
  canNavigateToStep,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200 px-4 lg:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src={logo}
            alt="Zikoro Credentials"
            width={120}
            height={36}
            className="h-8 w-auto object-contain"
            priority
          />
          <span className="hidden sm:inline-block text-[11px] font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            Free Maker
          </span>
        </Link>

        {/* Stepper (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isClickable = canNavigateToStep(step.id);

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-6 lg:w-10 transition-colors ${
                      isCompleted ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
                <button
                  onClick={() => isClickable && setStep(step.id)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2 text-xs lg:text-sm font-medium transition-all ${
                    isCurrent
                      ? "text-purple-700 font-semibold"
                      : isCompleted
                      ? "text-gray-700 hover:text-purple-600 cursor-pointer"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`size-6 lg:size-7 rounded-full flex items-center justify-center text-xs transition-colors ${
                      isCompleted
                        ? "bg-purple-600 text-white"
                        : isCurrent
                        ? "bg-purple-700 text-white shadow-sm ring-2 ring-purple-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {isCompleted ? <Check className="size-3.5" /> : step.id}
                  </span>
                  <span className="hidden lg:inline">{step.label}</span>
                  <span className="inline lg:hidden">{step.title}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Mobile Step Indicator */}
        <div className="flex md:hidden items-center gap-2">
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
            Step {currentStep} of 4: {STEPS[currentStep - 1]?.title}
          </span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-1"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:opacity-95 shadow-sm transition"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};
