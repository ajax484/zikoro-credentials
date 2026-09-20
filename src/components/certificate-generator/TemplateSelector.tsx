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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8 min-w-0 overflow-x-hidden">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
          Choose a Certificate Template
        </h1>
        <p className="mt-2 text-xs sm:text-base text-gray-600">
          Select from professionally designed templates to personalize for your recipients. 100% free to customize and download.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-sm mb-6 sm:mb-8 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between w-full min-w-0 max-w-full">
        {/* Search */}
        <div className="relative w-full md:w-80 min-w-0 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates (e.g. Training, Honor)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
          />
        </div>

        {/* Categories (Horizontal Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none w-full min-w-0 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition shrink-0 ${
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
        <div className="flex items-center justify-center rounded-lg border border-gray-200 p-0.5 bg-gray-50 shrink-0 self-start md:self-auto max-w-full">
          {(["all", "landscape", "portrait"] as const).map((orient) => (
            <button
              key={orient}
              onClick={() => setOrientationFilter(orient)}
              className={`px-2.5 sm:px-3 py-1 text-xs font-medium capitalize rounded-md transition ${
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start w-full min-w-0">
        {/* Template Gallery Grid (High-density, space-efficient) */}
        <div className="lg:col-span-7 xl:col-span-8 min-w-0 w-full">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3.5 w-full min-w-0">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              const isLandscape = (template.JSON?.width ?? 900) >= (template.JSON?.height ?? 1200);

              return (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className={`group relative rounded-lg sm:rounded-xl border-2 overflow-hidden bg-white cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.99] flex flex-col justify-between min-w-0 ${
                    isSelected
                      ? "border-purple-600 ring-2 ring-purple-200 shadow-sm"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {/* Certificate Document Frame */}
                  <div className={`relative w-full ${isLandscape ? "aspect-[4/3]" : "aspect-[3/4]"} bg-gray-50 flex items-center justify-center p-1 sm:p-2 min-w-0 overflow-hidden`}>
                    {template.previewUrl ? (
                      <Image
                        src={template.previewUrl}
                        alt={template.name || "Certificate Template"}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-1 drop-shadow-xs group-hover:scale-[1.03] transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 bg-gray-100">
                        No Preview
                      </div>
                    )}

                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-purple-600 text-white rounded-full p-0.5 sm:p-1 shadow-md z-10">
                        <Check className="size-3 sm:size-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Card Footer info */}
                  <div className="p-1.5 sm:p-2.5 bg-white border-t border-gray-100 flex items-center justify-between gap-1 shrink-0 min-w-0">
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-800 truncate min-w-0 flex-1">
                      {template.name || "Certificate Template"}
                    </p>
                    <span className="text-[9px] text-gray-500 capitalize bg-gray-100 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline">
                      {isLandscape ? "Landscape" : "Portrait"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Preview Pane (Sticky on Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 min-w-0 w-full">
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3.5 sm:p-4 shadow-sm min-w-0">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2.5 flex items-center justify-between">
              <span>Selected Preview</span>
              {selectedTemplate && (
                <span className="text-[10px] sm:text-[11px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Ready to edit
                </span>
              )}
            </h3>

            {selectedTemplate ? (
              <div className="space-y-3 min-w-0">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-inner flex items-center justify-center">
                  {selectedTemplate.previewUrl ? (
                    <Image
                      src={selectedTemplate.previewUrl}
                      alt={selectedTemplate.name || "Preview"}
                      fill
                      className="object-contain p-2 drop-shadow-sm"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-400">
                      Preview
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-2.5 space-y-1 min-w-0">
                  <div className="flex justify-between items-center text-xs min-w-0 gap-2">
                    <span className="text-gray-500 shrink-0">Name:</span>
                    <span className="font-medium text-gray-800 truncate text-right">
                      {selectedTemplate.name || "Certificate"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs min-w-0 gap-2">
                    <span className="text-gray-500 shrink-0">Orientation:</span>
                    <span className="font-medium text-gray-800">
                      {(selectedTemplate.JSON?.width ?? 900) >= (selectedTemplate.JSON?.height ?? 1200)
                        ? "Landscape"
                        : "Portrait"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onContinue}
                  className="w-full flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow-md transition transform active:scale-[0.99]"
                >
                  <span>Select & Customize Template</span>
                  <ArrowRight className="size-3.5 sm:size-4" />
                </button>
              </div>
            ) : (
              <div className="py-10 sm:py-14 text-center border-2 border-dashed border-gray-200 rounded-xl px-4">
                <p className="text-xs text-gray-500 font-medium">
                  Click any certificate template to preview and customize it.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar when Template is Selected */}
      {selectedTemplate && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 shadow-xl max-w-full overflow-hidden">
          <div className="flex items-center justify-between gap-3 min-w-0 max-w-full">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {selectedTemplate.previewUrl && (
                <div className="relative size-11 rounded border border-gray-200 overflow-hidden shrink-0 bg-gray-50">
                  <Image
                    src={selectedTemplate.previewUrl}
                    alt={selectedTemplate.name || "Template"}
                    fill
                    className="object-contain p-0.5"
                  />
                </div>
              )}
              <div className="truncate min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {selectedTemplate.name || "Certificate"}
                </p>
                <p className="text-[11px] text-purple-600 font-medium">Template selected</p>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition"
            >
              <span>Customize</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
