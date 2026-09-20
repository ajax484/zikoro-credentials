"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CertificateTemplate } from "@/types/certificates";
import { useFetchCertificateTemplates } from "@/queries/certificates.queries";
import dynamic from "next/dynamic";
import { GeneratorHeader } from "@/components/certificate-generator/GeneratorHeader";
import { TemplateSelector } from "@/components/certificate-generator/TemplateSelector";
import { RecipientManager, RecipientItem } from "@/components/certificate-generator/RecipientManager";

const CanvasEditor = dynamic(
  () =>
    import("@/components/certificate-generator/CanvasEditor").then(
      (mod) => mod.CanvasEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="animate-spin size-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    ),
  }
);

const DownloadGate = dynamic(
  () =>
    import("@/components/certificate-generator/DownloadGate").then(
      (mod) => mod.DownloadGate
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center p-20">
        <div className="animate-spin size-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    ),
  }
);

function CertificateGeneratorContent() {
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get("templateId");

  const { data: templates = [] } = useFetchCertificateTemplates();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [canvasData, setCanvasData] = useState<{
    json: any;
    width: number;
    height: number;
  } | null>(null);

  // Default sample recipient so testing is instant
  const [recipients, setRecipients] = useState<RecipientItem[]>([
    {
      id: "rec-default",
      firstName: "Alex",
      lastName: "Morgan",
      email: "alex.morgan@example.com",
    },
  ]);

  // Handle templateId query parameter
  useEffect(() => {
    if (templateIdParam && templates.length > 0 && !selectedTemplate) {
      const match = templates.find((t) => String(t.id) === templateIdParam);
      if (match) {
        setSelectedTemplate(match);
        setCurrentStep(2);
      }
    }
  }, [templateIdParam, templates, selectedTemplate]);

  // Stepper navigation permissions
  const canNavigateToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return !!selectedTemplate;
    if (step === 3) return !!selectedTemplate && !!canvasData;
    if (step === 4) return !!selectedTemplate && !!canvasData && recipients.length > 0;
    return false;
  };

  // Step 1: Select template and proceed
  const handleSelectTemplate = (template: CertificateTemplate) => {
    setSelectedTemplate(template);
    // Initialize canvas data
    setCanvasData({
      json: template.JSON,
      width: template.JSON?.width || 900,
      height: template.JSON?.height || 600,
    });
  };

  const handleTemplateContinue = () => {
    if (!selectedTemplate) return;
    if (!canvasData) {
      setCanvasData({
        json: selectedTemplate.JSON,
        width: selectedTemplate.JSON?.width || 900,
        height: selectedTemplate.JSON?.height || 600,
      });
    }
    setCurrentStep(2);
  };

  // Step 2: Save canvas data and proceed
  const handleCanvasContinue = (updatedCanvasData: {
    json: any;
    width: number;
    height: number;
  }) => {
    setCanvasData(updatedCanvasData);
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Header with 4-step indicator */}
      <GeneratorHeader
        currentStep={currentStep}
        setStep={setCurrentStep}
        canNavigateToStep={canNavigateToStep}
      />

      {/* Wizard Steps */}
      <main className="flex-1 flex flex-col w-full max-w-full min-w-0">
        {currentStep === 1 && (
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleSelectTemplate}
            onContinue={handleTemplateContinue}
          />
        )}

        {currentStep === 2 && selectedTemplate && (
          <CanvasEditor
            template={selectedTemplate}
            onBack={() => setCurrentStep(1)}
            onContinue={handleCanvasContinue}
          />
        )}

        {currentStep === 3 && (
          <RecipientManager
            recipients={recipients}
            setRecipients={setRecipients}
            onBack={() => setCurrentStep(2)}
            onContinue={() => setCurrentStep(4)}
            maxFreeLimit={10}
          />
        )}

        {currentStep === 4 && canvasData && (
          <DownloadGate
            canvasData={canvasData}
            recipients={recipients}
            onBack={() => setCurrentStep(3)}
          />
        )}
      </main>
    </div>
  );
}

export default function CertificateGeneratorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-purple-700">
          <div className="animate-spin size-8 border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CertificateGeneratorContent />
    </Suspense>
  );
}
