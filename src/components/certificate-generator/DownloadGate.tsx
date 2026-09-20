"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Sparkles,
  Loader,
  ShieldCheck,
  QrCode,
  Share2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { fabric } from "fabric";
import { jsPDF } from "jspdf";
import Link from "next/link";
import { RecipientItem } from "./RecipientManager";

interface DownloadGateProps {
  canvasData: {
    json: any;
    width: number;
    height: number;
  };
  recipients: RecipientItem[];
  onBack: () => void;
}

export const DownloadGate: React.FC<DownloadGateProps> = ({
  canvasData,
  recipients,
  onBack,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compile certificates and download
  const handleGenerateAndDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      setErrorMessage("Please provide your first name and work email.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("Please agree to the terms to proceed with download.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setProgressText("Preparing certificate generator...");

    try {
      // 1. Submit lead data to backend
      try {
        await fetch("/api/generator/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            organization: organization.trim(),
            recipientCount: recipients.length,
          }),
        });
      } catch (apiErr) {
        console.warn("Lead record note:", apiErr);
      }

      // 2. Client-side PDF Generation with jsPDF & Fabric matching exact workspace crop
      let pdf: jsPDF | null = null;

      // Offscreen buffer canvas to hold unscaled/unzoomed template objects
      const bufferSize = 3600;
      const offscreenEl = document.createElement("canvas");
      offscreenEl.width = bufferSize;
      offscreenEl.height = bufferSize;

      const offscreenCanvas = new fabric.Canvas(offscreenEl, {
        width: bufferSize,
        height: bufferSize,
        backgroundColor: "#ffffff",
      });

      const jsonStr = JSON.stringify(canvasData.json);

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        setProgressText(`Rendering certificate ${i + 1} of ${recipients.length} (${recipient.firstName})...`);

        // Replace recipient merge tags in template JSON
        let personalizedJsonStr = jsonStr;
        const fullName = `${recipient.firstName} ${recipient.lastName}`.trim();

        personalizedJsonStr = personalizedJsonStr
          .replace(/#{first_name}#/g, recipient.firstName)
          .replace(/#{last_name}#/g, recipient.lastName)
          .replace(/#{recipient_name}#/g, fullName)
          .replace(/{{Recipient Name}}/gi, fullName)
          .replace(/{{first_name}}/gi, recipient.firstName)
          .replace(/{{last_name}}/gi, recipient.lastName);

        const personalizedJson = JSON.parse(personalizedJsonStr);

        // Load into offscreen canvas, align coordinate space, and extract exact high-res data URL
        await new Promise<void>((resolve) => {
          offscreenCanvas.loadFromJSON(personalizedJson, async () => {
            // Reset viewport transform to 1:1 raw coordinates
            offscreenCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            // Locate workspace clip rectangle
            const localWorkspace = offscreenCanvas.getObjects().find((obj) => obj.name === "clip");
            
            const exportWidth = Math.round(
              localWorkspace
                ? (localWorkspace.width || 900) * (localWorkspace.scaleX || 1)
                : canvasData.width || 900
            );
            const exportHeight = Math.round(
              localWorkspace
                ? (localWorkspace.height || 600) * (localWorkspace.scaleY || 1)
                : canvasData.height || 600
            );

            let exportLeft = 0;
            let exportTop = 0;

            if (localWorkspace) {
              localWorkspace.setCoords();
              const bound = localWorkspace.getBoundingRect(true, true);
              exportLeft = Math.round(bound.left);
              exportTop = Math.round(bound.top);
            }

            // Set offscreen canvas dimensions exactly to the certificate workspace
            offscreenCanvas.setDimensions({
              width: exportWidth,
              height: exportHeight,
            });

            // Translate coordinate space so the workspace starts at (0, 0)
            offscreenCanvas.setViewportTransform([1, 0, 0, 1, -exportLeft, -exportTop]);

            // Replace text object occurrences if any merge tags remain
            offscreenCanvas.getObjects().forEach((obj) => {
              if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
                const textObj = obj as fabric.Textbox;
                if (
                  textObj.text &&
                  (textObj.text.includes("#{first_name}#}") ||
                    textObj.text.includes("#{first_name}#") ||
                    textObj.text.includes("Recipient Name") ||
                    textObj.text.toLowerCase().includes("sample recipient"))
                ) {
                  textObj.set("text", fullName);
                }
              }
            });

            offscreenCanvas.renderAll();

            // Wait briefly for all image layers and fonts to settle
            await new Promise((res) => setTimeout(res, 80));

            // Extract exact certificate image
            const dataUrl = offscreenCanvas.toDataURL({
              format: "png",
              quality: 1,
            });

            // Initialize jsPDF matching certificate dimensions & orientation
            const isLandscape = exportWidth >= exportHeight;
            const orientation: "landscape" | "portrait" = isLandscape ? "landscape" : "portrait";
            const pdfFormat: [number, number] = [exportWidth, exportHeight];

            if (!pdf) {
              pdf = new jsPDF({
                orientation,
                unit: "pt",
                format: pdfFormat,
              });
            } else {
              pdf.addPage(pdfFormat, orientation);
            }

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(dataUrl, "PNG", 0, 0, pageWidth, pageHeight, undefined, "FAST");

            resolve();
          });
        });
      }

      offscreenCanvas.dispose();

      setProgressText("Finalizing PDF file...");
      if (pdf) {
        (pdf as jsPDF).save(`zikoro-certificates-${Date.now()}.pdf`);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Error generating certificates:", err);
      setErrorMessage(err.message || "An error occurred while generating your certificates. Please try again.");
    } finally {
      setIsGenerating(false);
      setProgressText("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      {isSuccess ? (
        /* Success & Conversion State */
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-10 shadow-lg text-center space-y-5 sm:space-y-6">
          <div className="size-14 sm:size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="size-8 sm:size-9 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900">
              Your Certificates Have Been Downloaded!
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
              Check your browser's download folder for your personalized PDF batch of{" "}
              <strong>{recipients.length} certificate(s)</strong>.
            </p>
          </div>

          {/* Upsell / Value-Add Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl p-4 sm:p-6 text-left space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 sm:size-5 text-purple-600 shrink-0" />
              <h3 className="font-bold text-gray-900 text-xs sm:text-sm">
                Unlock Verifiable Credentials With Zikoro
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Standard PDFs can be easily altered or faked. With a free Zikoro workspace, your credentials become tamper-proof digital assets:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
              <div className="flex items-start gap-2 bg-white p-2.5 sm:p-3 rounded-xl border border-purple-100 shadow-xs">
                <QrCode className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 font-medium">
                  Dynamic QR Code verification page
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 sm:p-3 rounded-xl border border-purple-100 shadow-xs">
                <Share2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 font-medium">
                  1-click LinkedIn badge sharing
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-2.5 sm:p-3 rounded-xl border border-purple-100 shadow-xs">
                <ShieldCheck className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 font-medium">
                  Automated email delivery & analytics
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow transition"
              >
                <span>Create Free Workspace</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <span className="text-[11px] text-gray-400 text-center sm:text-left">
                No credit card required
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setIsSuccess(false)}
              className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              <RefreshCw className="size-3.5" />
              <span>Download again or change details</span>
            </button>
          </div>
        </div>
      ) : (
        /* Lead Capture & Download Form */
        <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-10 shadow-lg space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
              <Sparkles className="size-3.5" />
              <span>Step 4: Download Your Credentials</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-gray-900">
              Ready to Download {recipients.length} Certificate{recipients.length > 1 ? "s" : ""}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Please enter your details to receive your free high-resolution PDF download.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleGenerateAndDownload} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Smith"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Company / Work Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Organization / Academy Name
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Tech University"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 shrink-0"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-snug">
                I agree to receive the generated certificates and helpful product updates from Zikoro. You can unsubscribe at any time.
              </label>
            </div>

            <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={isGenerating}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Recipients</span>
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow-md transition disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    <span>{progressText || "Generating..."}</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span>Download Free PDF ({recipients.length})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
