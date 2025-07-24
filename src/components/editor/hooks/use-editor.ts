import { fabric } from "fabric";
import { useCallback, useState, useMemo, useRef } from "react";
import {
  Editor,
  FILL_COLOR,
  STROKE_WIDTH,
  STROKE_COLOR,
  CIRCLE_OPTIONS,
  DIAMOND_OPTIONS,
  TRIANGLE_OPTIONS,
  BuildEditorProps,
  RECTANGLE_OPTIONS,
  EditorHookProps,
  STROKE_DASH_ARRAY,
  TEXT_OPTIONS,
  FONT_FAMILY,
  FONT_WEIGHT,
  FONT_SIZE,
  JSON_KEYS,
} from "@/components/editor/types";
import { useHistory } from "@/components/editor/hooks/use-history";
import {
  createFilter,
  downloadFile,
  isTextType,
  transformText,
} from "@/components/editor/utils";
import { useHotkeys } from "@/components/editor/hooks/use-hotkeys";
import { useClipboard } from "@/components/editor/hooks//use-clipboard";
import { useAutoResize } from "@/components/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/components/editor/hooks/use-canvas-events";
import { useWindowEvents } from "@/components/editor/hooks/use-window-events";
import { useLoadState } from "@/components/editor/hooks/use-load-state";
import jsPDF from "jspdf";
import {
  base64ToFile,
  generateAlphanumericHash,
  rgbaToHex,
  uploadFile,
} from "@/utils/helpers";
import { z } from "zod";
import { barCodeTypeEnum } from "../components/qrcode-sidebar";
import { AlignGuidelines } from "fabric-guideline-plugin";
import { nanoid } from "nanoid";

const buildEditor = ({
  save,
  undo,
  redo,
  canRedo,
  canUndo,
  autoZoom,
  copy,
  paste,
  canvas,
  fillColor,
  fontFamily,
  setFontFamily,
  setFillColor,
  strokeColor,
  setStrokeColor,
  strokeWidth,
  setStrokeWidth,
  selectedObjects,
  strokeDashArray,
  setStrokeDashArray,
  toggleQRCode,
}: BuildEditorProps): Editor => {
  const generateSaveOptions = () => {
    const { width, height, left, top } = getWorkspace() as fabric.Rect;

    return {
      name: "Image",
      format: "png",
      quality: 1,
      width,
      height,
      left,
      top,
    };
  };

  const savePdf = (
    {
      width,
      height,
    }: {
      width: number;
      height: number;
    },
    name?: string
  ) => {
    console.log(width, height);
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    const pdf = new jsPDF({
      orientation: width > height ? "l" : "p",
      unit: "pt",
      format: [options.width, options.height],
    });

    pdf.addImage(dataUrl, "png", 0, 0, width, height);
    pdf.save(name || "untitled.pdf");

    autoZoom();
  };

  const printPdf = (
    {
      width,
      height,
    }: {
      width: number;
      height: number;
    },
    name?: string
  ) => {
    console.log(width, height);
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    const pdf = new jsPDF({
      orientation: width > height ? "l" : "p",
      unit: "pt",
      format: [options.width, options.height],
    });

    pdf.addImage(dataUrl, "png", 0, 0, width, height);
    pdf.autoPrint({ variant: "non-conform" });
    pdf.save(name || "untitled.pdf");

    autoZoom();
  };

  const savePng = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "png");
    autoZoom();
  };

  const saveSvg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "svg");
    autoZoom();
  };

  const generateLinkAsync = async (next: (url: string) => void) => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = await canvas.toDataURL((err, url) => {
      if (err) throw err;
      console.log(url);
      next(url);
    });

    return dataUrl;
  };

  const generateLink = (isLive = false) => {
    const options = generateSaveOptions();

    isLive && canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    return dataUrl;
  };

  const saveJpg = () => {
    const options = generateSaveOptions();

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    const dataUrl = canvas.toDataURL(options);

    downloadFile(dataUrl, "jpg");
    autoZoom();
  };

  const saveJson = async (attributes: string[]) => {
    const dataUrl = canvas.toJSON(JSON_KEYS);

    await transformText(dataUrl.objects);
    const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          attributes,
          JSON: dataUrl,
        },
        null,
        "\t"
      )
    )}`;
    downloadFile(fileString, "json");
  };

  const loadJson = async (json: string) => {
    const data = JSON.parse(json);

    canvas.loadFromJSON(data, () => {
      console.log(data);
      autoZoom();
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    });
  };

  // Optimized barcode processing with batch operations
  const processBarcodeObjects = async () => {
    const barcodeObjects = canvas
      .getObjects()
      .filter(
        (object) => object instanceof fabric.Image && object.options?.isBarCode
      );

    if (barcodeObjects.length === 0) return;

    console.log(`Processing ${barcodeObjects.length} barcode objects`);

    // Process barcodes in parallel with limited concurrency
    const BATCH_SIZE = 3; // Limit concurrent requests
    const batches = [];

    for (let i = 0; i < barcodeObjects.length; i += BATCH_SIZE) {
      batches.push(barcodeObjects.slice(i, i + BATCH_SIZE));
    }

    for (const batch of batches) {
      await Promise.all(
        batch.map(async (object) => {
          try {
            const { value, barCodeType } = object.options || {};

            if (!value || !barCodeType) return;

            const apiUrl = `https://barcodeapi.org/api/${barCodeType}/${encodeURIComponent(
              value
            )}`;
            const response = await fetch(apiUrl, { cache: "no-store" });

            if (!response.ok) {
              console.error("Failed to fetch barcode:", response.statusText);
              return;
            }

            const blob = await response.blob();
            const fileName = `${barCodeType}:${value}-${Date.now()}.png`;
            const file = new File([blob], fileName, {
              type: blob.type,
              lastModified: Date.now(),
            });

            const { url: imageUrl, error } = await uploadFile(file, "image");

            if (error || !imageUrl) {
              console.error("Failed to upload barcode image:", error);
              return;
            }

            // Update the object's source with the new URL
            await new Promise<void>((resolve) => {
              object.setSrc(
                imageUrl,
                function (img) {
                  img.set({
                    left: object.left,
                    top: object.top,
                    height: object.height,
                    width: object.width,
                  });
                  resolve();
                },
                {
                  crossOrigin: "anonymous",
                }
              );
            });
          } catch (barcodeError) {
            console.error("Error processing barcode image:", barcodeError);
          }
        })
      );
    }

    canvas.renderAll();
  };

  // Optimized loadJsonAsync with better error handling and performance
  const loadJsonAsync = async (json: string): Promise<string> => {
    try {
      const data = JSON.parse(json);
      const options = generateSaveOptions();

      return await new Promise<string>((resolve, reject) => {
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
          reject(new Error("Canvas loading timeout"));
        }, 30000); // 30 second timeout

        canvas.loadFromJSON(data, async () => {
          try {
            clearTimeout(timeout);

            // Set viewport and zoom
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);

            // Process barcode objects if they exist
            await processBarcodeObjects();

            // Wait for images to load with shorter delay
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Generate the final data URL
            const dataUrl = canvas.toDataURL(options);
            resolve(dataUrl);
          } catch (canvasError) {
            clearTimeout(timeout);
            console.error("Error in loadJsonAsync:", canvasError);
            reject(canvasError);
          }
        });
      });
    } catch (error) {
      console.error("Error loading JSON:", error);
      throw error;
    }
  };

  // Batch processing method for multiple certificates
  const loadMultipleJsonAsync = async (
    jsonDataArray: Array<{ json: string; width: number; height: number }>
  ): Promise<string[]> => {
    const results: string[] = [];

    for (const { json, width, height } of jsonDataArray) {
      try {
        // Change canvas size only when needed
        const workspace = getWorkspace();
        const currentWidth = workspace?.width || 0;
        const currentHeight = workspace?.height || 0;

        if (currentWidth !== width || currentHeight !== height) {
          workspace?.set({ width, height });
        }

        const dataUrl = await loadJsonAsync(json);
        results.push(dataUrl);
      } catch (error) {
        console.error("Error processing certificate:", error);
        results.push(""); // Add empty string for failed certificates
      }
    }

    return results;
  };

  const getWorkspace = () => {
    return canvas.getObjects().find((object) => object.name === "clip");
  };

  const center = (object: fabric.Object) => {
    const workspace = getWorkspace();
    const center = workspace?.getCenterPoint();

    if (!center) return;

    // @ts-ignore
    canvas._centerObject(object, center);
  };

  const addToCanvas = (object: fabric.Object, selectable = true) => {
    center(object);
    if (!object.objectId) {
      object.objectId = nanoid(); // this line does not seem to persist
    }
    object.set({ selectable });
    canvas.add(object);

    canvas.setActiveObject(object);
  };

  return {
    generateLinkAsync,
    generateLink,
    savePdf,
    printPdf,
    savePng,
    saveJpg,
    saveSvg,
    saveJson,
    loadJson,
    loadJsonAsync,
    loadMultipleJsonAsync,
    canUndo,
    canRedo,
    autoZoom,
    getWorkspace,
    zoomIn: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio += 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio > 1 ? 1 : zoomRatio
      );
    },
    zoomOut: () => {
      let zoomRatio = canvas.getZoom();
      zoomRatio -= 0.05;
      const center = canvas.getCenter();
      canvas.zoomToPoint(
        new fabric.Point(center.left, center.top),
        zoomRatio < 0.2 ? 0.2 : zoomRatio
      );
    },

    changeSize: (value: { width: number; height: number }) => {
      const workspace = getWorkspace();

      workspace?.set(value);
      autoZoom();
      save();
    },
    changeBackground: (value: string) => {
      const workspace = getWorkspace();
      canvas
        .getObjects()
        .filter(
          (object) =>
            object instanceof fabric.Image &&
            (object.isBackground || !object.selectable)
        )
        .forEach((bgImage) => canvas.remove(bgImage));
      workspace?.set({ fill: value });
      canvas.renderAll();
      save();
    },
    changeBackgroundImage: (url: string) => {
      console.log(url);

      canvas.setBackgroundImage(url, canvas.renderAll.bind(canvas), {
        backgroundImageStretch: true,
      });

      canvas.renderAll();
      save();
    },
    enableDrawingMode: () => {
      canvas.discardActiveObject();
      canvas.renderAll();
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = strokeWidth;
      canvas.freeDrawingBrush.color = strokeColor;
    },
    disableDrawingMode: () => {
      canvas.isDrawingMode = false;
    },
    onUndo: () => undo(),
    onRedo: () => redo(),
    onCopy: () => copy(),
    onPaste: () => paste(),
    changeImageFilter: (value: string) => {
      const objects = canvas.getActiveObjects();
      objects.forEach((object) => {
        if (object.type === "image") {
          const imageObject = object as fabric.Image;

          const effect = createFilter(value);

          imageObject.filters = effect ? [effect] : [];
          imageObject.applyFilters();
          canvas.renderAll();
        }
      });
    },
    addImage: (value: string) => {
      const newImage =
        value === "#{placeholder_profile}#"
          ? "https://res.cloudinary.com/zikoro/image/upload/v1734007655/ZIKORO/image_placeholder_j25mn4.jpg"
          : value;

      console.log(newImage);

      fabric.Image.fromURL(
        newImage,
        (image) => {
          const workspace = getWorkspace();

          image.scaleToWidth(workspace?.width || 0);
          image.scaleToHeight(workspace?.height || 0);

          addToCanvas(image);
        },
        {
          crossOrigin: "anonymous",
        }
      );
    },
    changeImage: (value: string) => {
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (object.type === "image") {
          object.setSrc(
            value,
            function (img) {
              img.set({
                left: object.left,
                top: object.top,
                height: object.height,
                width: object.width,
              });
              console.log(img.src);
              canvas.renderAll();
            },
            {
              crossOrigin: "anonymous",
            }
          );
        }
      });

      canvas.renderAll();
    },
    addBackgroundImage: (value: string) => {
      console.log("Adding background image:", value);

      fabric.Image.fromURL(
        value,
        (image) => {
          const workspace = getWorkspace();
          if (!workspace) return;

          console.log(image);

          // Remove any existing background image
          canvas
            .getObjects()
            .filter(
              (object) =>
                object instanceof fabric.Image &&
                (object.isBackground || !object.selectable)
            )
            .forEach((bgImage) => {
              canvas.remove(bgImage);
            });

          // Mark the image as a background
          image.set({ isBackground: true });

          // Scale image to fit the workspace
          image.scaleToWidth(workspace.width || 1200);
          image.scaleToHeight(workspace.height || 900);

          console.log("final", image);

          // Add the image to canvas and send it to the back
          addToCanvas(image, false);
          canvas.sendToBack(image);

          // Ensure no object is active & re-render canvas
          canvas.discardActiveObject();
          canvas.renderAll();
          workspace?.sendToBack();
        },
        { crossOrigin: "anonymous" }
      );
    },
    addQRCode: async (
      value: string,
      color: string,
      bgcolor: string,
      type: z.infer<typeof barCodeTypeEnum>,
      barCodeFunction: string
    ) => {
      try {
        const url = `https://barcodeapi.org/api/${type}/${encodeURIComponent(
          value
        )}?bg=${rgbaToHex(bgcolor || "ffffff")}&fg=${rgbaToHex(
          color || "000000"
        )}`;

        console.log(url);
        const response = await fetch(url, { cache: "no-store" });

        const tokens = response.headers.get("X-RateLimit-Tokens");
        console.log("Tokens remaining: " + tokens);

        const blob = await response.blob();

        const blobUrl = new File(
          [blob],
          type + ":" + value + new Date().getUTCMilliseconds() + ".png",
          {
            type: blob.type,
            lastModified: Date.now(),
          }
        );

        console.log(blobUrl);

        const { url: imageUrl, error } = await uploadFile(blobUrl, "image");

        console.log(imageUrl);

        if (error) return;
        if (!imageUrl) return;

        fabric.Image.fromURL(
          imageUrl,
          (image) => {
            console.log(image);
            const workspace = getWorkspace();

            const assetId = generateAlphanumericHash();

            image.set({
              options: {
                bg: rgbaToHex(bgcolor || "ffffff"),
                fg: rgbaToHex(color || "000000"),
                barCodeType: type,
                isBarCode: true,
                value,
                barCodeFunction,
                assetId,
              },
            });

            console.log(image.options?.isBarCode);

            addToCanvas(image);
          },
          {
            crossOrigin: "anonymous",
          }
        );
      } catch (error) {
        console.log(error);
      }
    },
    transformBarCodes: async () => {
      await processBarcodeObjects();
    },
    clear: () => {
      canvas.clear();
      canvas.renderAll();
    },
    delete: () => {
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (object.type === "image") {
          const imageURL = object.getSrc();
          if (
            imageURL.includes(
              "https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=svg"
            )
          ) {
            toggleQRCode(false);
          }
        }

        canvas.remove(object);
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    },
    groupObjects: () => {
      const active = canvas.getActiveObject();

      // If it’s an ActiveSelection, convert it natively
      if (active && active.type === "activeSelection") {
        const group = (active as fabric.ActiveSelection).toGroup();
        canvas.setActiveObject(group);
        canvas.requestRenderAll();
        return;
      }

      // Otherwise, manually group any multiple selection
      const objects = canvas.getActiveObjects();
      if (objects.length < 2) return;

      const group = new fabric.Group(objects, {
        hasControls: false,
        lockScalingFlip: true,
      });

      // Clean up old objects & add the new group
      canvas.discardActiveObject();
      objects.forEach((obj) => canvas.remove(obj));
      addToCanvas(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
    },
    ungroupObjects: () => {
      const active = canvas.getActiveObject();
      if (!active) return;

      // Handle native toActiveSelection if it’s a Group
      if (active.type === "group") {
        const selection = (active as fabric.Group).toActiveSelection();
        canvas.setActiveObject(selection);
        canvas.requestRenderAll();
        return;
      }

      // If it’s already an ActiveSelection, do nothing
      if (active.type === "activeSelection") return;

      // Otherwise, check if multiple were somehow selected
      const objects = canvas.getActiveObjects();
      if (objects.length < 2) return;

      // Explode them: remove each from any group and re-add
      canvas.discardActiveObject();
      objects.forEach((obj) => {
        canvas.remove(obj);
        addToCanvas(obj);
      });
      const selection = new fabric.ActiveSelection(objects, { canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    },
    getAllObjects: () => {
      return [...canvas.getObjects()];
    },
    getActiveObject: () => {
      return canvas.getActiveObject();
    },
    selectObject: (object) => {
      canvas.setActiveObject(object);
      canvas.requestRenderAll();
    },
    deleteObject: (object) => {
      canvas.remove(object);
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    },
    addText: (value, options) => {
      const object = new fabric.Textbox(value, {
        ...TEXT_OPTIONS,
        fill: fillColor,
        ...options,
      });

      addToCanvas(object);
    },
    getActiveOpacity: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return 1;
      }

      const value = selectedObject.get("opacity") || 1;

      return value;
    },
    changeFontSize: (value: number) => {
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontSize: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontSize: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_SIZE;
      }

      // @ts-ignore
      const value = selectedObject.get("fontSize") || FONT_SIZE;

      return value;
    },
    changeTextAlign: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ textAlign: value });
        }
      });
      canvas.renderAll();
    },
    getActiveTextAlign: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "left";
      }

      // @ts-ignore
      const value = selectedObject.get("textAlign") || "left";

      return value;
    },
    changeFontUnderline: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ underline: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontUnderline: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      const value = selectedObject.get("underline") || false;

      return value;
    },
    changeFontLinethrough: (value: boolean) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ linethrough: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontLinethrough: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return false;
      }

      // @ts-ignore
      const value = selectedObject.get("linethrough") || false;

      return value;
    },
    changeFontStyle: (value: string) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontStyle: value });
        }
      });
      canvas.renderAll();
    },
    getActiveFontStyle: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return "normal";
      }

      // @ts-ignore
      const value = selectedObject.get("fontStyle") || "normal";

      return value;
    },
    changeFontWeight: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontWeight: value });
        }
      });
      canvas.renderAll();
    },
    changeOpacity: (value: number) => {
      canvas.getActiveObjects().forEach((object) => {
        object.set({ opacity: value });
      });
      canvas.renderAll();
    },
    bringForward: (obj) => {
      if (obj) {
        canvas.bringForward(obj);
      } else {
        canvas.getActiveObjects().forEach((object) => {
          canvas.bringForward(object);
        });
      }

      canvas.renderAll();

      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    sendBackwards: (obj) => {
      if (obj) {
        canvas.sendBackwards(obj);
      } else {
        canvas.getActiveObjects().forEach((object) => {
          canvas.sendBackwards(object);
        });
      }

      canvas.renderAll();
      const workspace = getWorkspace();
      workspace?.sendToBack();
    },
    changeFontFamily: (value: string) => {
      setFontFamily(value);
      canvas.getActiveObjects().forEach((object: fabric.Object) => {
        if (isTextType(object.type)) {
          // @ts-ignore
          object.set({ fontFamily: value });
        }
      });
      canvas.renderAll();
    },
    changeFillColor: (value: string) => {
      setFillColor(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ fill: value });
      });
      canvas.renderAll();
    },
    changeStrokeColor: (value: string) => {
      setStrokeColor(value);
      canvas.getActiveObjects().forEach((object) => {
        // Text types don't have stroke
        if (isTextType(object.type)) {
          object.set({ fill: value });
          return;
        }

        object.set({ stroke: value });
      });
      canvas.freeDrawingBrush.color = value;
      canvas.renderAll();
    },
    changeStrokeWidth: (value: number) => {
      setStrokeWidth(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeWidth: value });
      });
      canvas.freeDrawingBrush.width = value;
      canvas.renderAll();
    },
    changeStrokeDashArray: (value: number[]) => {
      setStrokeDashArray(value);
      canvas.getActiveObjects().forEach((object) => {
        object.set({ strokeDashArray: value });
      });
      canvas.renderAll();
    },
    addHorizontalLine: () => {
      const object = new fabric.Line([50, 100, 250, 100], {
        stroke: strokeColor,
        strokeWidth: 10,
        lockScalingY: true, // prevent vertical scale
        lockUniScaling: false, // allow independent X/Y, but X is locked
        hasBorders: true,
        strokeUniform: true,
      });

      object.setControlsVisibility({
        ml: true,
        mr: true,
        bl: true,
        br: true,
        tl: false,
        tr: false,
        mt: false,
        mb: false,
      });
      addToCanvas(object);
    },
    addVerticalLine: () => {
      const object = new fabric.Line([150, 50, 150, 250], {
        stroke: strokeColor,
        strokeWidth: 10,
        lockScalingX: true, // prevent horizontal scale
        lockUniScaling: false, // allow independent X/Y, but X is locked
        hasBorders: true,
        strokeUniform: true,
      });

      object.setControlsVisibility({
        ml: false,
        mr: false,
        bl: false,
        br: false,
        tl: true,
        tr: true,
        mt: true,
        mb: true,
      });

      addToCanvas(object);
    },
    addCircle: () => {
      const object = new fabric.Circle({
        ...CIRCLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addSoftRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        rx: 50,
        ry: 50,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addRectangle: () => {
      const object = new fabric.Rect({
        ...RECTANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addTriangle: () => {
      const object = new fabric.Triangle({
        ...TRIANGLE_OPTIONS,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        strokeDashArray: strokeDashArray,
      });

      addToCanvas(object);
    },
    addInverseTriangle: () => {
      const HEIGHT = TRIANGLE_OPTIONS.height;
      const WIDTH = TRIANGLE_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: 0, y: 0 },
          { x: WIDTH, y: 0 },
          { x: WIDTH / 2, y: HEIGHT },
        ],
        {
          ...TRIANGLE_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );

      addToCanvas(object);
    },
    addDiamond: () => {
      const HEIGHT = DIAMOND_OPTIONS.height;
      const WIDTH = DIAMOND_OPTIONS.width;

      const object = new fabric.Polygon(
        [
          { x: WIDTH / 2, y: 0 },
          { x: WIDTH, y: HEIGHT / 2 },
          { x: WIDTH / 2, y: HEIGHT },
          { x: 0, y: HEIGHT / 2 },
        ],
        {
          ...DIAMOND_OPTIONS,
          fill: fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          strokeDashArray: strokeDashArray,
        }
      );
      addToCanvas(object);
    },

    canvas,
    getActiveFontWeight: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return FONT_WEIGHT;
      }

      // @ts-ignore
      const value = selectedObject.get("fontWeight") || FONT_WEIGHT;

      return value;
    },
    getActiveFontFamily: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fontFamily;
      }

      // @ts-ignore
      const value = selectedObject.get("fontFamily") || fontFamily;

      return value;
    },
    getActiveFillColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return fillColor;
      }

      const value = selectedObject.get("fill") || fillColor;

      // Currently, gradients & patterns are not supported
      return value as string;
    },
    getActiveStrokeColor: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeColor;
      }

      const value = selectedObject.get("stroke") || strokeColor;

      return value;
    },
    getActiveStrokeWidth: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeWidth;
      }

      const value = selectedObject.get("strokeWidth") || strokeWidth;

      return value;
    },
    getActiveStrokeDashArray: () => {
      const selectedObject = selectedObjects[0];

      if (!selectedObject) {
        return strokeDashArray;
      }

      const value = selectedObject.get("strokeDashArray") || strokeDashArray;

      return value;
    },
    selectedObjects,
  };
};

export const useEditor = ({
  defaultState,
  defaultHeight,
  defaultWidth,
  clearSelectionCallback,
  saveCallback,
  toggleQRCode,
}: EditorHookProps) => {
  const initialState = useRef(defaultState);
  const initialWidth = useRef(defaultWidth);
  const initialHeight = useRef(defaultHeight);

  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

  const [fontFamily, setFontFamily] = useState(FONT_FAMILY);
  const [fillColor, setFillColor] = useState(FILL_COLOR);
  const [strokeColor, setStrokeColor] = useState(STROKE_COLOR);
  const [strokeWidth, setStrokeWidth] = useState(STROKE_WIDTH);
  const [strokeDashArray, setStrokeDashArray] =
    useState<number[]>(STROKE_DASH_ARRAY);

  useWindowEvents();

  const { save, canRedo, canUndo, undo, redo, canvasHistory, setHistoryIndex } =
    useHistory({
      canvas,
      saveCallback,
    });

  const { copy, paste } = useClipboard({ canvas });

  const { autoZoom } = useAutoResize({
    canvas,
    container,
  });

  useCanvasEvents({
    save,
    canvas,
    setSelectedObjects,
    clearSelectionCallback,
  });

  useHotkeys({
    undo,
    redo,
    copy,
    paste,
    save,
    canvas,
  });

  useLoadState({
    canvas,
    autoZoom,
    initialState,
    canvasHistory,
    setHistoryIndex,
  });

  const editor = useMemo(() => {
    if (canvas) {
      return buildEditor({
        save,
        undo,
        redo,
        canUndo,
        canRedo,
        autoZoom,
        copy,
        paste,
        canvas,
        fillColor,
        strokeWidth,
        strokeColor,
        setFillColor,
        setStrokeColor,
        setStrokeWidth,
        strokeDashArray,
        selectedObjects,
        setStrokeDashArray,
        fontFamily,
        setFontFamily,
        toggleQRCode,
      });
    }

    return undefined;
  }, [
    canRedo,
    canUndo,
    undo,
    redo,
    save,
    autoZoom,
    copy,
    paste,
    canvas,
    fillColor,
    strokeWidth,
    strokeColor,
    selectedObjects,
    strokeDashArray,
    fontFamily,
  ]);

  const init = useCallback(
    ({
      initialCanvas,
      initialContainer,
    }: {
      initialCanvas: fabric.Canvas;
      initialContainer: HTMLDivElement;
    }) => {
      fabric.Object.prototype.set({
        cornerColor: "#FFF",
        cornerStyle: "circle",
        borderColor: "#3b82f6",
        borderScaleFactor: 1.5,
        transparentCorners: false,
        borderOpacityWhenMoving: 1,
        cornerStrokeColor: "#3b82f6",
      });

      const initialWorkspace = new fabric.Rect({
        width: initialWidth.current,
        height: initialHeight.current,
        name: "clip",
        fill: "white",
        selectable: false,
        hasControls: false,
        shadow: new fabric.Shadow({
          color: "rgba(0,0,0,0.8)",
          blur: 5,
        }),
      });

      console.log(initialCanvas);

      initialCanvas.setWidth(initialContainer?.offsetWidth);
      initialCanvas.setHeight(initialContainer?.offsetHeight);

      initialCanvas.add(initialWorkspace);
      initialCanvas.centerObject(initialWorkspace);
      initialCanvas.clipPath = initialWorkspace;

      setCanvas(initialCanvas);
      setContainer(initialContainer);

      const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));
      canvasHistory.current = [currentState];
      setHistoryIndex(0);
    },
    [canvasHistory, setHistoryIndex]
  );

  return { init, editor };
};
