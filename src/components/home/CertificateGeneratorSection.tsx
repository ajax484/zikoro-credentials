"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Download, Loader } from "lucide-react";
import { useFetchCertificateTemplates } from "@/queries/certificates.queries";

const SHOWCASE_CATEGORIES = ["All", "Completion", "Appreciation", "Achievement", "Training"];

export default function CertificateGeneratorSection() {
  const router = useRouter();
  const { data: templates = [], isFetching } = useFetchCertificateTemplates();
  const [activeCategory, setActiveCategory] = useState("All");

  // Get top 6 certificates matching filter
  const featuredTemplates = templates
    .filter((t) => !t.credentialType || t.credentialType === "certificate")
    .filter((t) => {
      if (activeCategory === "All") return true;
      return (
        t.category?.some((c) => c.toLowerCase().includes(activeCategory.toLowerCase())) ||
        t.name?.toLowerCase().includes(activeCategory.toLowerCase()) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(activeCategory.toLowerCase()))
      );
    })
    .slice(0, 6);

  return (
    <section className="mt-[70px] lg:mt-[90px] max-w-full 2xl:max-w-[1128px] mx-auto px-3 lg:px-0">
      {/* Container with subtle glass/gradient border */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Glow decorations */}
        <div className="absolute bg-[#001FCC] blur-[100px] rounded-full h-[160px] w-[160px] -top-[40px] -left-[40px] opacity-10 pointer-events-none" />
        <div className="absolute bg-[#9D00FF] blur-[100px] rounded-full h-[160px] w-[160px] -bottom-[40px] -right-[40px] opacity-10 pointer-events-none" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-3">
            <Sparkles className="size-3.5" />
            <span>Interactive Tool</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
            Create & Personalize Certificates — 100% Free
          </h2>

          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Design professional certificates right in your browser. Choose a template, add your recipients, and download your batch instantly with zero sign-up required.
          </p>

          {/* Quick Value Props */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Up to 10 free recipients
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              High-res PDF downloads
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              No credit card needed
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none px-1">
          {SHOWCASE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template Grid Preview */}
        {isFetching ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader className="size-6 animate-spin text-purple-600" />
            <p className="text-xs mt-2 text-gray-500">Loading certificate templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            {featuredTemplates.map((template) => {
              const isLandscape = (template.JSON?.width ?? 900) >= (template.JSON?.height ?? 1200);

              return (
                <div
                  key={template.id}
                  className="group relative rounded-xl border border-gray-200 overflow-hidden bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-50 flex items-center justify-center p-1.5 sm:p-2 overflow-hidden">
                    {template.previewUrl ? (
                      <Image
                        src={template.previewUrl}
                        alt={template.name || "Certificate Template"}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                        className="object-contain p-1 drop-shadow-xs group-hover:scale-[1.03] transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                        Template Preview
                      </div>
                    )}

                    {/* Hover Overlay with Action Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-3">
                      <button
                        onClick={() => router.push(`/certificate-generator?templateId=${template.id}`)}
                        className="px-3.5 py-1.5 bg-white text-purple-700 text-xs font-bold rounded-lg shadow-lg hover:bg-purple-50 transition transform scale-95 group-hover:scale-100 cursor-pointer"
                      >
                        Customize Template
                      </button>
                    </div>
                  </div>

                  <div className="p-2 sm:p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-1 shrink-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {template.name || "Certificate"}
                    </p>
                    <span className="text-[9px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded shrink-0">
                      Free
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            Need custom colors, dynamic merge tags, or your logo? Explore our full library of 35+ designs.
          </p>

          <Link
            href="/certificate-generator"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow-md transition shrink-0"
          >
            <span>Launch Free Certificate Maker</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
