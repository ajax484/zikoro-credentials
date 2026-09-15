"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Loader, AlertCircle, ArrowRight, Check } from "lucide-react";
import { CertificateTemplate } from "@/types/certificates";
import { useFetchCertificateTemplates } from "@/queries/certificates.queries";

interface TemplateSelectorProps {
  selectedTemplate: CertificateTemplate | null;
  onSelectTemplate: (template: CertificateTemplate) => void;
  onContinue: () => void;
}

const CATEGORIES = [
  "All",
  "Completion",
  "Appreciation",
  "Achievement",
  "Training",
  "Recognition",
  "Participation",
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  onContinue,
}) => {
  const { data: templates = [], isFetching, error } = useFetchCertificateTemplates();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orientationFilter, setOrientationFilter] = useState<"all" | "landscape" | "portrait">("all");

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter((t) => !t.credentialType || t.credentialType === "certificate")
      .filter((t) => {
        if (selectedCategory === "All") return true;
        const matchesCategory = t.category?.some((c) =>
          c.toLowerCase().includes(selectedCategory.toLowerCase())
        );
        const matchesName = t.name?.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesTags = t.tags?.some((tag) =>
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        );
        return matchesCategory || matchesName || matchesTags;
      })
      .filter((t) => {
        if (orientationFilter === "all") return true;
        const width = t.JSON?.width ?? 900;
        const height = t.JSON?.height ?? 1200;
        if (orientationFilter === "landscape") return width >= height;
        if (orientationFilter === "portrait") return width < height;
        return true;
      })
      .filter((t) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.name?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
          t.category?.some((cat) => cat.toLowerCase().includes(q))
        );
      });
  }, [templates, selectedCategory, orientationFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
          Choose a Certificate Template
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Select from professionally designed templates to personalize for your recipients. 100% free to customize and download.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates (e.g. Training, Honor)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Orientation Toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 p-0.5 bg-gray-50 self-end md:self-auto shrink-0">
          {(["all", "landscape", "portrait"] as const).map((orient) => (
            <button
              key={orient}
              onClick={() => setOrientationFilter(orient)}
              className={`px-3 py-1 text-xs font-medium capitalize rounded-md transition ${
                orientationFilter === orient
                  ? "bg-white text-purple-700 shadow-sm font-semibold"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {orient}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Template Gallery Grid */}
        <div className="lg:col-span-7 xl:col-span-8">
          {isFetching && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader className="size-8 animate-spin text-purple-600" />
              <p className="mt-3 text-sm text-gray-500">Loading certificate templates...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 bg-red-50 rounded-xl border border-red-200 p-6 text-center">
              <AlertCircle className="size-8 text-red-500 mb-2" />
              <p className="text-sm font-medium text-red-800">Failed to load templates</p>
              <p className="text-xs text-red-600 mt-1">Please refresh the page to try again.</p>
            </div>
          )}

          {!isFetching && !error && filteredTemplates.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6">
              <p className="text-gray-600 font-medium text-sm">No templates found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setOrientationFilter("all");
                }}
                className="mt-3 text-xs text-purple-600 hover:underline font-semibold"
              >
                Clear all filters
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              const isLandscape = (template.JSON?.width ?? 900) >= (template.JSON?.height ?? 1200);

              return (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`group relative rounded-xl border-2 overflow-hidden bg-white cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? "border-purple-600 ring-2 ring-purple-200 shadow-md"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {/* Aspect ratio frame */}
                  <div className={`relative w-full ${isLandscape ? "aspect-[4/3]" : "aspect-[3/4]"} bg-gray-50`}>
                    {template.previewUrl ? (
                      <Image
                        src={template.previewUrl}
                        alt={template.name || "Certificate Template"}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                        Preview Unavailable
                      </div>
                    )}

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 bg-purple-600 text-white rounded-full p-1 shadow-md">
                        <Check className="size-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Card Footer info */}
                  <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">
                      {template.name || "Certificate Template"}
                    </p>
                    <span className="text-[10px] text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded">
                      {isLandscape ? "Landscape" : "Portrait"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Preview Pane (Sticky on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
              <span>Selected Preview</span>
              {selectedTemplate && (
                <span className="text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Ready to edit
                </span>
              )}
            </h3>

            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-inner">
                  {selectedTemplate.previewUrl ? (
                    <Image
                      src={selectedTemplate.previewUrl}
                      alt={selectedTemplate.name || "Preview"}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                      Preview
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Template Name:</span>
                    <span className="font-medium text-gray-800 truncate max-w-[180px]">
                      {selectedTemplate.name || "Certificate"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Format:</span>
                    <span className="font-medium text-gray-800">
                      {(selectedTemplate.JSON?.width ?? 900) >= (selectedTemplate.JSON?.height ?? 1200)
                        ? "Landscape"
                        : "Portrait"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onContinue}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow-md transition transform active:scale-[0.99]"
                >
                  <span>Select & Customize Template</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            ) : (
              <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-xl px-4">
                <p className="text-xs text-gray-500 font-medium">
                  Click any certificate template from the left to preview it here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
