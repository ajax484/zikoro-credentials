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
import { JSON_KEYS } from "@/components/editor/types";

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

  // Mobile view tab state ("form" or "canvas") - default to "canvas" as requested
  const [mobileTab, setMobileTab] = useState<"form" | "canvas">("canvas");

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
    const json = JSON.stringify(fabricCanvasRef.current.toJSON(JSON_KEYS));
    // Truncate future states if we were in the middle of undo stack
    const nextHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    nextHistory.push(json);
    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  // Fit canvas into container view with exact workspace centering
  const fitCanvasToContainer = useCallback((canvas: fabric.Canvas, container: HTMLDivElement) => {
    if (!container || container.clientWidth <= 0 || container.clientHeight <= 0) return;
    const padding = typeof window !== "undefined" && window.innerWidth < 640 ? 16 : 36;
    const containerWidth = container.clientWidth - padding;
    const containerHeight = container.clientHeight - padding;
    if (containerWidth <= 0 || containerHeight <= 0) return;

    // Find the primary certificate workspace/clip rectangle
    const localWorkspace = canvas.getObjects().find((obj) => obj.name === "clip");

    const originalWidth = localWorkspace
      ? (localWorkspace.width || 900) * (localWorkspace.scaleX || 1)
      : template.JSON?.width || 900;
    const originalHeight = localWorkspace
      ? (localWorkspace.height || 600) * (localWorkspace.scaleY || 1)
      : template.JSON?.height || 600;

    const scale = Math.min(containerWidth / originalWidth, containerHeight / originalHeight, 1.2);
    const targetWidth = Math.round(originalWidth * scale);
    const targetHeight = Math.round(originalHeight * scale);

    canvas.setDimensions({
      width: targetWidth,
      height: targetHeight,
    });

    const vt: number[] = [scale, 0, 0, scale, 0, 0];
    if (localWorkspace) {
      const workspaceCenter = localWorkspace.getCenterPoint();
      vt[4] = targetWidth / 2 - workspaceCenter.x * scale;
      vt[5] = targetHeight / 2 - workspaceCenter.y * scale;
    }
    canvas.setViewportTransform(vt);
    setZoomLevel(scale);
    canvas.renderAll();
  }, [template.JSON?.width, template.JSON?.height]);

  // Apply custom zoom level with workspace centering
  const applyZoom = useCallback((newScale: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const boundedZoom = Math.min(Math.max(newScale, 0.2), 3);
    const localWorkspace = canvas.getObjects().find((obj) => obj.name === "clip");
    const originalWidth = localWorkspace
      ? (localWorkspace.width || 900) * (localWorkspace.scaleX || 1)
      : template.JSON?.width || 900;
    const originalHeight = localWorkspace
      ? (localWorkspace.height || 600) * (localWorkspace.scaleY || 1)
      : template.JSON?.height || 600;

    const targetWidth = Math.round(originalWidth * boundedZoom);
    const targetHeight = Math.round(originalHeight * boundedZoom);

    canvas.setDimensions({
      width: targetWidth,
      height: targetHeight,
    });

    const vt: number[] = [boundedZoom, 0, 0, boundedZoom, 0, 0];
    if (localWorkspace) {
      const workspaceCenter = localWorkspace.getCenterPoint();
      vt[4] = targetWidth / 2 - workspaceCenter.x * boundedZoom;
      vt[5] = targetHeight / 2 - workspaceCenter.y * boundedZoom;
    }
    canvas.setViewportTransform(vt);
    setZoomLevel(boundedZoom);
    canvas.renderAll();
  }, [template.JSON?.width, template.JSON?.height]);

  // Switch mobile tab and re-fit canvas
  const switchMobileTab = (tab: "form" | "canvas") => {
    setMobileTab(tab);
    if (tab === "canvas") {
      setTimeout(() => {
        if (fabricCanvasRef.current && containerRef.current) {
          fitCanvasToContainer(fabricCanvasRef.current, containerRef.current);
        }
      }, 60);
    }
  };

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
        if (containerRef.current) {
          fitCanvasToContainer(canvas, containerRef.current);
        } else {
          canvas.renderAll();
        }
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
  }, [template, pushHistory, onCanvasReady, fitCanvasToContainer]);

  // Zoom controls
  const handleZoom = (delta: number) => {
    applyZoom(zoomLevel + delta);
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
      if (containerRef.current) {
        fitCanvasToContainer(canvas, containerRef.current);
      } else {
        canvas.renderAll();
      }
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
      if (containerRef.current) {
        fitCanvasToContainer(canvas, containerRef.current);
      } else {
        canvas.renderAll();
      }
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    });
  };

  // Delete active object(s) - text, signatures, logos, etc.
  const handleDeleteSelected = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects && activeObjects.length > 0) {
      activeObjects.forEach((obj) => {
        if (obj.name !== "clip") {
          canvas.remove(obj);
        }
      });
    } else {
      const single = canvas.getActiveObject();
      if (single && single.name !== "clip") {
        canvas.remove(single);
      }
    }
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
    pushHistory();
  }, [pushHistory]);

  // Global keyboard listener for Backspace / Delete keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        const activeObj = canvas.getActiveObject();
        if (activeObj && (activeObj as any).isEditing) {
          return;
        }
        if (activeObj && activeObj.name !== "clip") {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected]);

  // Add Freeform Text
  // Add Freeform Text centered on workspace
  const handleAddText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
    const wsCenter = workspace
      ? workspace.getCenterPoint()
      : { x: (template.JSON?.width || 900) / 2, y: (template.JSON?.height || 600) / 2 };

    const text = new fabric.Textbox("Enter Text Here", {
      left: wsCenter.x,
      top: wsCenter.y,
      originX: "center",
      originY: "center",
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

  // Quick form update to canvas with workspace-aware placement
  const applyQuickField = (
    textValue: string,
    identifierKeywords: string[],
    defaultPlacement?: { topRatio: number; fontSize: number; isBold?: boolean; color?: string }
  ) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
    const wsWidth = workspace
      ? (workspace.width || 900) * (workspace.scaleX || 1)
      : template.JSON?.width || 900;
    const wsHeight = workspace
      ? (workspace.height || 600) * (workspace.scaleY || 1)
      : template.JSON?.height || 600;
    const wsLeft = workspace ? workspace.left || 0 : 0;
    const wsTop = workspace ? workspace.top || 0 : 0;
    const wsCenter = workspace ? workspace.getCenterPoint() : { x: wsWidth / 2, y: wsHeight / 2 };

    const objects = canvas.getObjects();
    const targetObj = objects.find((obj) => {
      if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
        const text = ((obj as fabric.Textbox).text || "").toLowerCase();
        return identifierKeywords.some((kw) => text.includes(kw.toLowerCase()));
      }
      return false;
    }) as fabric.Textbox | undefined;

    if (targetObj) {
      targetObj.set("text", textValue);
      canvas.setActiveObject(targetObj);
      canvas.renderAll();
      pushHistory();
    } else {
      const topRatio = defaultPlacement?.topRatio ?? 0.35;
      const text = new fabric.Textbox(textValue, {
        left: wsCenter.x,
        top: wsTop + wsHeight * topRatio,
        originX: "center",
        fontSize: defaultPlacement?.fontSize ?? 22,
        fontWeight: defaultPlacement?.isBold ? "bold" : "normal",
        fontFamily: "Arial",
        fill: defaultPlacement?.color ?? "#1f2937",
        textAlign: "center",
        width: Math.min(420, wsWidth * 0.75),
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      pushHistory();
    }

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      switchMobileTab("canvas");
    }
  };

  // Dedicated Apply Signatory handler (both Name and Title)
  const applySignatory = (name: string, title: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
    const wsWidth = workspace
      ? (workspace.width || 900) * (workspace.scaleX || 1)
      : template.JSON?.width || 900;
    const wsHeight = workspace
      ? (workspace.height || 600) * (workspace.scaleY || 1)
      : template.JSON?.height || 600;
    const wsLeft = workspace ? workspace.left || 0 : 0;
    const wsTop = workspace ? workspace.top || 0 : 0;
    const wsCenter = workspace ? workspace.getCenterPoint() : { x: wsWidth / 2, y: wsHeight / 2 };

    const objects = canvas.getObjects();

    // 1. Find or create Signatory Name
    const nameKeywords = [
      "signatory",
      "signature",
      "instructor",
      "director",
      "authorized",
      "president",
      "ceo",
      "founder",
      "jane doe",
    ];
    let nameObj = objects.find((obj) => {
      if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
        const text = ((obj as fabric.Textbox).text || "").toLowerCase();
        return (
          nameKeywords.some((kw) => text.includes(kw)) &&
          !text.includes("director of") &&
          !text.includes("title")
        );
      }
      return false;
    }) as fabric.Textbox | undefined;

    if (nameObj) {
      nameObj.set("text", name);
    } else {
      nameObj = new fabric.Textbox(name, {
        left: wsCenter.x,
        top: wsTop + wsHeight * 0.78,
        originX: "center",
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "Arial",
        fill: "#1f2937",
        textAlign: "center",
      });
      canvas.add(nameObj);
    }

    // 2. Find or create Signatory Title
    const titleKeywords = [
      "title",
      "position",
      "director of",
      "lead instructor",
      "co-founder",
      "manager",
    ];
    let titleObj = objects.find((obj) => {
      if (obj.type === "textbox" || obj.type === "text" || obj.type === "i-text") {
        const text = ((obj as fabric.Textbox).text || "").toLowerCase();
        return (
          (titleKeywords.some((kw) => text.includes(kw)) || text.includes("director")) &&
          obj !== nameObj
        );
      }
      return false;
    }) as fabric.Textbox | undefined;

    if (titleObj) {
      titleObj.set("text", title);
    } else {
      titleObj = new fabric.Textbox(title, {
        left: wsCenter.x,
        top: wsTop + wsHeight * 0.84,
        originX: "center",
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#6b7280",
        textAlign: "center",
      });
      canvas.add(titleObj);
    }

    canvas.setActiveObject(nameObj);
    canvas.renderAll();
    pushHistory();

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      switchMobileTab("canvas");
    }
  };

  // Logo upload handler placed neatly in certificate workspace
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const imgEl = new window.Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
        const wsWidth = workspace
          ? (workspace.width || 900) * (workspace.scaleX || 1)
          : template.JSON?.width || 900;
        const wsHeight = workspace
          ? (workspace.height || 600) * (workspace.scaleY || 1)
          : template.JSON?.height || 600;
        const wsLeft = workspace ? workspace.left || 0 : 0;
        const wsTop = workspace ? workspace.top || 0 : 0;

        const fabricImg = new fabric.Image(imgEl);
        const targetWidth = Math.min(130, wsWidth * 0.18);
        fabricImg.scaleToWidth(targetWidth);

        fabricImg.set({
          left: wsLeft + Math.max(40, wsWidth * 0.08),
          top: wsTop + Math.max(30, wsHeight * 0.06),
        });

        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        pushHistory();

        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          switchMobileTab("canvas");
        }
      };
      imgEl.src = data;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Signature image upload handler placed in signature area of workspace
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target?.result as string;
      const imgEl = new window.Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
        const wsWidth = workspace
          ? (workspace.width || 900) * (workspace.scaleX || 1)
          : template.JSON?.width || 900;
        const wsHeight = workspace
          ? (workspace.height || 600) * (workspace.scaleY || 1)
          : template.JSON?.height || 600;
        const wsLeft = workspace ? workspace.left || 0 : 0;
        const wsTop = workspace ? workspace.top || 0 : 0;
        const wsCenter = workspace ? workspace.getCenterPoint() : { x: wsWidth / 2, y: wsHeight / 2 };

        const fabricImg = new fabric.Image(imgEl);
        const targetWidth = Math.min(180, wsWidth * 0.22);
        fabricImg.scaleToWidth(targetWidth);

        fabricImg.set({
          left: wsCenter.x - fabricImg.getScaledWidth() / 2,
          top: wsTop + wsHeight * 0.68,
        });

        canvas.add(fabricImg);
        canvas.setActiveObject(fabricImg);
        canvas.renderAll();
        pushHistory();

        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          switchMobileTab("canvas");
        }
      };
      imgEl.src = data;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Signature drawing pad handlers with touch coordinate scaling
  const getPadCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pad = sigPadCanvasRef.current;
    if (!pad) return { x: 0, y: 0 };
    const rect = pad.getBoundingClientRect();
    const clientX = "touches" in e && e.touches.length > 0 ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e && e.touches.length > 0 ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = pad.width / rect.width;
    const scaleY = pad.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ("touches" in e) {
      e.preventDefault();
    }
    const pad = sigPadCanvasRef.current;
    if (!pad) return;
    const ctx = pad.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getPadCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ("touches" in e) {
      e.preventDefault();
    }
    const pad = sigPadCanvasRef.current;
    if (!pad) return;
    const ctx = pad.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPadCoordinates(e);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111827";
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

    const imgEl = new window.Image();
    imgEl.onload = () => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      const workspace = canvas.getObjects().find((obj) => obj.name === "clip");
      const wsWidth = workspace
        ? (workspace.width || 900) * (workspace.scaleX || 1)
        : template.JSON?.width || 900;
      const wsHeight = workspace
        ? (workspace.height || 600) * (workspace.scaleY || 1)
        : template.JSON?.height || 600;
      const wsLeft = workspace ? workspace.left || 0 : 0;
      const wsTop = workspace ? workspace.top || 0 : 0;
      const wsCenter = workspace ? workspace.getCenterPoint() : { x: wsWidth / 2, y: wsHeight / 2 };

      const fabricImg = new fabric.Image(imgEl);
      const targetWidth = Math.min(180, wsWidth * 0.22);
      fabricImg.scaleToWidth(targetWidth);

      fabricImg.set({
        left: wsCenter.x - fabricImg.getScaledWidth() / 2,
        top: wsTop + wsHeight * 0.68,
      });

      canvas.add(fabricImg);
      canvas.setActiveObject(fabricImg);
      canvas.renderAll();
      pushHistory();
      setIsSignatureModalOpen(false);

      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        switchMobileTab("canvas");
      }
    };
    imgEl.src = dataUrl;
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
    const canvas = fabricCanvasRef.current;
    const localWorkspace = canvas.getObjects().find((obj) => obj.name === "clip");
    const originalWidth = localWorkspace
      ? (localWorkspace.width || 900) * (localWorkspace.scaleX || 1)
      : template.JSON?.width || 900;
    const originalHeight = localWorkspace
      ? (localWorkspace.height || 600) * (localWorkspace.scaleY || 1)
      : template.JSON?.height || 600;

    const currentVT = canvas.viewportTransform?.slice() || [1, 0, 0, 1, 0, 0];
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const canvasJson = canvas.toJSON(JSON_KEYS);
    canvas.setViewportTransform(currentVT);

    onContinue({
      json: canvasJson,
      width: originalWidth,
      height: originalHeight,
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] sm:h-[calc(100vh-65px)] bg-gray-100 overflow-hidden">
      {/* Top Action & Mobile Viewport Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0 shadow-sm z-20">
        {/* Navigation / Back */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <span className="text-xs font-semibold text-gray-800 truncate max-w-[100px] sm:max-w-[180px]">
            {template.name || "Certificate"}
          </span>
        </div>

        {/* Mobile View Switcher Tabs (Visible on < lg screens) */}
        <div className="flex lg:hidden items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 shrink-0">
          <button
            onClick={() => switchMobileTab("form")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
              mobileTab === "form"
                ? "bg-white text-purple-700 font-bold shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Quick Form
          </button>
          <button
            onClick={() => switchMobileTab("canvas")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
              mobileTab === "canvas"
                ? "bg-white text-purple-700 font-bold shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>Live Canvas</span>
            <span className="size-1.5 rounded-full bg-purple-600 animate-pulse" />
          </button>
        </div>

        {/* Primary Next CTA */}
        <button
          onClick={handleProceed}
          className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end rounded-lg hover:opacity-95 shadow transition shrink-0"
        >
          <span className="hidden sm:inline">Continue to Recipients</span>
          <span className="inline sm:hidden">Recipients</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      {/* Main Workspace: Left Quick-Form + Right Interactive Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar: Quick-Form Inputs & Asset Uploads */}
        <aside
          className={`bg-white border-r border-gray-200 flex-col shrink-0 overflow-y-auto z-10 shadow-sm ${
            mobileTab === "form" ? "flex w-full" : "hidden"
          } lg:flex lg:w-80 xl:w-96`}
        >
          <div className="p-3.5 sm:p-4 border-b border-gray-100 bg-gray-50/70">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-purple-600" />
              Quick Form & Assets
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Edit fields below to customize text, signatures, and logos.
            </p>
          </div>

          <div className="p-3.5 sm:p-4 space-y-4">
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
                  onClick={() =>
                    applyQuickField(
                      certTitle,
                      ["certificate", "achievement", "completion", "title", "award", "diploma"],
                      { topRatio: 0.16, fontSize: 26, isBold: true, color: "#111827" }
                    )
                  }
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 shrink-0 transition"
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
                  onClick={() =>
                    applyQuickField(
                      recipientPreview,
                      ["recipient", "first_name", "john", "name", "holder", "student", "candidate"],
                      { topRatio: 0.42, fontSize: 32, isBold: true, color: "#7c3aed" }
                    )
                  }
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 shrink-0 transition"
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
                  onClick={() =>
                    applyQuickField(
                      orgName,
                      ["organization", "academy", "company", "issuer", "institute", "school", "university"],
                      { topRatio: 0.08, fontSize: 16, isBold: true, color: "#4b5563" }
                    )
                  }
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 shrink-0 transition"
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
                  onClick={() =>
                    applyQuickField(
                      issueDate,
                      ["date", "issue date", "day of", "issued on", "year"],
                      { topRatio: 0.86, fontSize: 13, color: "#6b7280" }
                    )
                  }
                  className="px-2 py-1 text-[11px] font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 shrink-0 transition"
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
                  applySignatory(signatoryName, signatoryTitle);
                }}
                className="col-span-2 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition active:scale-[0.99] flex items-center justify-center gap-1.5"
              >
                <span>Apply Signatory to Canvas</span>
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

            {/* Mobile View Canvas Helper */}
            <div className="lg:hidden pt-2">
              <button
                onClick={() => switchMobileTab("canvas")}
                className="w-full py-2.5 bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
              >
                <span>Preview & Drag on Canvas</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Center / Canvas Viewport with dedicated responsive Toolbar */}
        <main
          className={`flex-col flex-1 bg-gray-200/80 overflow-hidden relative ${
            mobileTab === "canvas" ? "flex" : "hidden"
          } lg:flex`}
        >
          {/* Responsive Canvas Action Toolbar */}
          <div className="bg-white border-b border-gray-200 px-3 py-1.5 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0 shadow-xs z-10">
            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Undo"
              >
                <RotateCcw className="size-3.5 sm:size-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Redo"
              >
                <RotateCw className="size-3.5 sm:size-4" />
              </button>
            </div>

            <span className="text-gray-300 shrink-0">|</span>

            {/* Add Text Element */}
            <button
              onClick={handleAddText}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-md transition border border-gray-200 shrink-0"
            >
              <Type className="size-3.5 text-purple-600" />
              <span>Add Text</span>
            </button>

            {/* Typography formatting for active text object */}
            {selectedObject &&
              (selectedObject.type === "textbox" ||
                selectedObject.type === "text" ||
                selectedObject.type === "i-text") && (
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-1.5 py-0.5 shrink-0">
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
                    className="w-11 text-xs border border-gray-300 rounded px-1 py-0.5 text-center"
                  />

                  {/* Text Color */}
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      updateActiveTextProp("fill", e.target.value);
                    }}
                    className="size-5 rounded border border-gray-300 cursor-pointer p-0.5"
                    title="Text Color"
                  />

                  {/* Alignment */}
                  <button
                    onClick={() => {
                      setTextAlign("left");
                      updateActiveTextProp("textAlign", "left");
                    }}
                    className={`p-1 rounded ${textAlign === "left" ? "bg-white shadow-xs" : ""}`}
                  >
                    <AlignLeft className="size-3" />
                  </button>
                  <button
                    onClick={() => {
                      setTextAlign("center");
                      updateActiveTextProp("textAlign", "center");
                    }}
                    className={`p-1 rounded ${textAlign === "center" ? "bg-white shadow-xs" : ""}`}
                  >
                    <AlignCenter className="size-3" />
                  </button>
                  <button
                    onClick={() => {
                      setTextAlign("right");
                      updateActiveTextProp("textAlign", "right");
                    }}
                    className={`p-1 rounded ${textAlign === "right" ? "bg-white shadow-xs" : ""}`}
                  >
                    <AlignRight className="size-3" />
                  </button>
                </div>
              )}

            {/* Selected Image/Asset badge */}
            {selectedObject && selectedObject.type === "image" && selectedObject.name !== "clip" && (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg px-2.5 py-1 text-xs font-medium shrink-0">
                <span className="size-1.5 rounded-full bg-purple-600" />
                <span>Selected: Signature / Image</span>
              </div>
            )}

            {/* Universal Delete button for ANY selected object */}
            {selectedObject && selectedObject.name !== "clip" && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition shrink-0 shadow-2xs active:scale-[0.98]"
                title="Delete selected item (or press Delete / Backspace key)"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Delete</span>
                <span className="inline sm:hidden">Del</span>
              </button>
            )}

            <div className="ml-auto flex items-center gap-1 shrink-0">
              {/* Zoom Controls */}
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-1 rounded hover:bg-gray-100 text-gray-600"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5 sm:size-4" />
              </button>
              <span className="text-[11px] text-gray-500 font-mono w-8 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.1)}
                className="p-1 rounded hover:bg-gray-100 text-gray-600"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5 sm:size-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1 rounded hover:bg-gray-100 text-gray-600"
                title="Fit to Screen"
              >
                <Maximize2 className="size-3.5 sm:size-4" />
              </button>
            </div>
          </div>

          {/* Canvas interactive render container */}
          <div
            ref={containerRef}
            className="flex-1 flex items-center justify-center p-2 sm:p-6 overflow-auto relative select-none w-full"
          >
            <div className="shadow-xl rounded-sm bg-white overflow-hidden border border-gray-300">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </main>
      </div>

      {/* Signature Drawing Modal */}
      {isSignatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Draw Your Signature</h3>
              <button
                onClick={() => setIsSignatureModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden w-full">
              <canvas
                ref={sigPadCanvasRef}
                width={360}
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
                  className="text-xs px-3.5 sm:px-4 py-1.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 shadow-sm"
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
