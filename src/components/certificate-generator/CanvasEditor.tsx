"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import {
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Type,
  Upload,
  PenTool,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Check,
  X,
  Layers,
} from "lucide-react";
import { CertificateTemplate } from "@/types/certificates";

interface CanvasEditorProps {
  template: CertificateTemplate;
  onBack: () => void;
  onContinue: (canvasData: any) => void;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  template,
  onBack,
  onContinue,
  onCanvasReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  // Quick form state
  const [certTitle, setCertTitle] = useState("Certificate of Achievement");
  const [recipientPreview, setRecipientPreview] = useState("#{first_name}#} #{last_name}#}");
  const [orgName, setOrgName] = useState("Zikoro Academy");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [signatoryName, setSignatoryName] = useState("Jane Doe");
  const [signatoryTitle, setSignatoryTitle] = useState("Director of Education");

  // Active object state for toolbar
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#000000");
  const [textAlign, setTextAlign] = useState("center");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Signature pad modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const sigPadCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // History state
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Record history
  const pushHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    // Truncate future states if we were in the middle of undo stack
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(json);
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = template.JSON?.width || 900;
    const height = template.JSON?.height || 600;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      selection: true,
    });

    fabricCanvasRef.current = canvas;
    if (onCanvasReady) onCanvasReady(canvas);

    // Load template JSON
    const templateData = template.JSON;
    if (templateData) {
      canvas.loadFromJSON(templateData, () => {
        canvas.renderAll();
        fitCanvasToContainer(canvas, containerRef.current!);
        pushHistory();
      });
    } else {
      pushHistory();
    }

    // Selection events
    const handleSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedObject(active || null);
      if (active && (active.type === "textbox" || active.type === "text" || active.type === "i-text")) {
        const textObj = active as fabric.Textbox;
        setFontFamily(textObj.fontFamily || "Arial");
        setFontSize(textObj.fontSize || 24);
        setTextColor((textObj.fill as string) || "#000000");
        setTextAlign(textObj.textAlign || "center");
      }
    };

    canvas.on("selection:created", handleSelection);
    canvas.on("selection:updated", handleSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    canvas.on("object:modified", pushHistory);
    canvas.on("object:added", pushHistory);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (fabricCanvasRef.current && containerRef.current) {
        fitCanvasToContainer(fabricCanvasRef.current, containerRef.current);
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [template, pushHistory, onCanvasReady]);

  // Fit canvas into container view
  const fitCanvasToContainer = (canvas: fabric.Canvas, container: HTMLDivElement) => {
    const containerWidth = container.clientWidth - 48; // padding
    const containerHeight = container.clientHeight - 48;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    const originalWidth = template.JSON?.width || 900;
    const originalHeight = template.JSON?.height || 600;

    const scale = Math.min(containerWidth / originalWidth, containerHeight / originalHeight, 1.2);
    canvas.setDimensions({
      width: originalWidth * scale,
      height: originalHeight * scale,
    });
    canvas.setZoom(scale);
    setZoomLevel(scale);
    canvas.renderAll();
  };

  // Zoom controls
  const handleZoom = (delta: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    let newZoom = canvas.getZoom() + delta;
    newZoom = Math.min(Math.max(newZoom, 0.2), 3);
    const originalWidth = template.JSON?.width || 900;
    const originalHeight = template.JSON?.height || 600;
    canvas.setDimensions({
      width: originalWidth * newZoom,
      height: originalHeight * newZoom,
    });
    canvas.setZoom(newZoom);
    setZoomLevel(newZoom);
    canvas.renderAll();
  };

  const handleZoomReset = () => {
    if (fabricCanvasRef.current && containerRef.current) {
      fitCanvasToContainer(fabricCanvasRef.current, containerRef.current);
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    const state = historyRef.current[historyIndexRef.current];
    canvas.loadFromJSON(JSON.parse(state), () => {
      canvas.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  };

  const handleRedo = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    const state = historyRef.current[historyIndexRef.current];
    canvas.loadFromJSON(JSON.parse(state), () => {
      canvas.renderAll();
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  };

  // Delete active object
  const handleDeleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    pushHistory();
  };

  // Add Freeform Text
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const text = new fabric.Textbox("Enter Text Here", {
      left: 100,
      top: 100,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "#1f2937",
      textAlign: "center",
      width: 250,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    pushHistory();
  };

  // Quick form update to canvas
  const applyQuickField = (textValue: string, identifierKeywords: string[]) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    // Try to find a text object that contains one of the keywords
    const targetObj = objects.find((obj) => {
      if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
        const text = ((obj as fabric.Textbox).text || "").toLowerCase();
        return identifierKeywords.some((kw) => text.includes(kw.toLowerCase()));
      }
      return false;
    }) as fabric.Textbox | undefined;

    if (targetObj) {
      targetObj.set("text", textValue);
      canvas.renderAll();
      pushHistory();
    } else {
      // If not found, add as a new text box
      const text = new fabric.Textbox(textValue, {
        left: 150,
        top: 200,
        fontSize: 22,
        fontFamily: "Arial",
        fill: "#1f2937",
        textAlign: "center",
      });
      canvas.add(text);
      canvas.renderAll();
      pushHistory();
    }
  };

  // Logo upload handler
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data, (img) => {
        img.scaleToWidth(120);
        img.set({
          left: 60,
          top: 60,
        });
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        fabricCanvasRef.current?.renderAll();
        pushHistory();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Signature image upload handler
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      fabric.Image.fromURL(data, (img) => {
        img.scaleToWidth(140);
        img.set({
          left: (fabricCanvasRef.current?.width || 900) / 2 - 70,
          top: (fabricCanvasRef.current?.height || 600) - 150,
        });
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.setActiveObject(img);
        fabricCanvasRef.current?.renderAll();
        pushHistory();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Signature drawing pad handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pad = sigPadCanvasRef.current;
    if (!pad) return;
    const ctx = pad.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = pad.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pad = sigPadCanvasRef.current;
    if (!pad) return;
    const ctx = pad.getContext("2d");
    if (!ctx) return;

    const rect = pad.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignaturePad = () => {
    const pad = sigPadCanvasRef.current;
    if (!pad) return;
    const ctx = pad.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, pad.width, pad.height);
  };

  const insertDrawnSignature = () => {
    const pad = sigPadCanvasRef.current;
    if (!pad || !fabricCanvasRef.current) return;
    const dataUrl = pad.toDataURL("image/png");

    fabric.Image.fromURL(dataUrl, (img) => {
      img.scaleToWidth(140);
      img.set({
        left: (fabricCanvasRef.current?.width || 900) / 2 - 70,
        top: (fabricCanvasRef.current?.height || 600) - 150,
      });
      fabricCanvasRef.current?.add(img);
      fabricCanvasRef.current?.setActiveObject(img);
      fabricCanvasRef.current?.renderAll();
      pushHistory();
      setIsSignatureModalOpen(false);
    });
  };

  // Text formatting helpers for active object
  const updateActiveTextProp = (prop: string, val: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !selectedObject) return;
    if (selectedObject.type === "textbox" || selectedObject.type === "text" || selectedObject.type === "i-text") {
      selectedObject.set(prop as any, val);
      canvas.renderAll();
      pushHistory();
    }
  };

  // Complete customization and proceed to Recipients
  const handleProceed = () => {
    if (!fabricCanvasRef.current) return;
    // Save unzoomed canonical JSON
    const currentZoom = fabricCanvasRef.current.getZoom();
    fabricCanvasRef.current.setZoom(1);
    const canvasJson = fabricCanvasRef.current.toJSON();
    fabricCanvasRef.current.setZoom(currentZoom);

    onContinue({
      json: canvasJson,
      width: template.JSON?.width || 900,
      height: template.JSON?.height || 600,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-gray-100 overflow-hidden">
      {/* Top Action & Formatting Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-sm z-10">
        {/* Navigation / Back */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="size-3.5" />
            <span>Templates</span>
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-xs font-semibold text-gray-800 truncate max-w-[140px] sm:max-w-[200px]">
            {template.name || "Certificate"}
          </span>
        </div>

        {/* Canvas Toolbar Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo"
          >
            <RotateCw className="size-4" />
          </button>

          <span className="text-gray-300">|</span>

          {/* Add Text Element */}
          <button
            onClick={handleAddText}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition border border-gray-200"
          >
            <Type className="size-3.5 text-purple-600" />
            <span>Add Text</span>
          </button>

          {/* If text object is selected, show typography tools */}
          {selectedObject &&
            (selectedObject.type === "textbox" ||
              selectedObject.type === "text" ||
              selectedObject.type === "i-text") && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                {/* Font Family */}
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    updateActiveTextProp("fontFamily", e.target.value);
                  }}
                  className="text-xs border-0 bg-transparent focus:ring-0 text-gray-700 font-medium py-0.5"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Impact">Impact</option>
                </select>

                {/* Font Size */}
                <input
                  type="number"
                  min="8"
                  max="120"
                  value={fontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 24;
                    setFontSize(val);
                    updateActiveTextProp("fontSize", val);
                  }}
                  className="w-12 text-xs border border-gray-300 rounded px-1 py-0.5 text-center"
                />

                {/* Text Color */}
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => {
                    setTextColor(e.target.value);
                    updateActiveTextProp("fill", e.target.value);
                  }}
                  className="size-6 rounded border border-gray-300 cursor-pointer p-0.5"
                  title="Text Color"
                />

                {/* Alignment */}
                <button
                  onClick={() => {
                    setTextAlign("left");
                    updateActiveTextProp("textAlign", "left");
                  }}
                  className={`p-1 rounded ${textAlign === "left" ? "bg-white shadow-sm" : ""}`}
                >
                  <AlignLeft className="size-3.5" />
                </button>
                <button
                  onClick={() => {
                    setTextAlign("center");
                    updateActiveTextProp("textAlign", "center");
                  }}
                  className={`p-1 rounded ${textAlign === "center" ? "bg-white shadow-sm" : ""}`}
                >
                  <AlignCenter className="size-3.5" />
                </button>
                <button
                  onClick={() => {
                    setTextAlign("right");
                    updateActiveTextProp("textAlign", "right");
                  }}
                  className={`p-1 rounded ${textAlign === "right" ? "bg-white shadow-sm" : ""}`}
                >
                  <AlignRight className="size-3.5" />
                </button>
              </div>
            )}

          {/* Delete Button */}
          {selectedObject && (
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 rounded hover:bg-red-50 text-red-600 transition"
              title="Delete Selected Element"
            >
              <Trash2 className="size-4" />
            </button>
          )}

          <span className="text-gray-300">|</span>

          {/* Zoom */}
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="text-xs text-gray-500 font-mono w-9 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="Zoom In"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="Fit to Screen"
          >
            <Maximize2 className="size-4" />
          </button>
        </div>

        {/* Primary Next CTA */}
        <button
          onClick={handleProceed}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end rounded-lg hover:opacity-95 shadow transition"
        >
          <span>Continue to Recipients</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Main Workspace: Left Quick-Form + Right Interactive Canvas */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Quick-Form Inputs & Asset Uploads */}
        <aside className="w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto z-10 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50/70">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-purple-600" />
              Quick Form & Assets
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Edit fields below or click directly on any element on the certificate canvas.
            </p>
          </div>

          <div className="p-4 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Certificate Title
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={certTitle}
                  onChange={(e) => setCertTitle(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Certificate of Achievement"
                />
                <button
                  onClick={() => applyQuickField(certTitle, ["certificate", "achievement", "completion", "title"])}
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                  title="Update on Canvas"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Recipient Tag Preview */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Recipient Name Merge Tag
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={recipientPreview}
                  onChange={(e) => setRecipientPreview(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-purple-200 bg-purple-50/50 rounded-lg font-mono text-purple-900 focus:outline-none"
                />
                <button
                  onClick={() => applyQuickField(recipientPreview, ["recipient", "first_name", "john", "name", "holder"])}
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                >
                  Update
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                This variable automatically personalizes for each recipient in Step 3.
              </p>
            </div>

            {/* Organization / Issuer */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Organization / Issuer Name
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="e.g. Acme Academy"
                />
                <button
                  onClick={() => applyQuickField(orgName, ["organization", "academy", "company", "issuer", "institute"])}
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Issue Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Issue Date
              </label>
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
                <button
                  onClick={() => applyQuickField(issueDate, ["date", "issue date", "day of"])}
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
                >
                  Update
                </button>
              </div>
            </div>

            {/* Signatory Name & Title */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Signatory Name
                </label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="Director"
                />
              </div>
              <button
                onClick={() => {
                  applyQuickField(signatoryName, ["signatory", "instructor", "director", "signature"]);
                }}
                className="col-span-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
              >
                Apply Signatory to Canvas
              </button>
            </div>

            {/* Assets & Signatures */}
            <div className="pt-2 border-t border-gray-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Signatures & Logos
              </h3>

              {/* Signature buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsSignatureModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition"
                >
                  <PenTool className="size-3.5 text-purple-600" />
                  <span>Draw Signature</span>
                </button>

                <label className="flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition cursor-pointer">
                  <Upload className="size-3.5 text-purple-600" />
                  <span>Upload Signature</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSignatureUpload}
                  />
                </label>
              </div>

              {/* Logo upload */}
              <div>
                <label className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 border-2 border-dashed border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:border-purple-500 hover:text-purple-700 bg-gray-50 hover:bg-purple-50/50 transition cursor-pointer">
                  <Upload className="size-4" />
                  <span>Upload Organization Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Canvas Viewport */}
        <main
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-gray-200/80 p-6 overflow-auto relative select-none"
        >
          <div className="shadow-2xl rounded-sm bg-white overflow-hidden border border-gray-300">
            <canvas ref={canvasRef} />
          </div>
        </main>
      </div>

      {/* Signature Drawing Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Draw Your Signature</h3>
              <button
                onClick={() => setIsSignatureModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
              <canvas
                ref={sigPadCanvasRef}
                width={400}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 cursor-crosshair touch-none bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={clearSignaturePad}
                className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1"
              >
                Clear
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSignatureModalOpen(false)}
                  className="text-xs px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={insertDrawnSignature}
                  className="text-xs px-4 py-1.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-sm"
                >
                  Add to Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
