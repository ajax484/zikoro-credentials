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

      // 2. Client-side PDF Generation with jsPDF & Fabric
      const width = canvasData.width || 900;
      const height = canvasData.height || 600;
      const orientation = width >= height ? "l" : "p";

      const pdf = new jsPDF({
        orientation,
        unit: "pt",
        format: [width, height],
      });

      // Create hidden offscreen canvas for rendering
      const offscreenEl = document.createElement("canvas");
      offscreenEl.width = width;
      offscreenEl.height = height;

      const offscreenCanvas = new fabric.Canvas(offscreenEl, {
        width,
        height,
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

        // Load into offscreen canvas and wait for render
        await new Promise<void>((resolve) => {
          offscreenCanvas.loadFromJSON(personalizedJson, () => {
            // Also inspect objects in case text was directly named
            offscreenCanvas.getObjects().forEach((obj) => {
              if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
                const textObj = obj as fabric.Textbox;
                if (
                  textObj.text &&
                  (textObj.text.includes("#{first_name}#}") ||
                    textObj.text.includes("Recipient Name") ||
                    textObj.text.toLowerCase().includes("sample recipient"))
                ) {
                  textObj.set("text", fullName);
                }
              }
            });

            offscreenCanvas.renderAll();
            resolve();
          });
        });

        // Capture data URL
        const pageDataUrl = offscreenCanvas.toDataURL({
          format: "png",
          quality: 0.95,
        });

        if (i > 0) {
          pdf.addPage([width, height], orientation);
        }
        pdf.addImage(pageDataUrl, "PNG", 0, 0, width, height);
      }

      offscreenCanvas.dispose();

      setProgressText("Finalizing PDF file...");
      pdf.save(`zikoro-certificates-${Date.now()}.pdf`);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {isSuccess ? (
        /* Success & Conversion State */
        <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="size-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="size-9 stroke-[2.5]" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Your Certificates Have Been Downloaded!
            </h2>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              Check your browser's download folder for your personalized PDF batch of{" "}
              <strong>{recipients.length} certificate(s)</strong>.
            </p>
          </div>

          {/* Upsell / Value-Add Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-purple-600" />
              <h3 className="font-bold text-gray-900 text-sm">
                Unlock Verifiable Credentials With Zikoro
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Standard PDFs can be easily altered or faked. With a free Zikoro workspace, your credentials become tamper-proof digital assets:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                <QrCode className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 font-medium">
                  Dynamic QR Code verification page
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                <Share2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 font-medium">
                  1-click LinkedIn badge sharing
                </span>
              </div>
              <div className="flex items-start gap-2 bg-white p-3 rounded-xl border border-purple-100 shadow-xs">
                <ShieldCheck className="size-4 text-purple-600 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 font-medium">
                  Automated email delivery & analytics
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow transition"
              >
                <span>Create Free Workspace</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <span className="text-[11px] text-gray-400">
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
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200">
              <Sparkles className="size-3.5" />
              <span>Step 4: Download Your Credentials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 size-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-snug">
                I agree to receive the generated certificates and helpful product updates from Zikoro. You can unsubscribe at any time.
              </label>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                <ArrowLeft className="size-3.5" />
                <span>Back to Recipients</span>
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow-md transition disabled:opacity-50"
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
